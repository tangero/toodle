# Production Deployment Checklist – skola-ai (Letní škola AI)

Tento checklist musí být splněn před reálným spuštěním na produkci.

## 1. Kód a kvalita

- [x] `npm run build` projde bez chyb
- [x] `npm run check` (nebo `astro check`) nehlásí kritické chyby
- [x] `npm test` (unit testy) projde
- [ ] Žádné `console.log` s citlivými daty v produkčním kódu
- [ ] Všechny TODO/FIXME v kódu jsou zdokumentovány s datem a prioritou

**Poznámka k Astro v6**:  
Kód používá centrální helper `@lib/env`, který čte Cloudflare bindings přes `cloudflare:workers`.

## 2. Cloudflare infrastruktura

- [x] D1 databáze vytvořena: `wrangler d1 create skola-ai-db`
- [x] `database_id` aktualizován ve `wrangler.jsonc`
- [x] R2 bucket vytvořen: `wrangler r2 bucket create skola-ai-storage`
- [x] Worker `skola-ai` nasazen přes `wrangler deploy`
- [ ] Custom domain `skola.aivefirmach.cz` (nebo finální doména) přidána a DNS propagováno
- [x] `wrangler.jsonc` obsahuje správné `vars` (APP_URL, MAIL_FROM)

## 3. Secrets (všechny přes `wrangler secret put`)

Povinné:
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_WEBHOOK_SECRET` – bez něj webhook vrací 503 (nepodepsané požadavky se nepřijímají)
- [ ] `OPENROUTER_API_KEY`
- [ ] (až budou placené kurzy) `FIO_API_TOKEN` – bez něj se párování plateb přeskočí
- [ ] `ADMIN_EMAIL`
- [x] `JWT_SECRET` (min. 32 znaků, náhodný)
- [x] `CRON_SECRET` (min. 32 znaků, náhodný)

Volitelné (monitoring):
- [ ] `BETTERSTACK_HEARTBEAT_*`

Volitelné (LLM routing):
- [ ] `OPENROUTER_MODEL` – doporučeno nastavit konkrétní model (výchozí `openrouter/auto` mění model a cenu podle dotazu)

Nikdy v produkci: `EMAIL_DEV_LOG` (vypne odesílání e-mailů).

## 4. Email infrastruktura (Resend)

- [ ] Doména `skola.aivefirmach.cz` (nebo finální) přidána v Resend
- [ ] SPF, DKIM, DMARC záznamy nastaveny a ověřeny
- [ ] Webhook nastaven na `https://<domena>/api/webhooks/resend`
- [ ] Webhook secret zkopírován do `RESEND_WEBHOOK_SECRET`

## 5. Crony a databáze

Crony běží přímo v hlavním Workeru (`scheduled` handler v `src/worker.ts`, výrazy v `wrangler.jsonc` → `triggers.crons`). Samostatný cron worker už neexistuje.

- [x] Starý worker smazán: `npx wrangler delete skola-ai-cron` – jinak by crony běžely dvakrát
- [x] Migrace aplikovány: `npx wrangler d1 migrations apply skola-ai-db --remote`
  (pokud byla 0001 nahraná dřív ručně přes `d1 execute`, zapiš ji nejdřív do tabulky `d1_migrations`, viz Rychlé příkazy)
- [x] Rate limiter `RATE_LIMITER` (binding `ratelimits` ve `wrangler.jsonc`) je po deployi aktivní
- [ ] Po prvním dni zkontrolovat v logu Workeru `send-lessons {"due":…,"sent":…}`

## 6. Monitoring (doporučeno)

- [x] Health endpoint dostupný: `GET https://skola-ai.zandl.workers.dev/api/health`
- [ ] BetterStack (nebo alternativa) monitoruje:
  - Health endpoint (každou minutu)
  - Homepage
  - 4× heartbeat pro crony
- [ ] Alerty nastaveny na selhání cronů > 1–2 intervaly

## 7. Obsah a data

- [ ] Minimálně 1 kurz publikován přes `/admin/kurzy/novy`
- [ ] Lekce + testy vyplněny
- [ ] Welcome a Completion emaily nastaveny
- [ ] První admin účet vložen do D1 ručně (`ADMIN_EMAIL`, viz LOCAL_DEVELOPMENT.md) – bootstrap endpoint byl odstraněn

## 8. Testování před launchi

- [ ] End-to-end test na **staging** (nebo přes custom domain před přepnutím DNS):
  1. Zápis do kurzu bez přihlášení → potvrzovací e-mail → potvrzení → uvítací e-mail
  2. Přihlášení existujícího uživatele (magic link)
  3. Doručení lekce (ruční spuštění cronu) a „Hotovo“ u on-click kurzu
  4. Odhlášení z kurzu odkazem v e-mailu i tlačítkem „Odhlásit“ v Gmailu (List-Unsubscribe)
  5. Vyplnění testu (včetně LLM hodnocení)
  6. Vydání certifikátu + veřejný odkaz
- [ ] Email doručitelnost otestována (SPF/DKIM pass)
- [ ] Resend webhooky přijímají data (delivered, opened, clicked, bounced)
- [ ] Admin digest email přišel

## 9. Bezpečnost

- [x] `JWT_SECRET` a `CRON_SECRET` jsou silné a unikátní
- [ ] Admin přístup je omezen pouze na `ADMIN_EMAIL`
- [ ] GDPR endpointy (`/api/gdpr/*`) funkční a otestované
- [ ] Žádné citlivé informace v client-side kódu

## 10. Go-live

- [ ] DNS přepnuto na Cloudflare Worker
- [x] Všechny crony aktivní v Cloudflare dashboardu
- [ ] První lekce skutečně odeslána plánovačem
- [ ] Admin dashboard přístupný a funkční
- [ ] Rollback plán připraven (předchozí verze nebo snapshot D1)

---

## Rychlé příkazy (po nastavení)

```bash
# Lokální test
npm test && npm run dev:wrangler

# Nasazení hlavní aplikace
npm run build && wrangler deploy

# Jednorázově: smazat starý cron worker (crony jsou teď v hlavním Workeru)
npx wrangler delete skola-ai-cron

# Spuštění cronu ručně (po nasazení)
curl -X POST https://skola.aivefirmach.cz/api/cron/send-lessons \
  -H "X-Cron-Secret: $CRON_SECRET"

# Migrace D1 (před deployem nové verze)
npx wrangler d1 migrations apply skola-ai-db --remote

# Jen pokud 0001 už v produkci je (nahraná ručně) a d1_migrations ji nezná:
npx wrangler d1 execute skola-ai-db --remote --command \
  "CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP); INSERT OR IGNORE INTO d1_migrations (name) VALUES ('0001_initial.sql');"
```

---

**Poslední kontrola před spuštěním**:  
Projdi tento checklist s někým dalším (nebo sám po 24h pauze). Spěch je nepřítel produkce.
