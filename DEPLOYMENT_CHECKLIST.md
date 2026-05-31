# Production Deployment Checklist – skola-ai (Letní škola AI)

Tento checklist musí být splněn před reálným spuštěním na produkci.

## 1. Kód a kvalita

- [x] `npm run build` projde bez chyb
- [x] `npm run check` (nebo `astro check`) nehlásí kritické chyby
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
- [ ] `RESEND_WEBHOOK_SECRET`
- [ ] `OPENROUTER_API_KEY`
- [ ] `FIO_API_TOKEN`
- [ ] `ADMIN_EMAIL`
- [x] `JWT_SECRET` (min. 32 znaků, náhodný)
- [x] `CRON_SECRET` (min. 32 znaků, náhodný)

Volitelné (monitoring):
- [ ] `BETTERSTACK_HEARTBEAT_*`

Volitelné (LLM routing):
- [ ] `OPENROUTER_MODEL` (výchozí je `openrouter/auto`)

## 4. Email infrastruktura (Resend)

- [ ] Doména `skola.aivefirmach.cz` (nebo finální) přidána v Resend
- [ ] SPF, DKIM, DMARC záznamy nastaveny a ověřeny
- [ ] Webhook nastaven na `https://<domena>/api/webhooks/resend`
- [ ] Webhook secret zkopírován do `RESEND_WEBHOOK_SECRET`

## 5. Companion Worker (crony)

- [x] `cron-worker/` nasazen: `cd cron-worker && wrangler deploy`
- [x] `wrangler.toml` v cron-worker obsahuje správné crony a `APP_URL`
- [x] `CRON_SECRET` nastaven i v companion workeru

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
- [ ] První admin účet vytvořen (přes bootstrap nebo ručně)

## 8. Testování před launchi

- [ ] End-to-end test na **staging** (nebo přes custom domain před přepnutím DNS):
  1. Registrace nového uživatele (magic link)
  2. Objednávka kurzu (i placeného)
  3. Simulace platby (nebo ruční označení jako zaplaceno)
  4. Doručení lekce (ruční spuštění cronu)
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
# Build + lokální test
npm run build && npm run dev:wrangler

# Nasazení hlavní aplikace
npm run build && wrangler deploy

# Nasazení companion workeru
npm --prefix cron-worker run deploy

# Spuštění cronu ručně (po nasazení)
curl -X POST https://skola.aivefirmach.cz/api/cron/send-lessons \
  -H "X-Cron-Secret: $CRON_SECRET"

# Migrace D1
wrangler d1 execute skola-ai-db --remote --file=./db/migrations/0001_initial.sql
```

---

**Poslední kontrola před spuštěním**:  
Projdi tento checklist s někým dalším (nebo sám po 24h pauze). Spěch je nepřítel produkce.
