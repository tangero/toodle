# Implementační plán — Letní škola AI

Na základě PRD a upřesnění. Kód je z velké části implementován,
tento plán pokrývá zbývající práce do production launche.

---

## Fáze A: Opravy a doplnění kódu

### A1. Časové zóny cronů
Cron `0 7 * * 1-5` doručuje v UTC. Pro 7:00 CET/CEST:
- Léto (CEST, UTC+2): cron `0 5 * * 1-5`
- Zima (CET, UTC+1): cron `0 6 * * 1-5`

Řešení: nastavit cron na `0 5 * * 1-5` (léto) a manuálně
přepínat při změně času, NEBO použít v send-lessons logiku,
která kontroluje český čas a skipne, pokud ještě není 7:00 CET.

**Rozhodnutí**: Implementovat v kódu kontrolu českého času —
cron pojede každou hodinu `0 * * * 1-5` a send-lessons si sám
ověří, jestli je v Česku >= 7:00 a ještě neodesílal.

### A2. Konfigurace emailu
- From: `patrick@skola.aivefirmach.cz`
- ADMIN_EMAIL: `patrick@zandl.cz`
- Aktualizovat `wrangler.jsonc` vars MAIL_FROM

### A3. Upload obrázků v lesson editoru
- Nový API endpoint `POST /api/admin/upload` — přijme soubor,
  uloží do R2 s klíčem `images/{ulid}.{ext}`, vrátí public URL
- V LessonEditor.tsx přidat tlačítko "Vložit obrázek" —
  otevře file picker, uploadne, vloží Markdown `![](url)` do editoru
- Serving: `GET /api/images/[key]` — čte z R2, vrací s cache headers

### A4. Opakování testu
- Odstranit blokaci `enrollment.score !== null` v submit endpointu
- Při opakování přepsat score na enrollmentu nejlepším výsledkem
- Nový certifikát vydávat jen pokud score > předchozí nebo žádný cert

### A5. Companion Worker (cron triggery)
Nový adresář `cron-worker/` v monorepu:
```
cron-worker/
├── wrangler.toml
├── src/
│   └── index.ts    # scheduled handler, volá API endpointy
└── package.json
```
Jeden Worker s jedním `scheduled` handlerem, který podle cron
expression volá příslušný endpoint hlavní aplikace s `X-Cron-Secret`.

### A6. Monitoring a error handling
- **BetterStack Uptime**: heartbeat monitoring na cron endpointy
  (každý cron po dokončení pošle heartbeat na BetterStack URL)
- **BetterStack Logs**: strukturované logování chyb přes
  `console.error()` + Cloudflare Logpush do BetterStack
- **Health endpoint**: `GET /api/health` — kontrola DB connectivity,
  vrací status + timestamp, BetterStack na něj pingne
- **Cron heartbeats**: po každém úspěšném běhu cronu odešle
  fetch na BetterStack heartbeat URL (jeden heartbeat per cron job)
- **Alert pravidla v BetterStack**:
  - Health endpoint nedostupný > 2 min → alert
  - Cron heartbeat chybí > 2× interval → alert
  - Error rate v logách > threshold → alert

---

## Fáze B: Cloudflare infrastruktura

### B1. Vytvořit D1 databázi
```bash
wrangler d1 create letni-skola-ai-db
```
→ aktualizovat `database_id` ve `wrangler.jsonc`

### B2. Spustit migraci
```bash
wrangler d1 execute letni-skola-ai-db --file=./db/migrations/0001_initial.sql
```

### B3. Vytvořit R2 bucket
```bash
wrangler r2 bucket create letni-skola-ai-storage
```

### B4. Nastavit secrets
```bash
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_WEBHOOK_SECRET
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put FIO_API_TOKEN
wrangler secret put ADMIN_EMAIL          # patrick@zandl.cz
wrangler secret put JWT_SECRET           # vygenerovat: openssl rand -hex 32
wrangler secret put CRON_SECRET          # vygenerovat: openssl rand -hex 32
wrangler secret put BETTERSTACK_HEARTBEAT_LESSONS
wrangler secret put BETTERSTACK_HEARTBEAT_PAYMENTS
wrangler secret put BETTERSTACK_HEARTBEAT_REMINDERS
wrangler secret put BETTERSTACK_HEARTBEAT_DIGEST
```

### B5. DNS a doména
- Přidat `skola.aivefirmach.cz` jako custom domain v Cloudflare Pages
- Nastavit DNS CNAME záznamy

---

## Fáze C: Email setup (Resend)

### C1. Přidat doménu v Resend
- Doména: `skola.aivefirmach.cz`
- Nastavit SPF, DKIM, DMARC DNS záznamy dle Resend instrukcí
- Ověřit doménu

### C2. Nastavit webhook
- URL: `https://skola.aivefirmach.cz/api/webhooks/resend`
- Events: `email.delivered`, `email.opened`, `email.clicked`,
  `email.bounced`, `email.complained`
- Zkopírovat signing secret do `RESEND_WEBHOOK_SECRET`

---

## Fáze D: Companion Worker deploy

### D1. Vytvořit cron-worker
Separátní wrangler.toml s cron triggery, Service Binding
na hlavní aplikaci (nebo fetch na veřejnou URL s CRON_SECRET).

### D2. Deploy
```bash
cd cron-worker && wrangler deploy
```

---

## Fáze E: BetterStack monitoring

### E1. Uptime monitors
- Health check: `GET https://skola.aivefirmach.cz/api/health` (interval 1 min)
- Homepage: `GET https://skola.aivefirmach.cz/` (interval 5 min)

### E2. Heartbeat monitors
Vytvořit 4 heartbeaty v BetterStack (jeden per cron):
- send-lessons (expected every workday)
- match-payments (expected every 30 min)
- reminders (expected daily)
- admin-digest (expected daily)

### E3. Logpush (volitelné)
Cloudflare Logpush → BetterStack Logs pro Workers chyby.

---

## Fáze F: Testování a launch

### F1. Smoke test na staging
- Vytvořit testovací kurz přes admin
- Projít celý flow: registrace → objednávka → platba →
  doručení lekce → test → certifikát
- Ověřit email delivery (SPF/DKIM pass)
- Ověřit webhook tracking

### F2. Vložení kurzů
- Patrick vloží "AI pro začátečníky" a "AI pro firmy"
  přes `/admin/kurzy/novy`
- Vyplnit lekce, testy, welcome/completion emaily
- Publikovat

### F3. Production deploy
```bash
wrangler pages deploy
```

### F4. Go-live checklist
- [ ] D1 databáze vytvořena a migrována
- [ ] R2 bucket vytvořen
- [ ] Všechny secrets nastaveny
- [ ] DNS záznamy propagovány
- [ ] Resend doména ověřena + webhook nastaven
- [ ] Companion Worker nasazen
- [ ] BetterStack monitoring aktivní
- [ ] Testovací flow projitý end-to-end
- [ ] Alespoň 1 kurz publikován
- [ ] Admin digest email přišel

---

## Pořadí implementace zbývajících prací

| # | Úkol | Závislosti | Odhad |
|---|------|-----------|-------|
| 1 | A2: aktualizace email/admin konfigurace | — | 10 min |
| 2 | A1: timezone logika v send-lessons | — | 30 min |
| 3 | A3: upload obrázků (API + editor) | — | 2h |
| 4 | A4: opakování testu | — | 30 min |
| 5 | A5: companion worker | — | 1h |
| 6 | A6: health endpoint + heartbeaty | — | 1h |
| 7 | B1-B5: Cloudflare infra setup | Cloudflare účet | 30 min |
| 8 | C1-C2: Resend setup | DNS přístup | 30 min |
| 9 | D1-D2: companion worker deploy | B4, A5 | 15 min |
| 10 | E1-E3: BetterStack setup | BetterStack účet | 30 min |
| 11 | F1: smoke test | vše výše | 1h |
| 12 | F2: vložení kurzů | F1 | Patrick |
| 13 | F3-F4: production launch | F2 | 15 min |

**Celkový zbývající odhad kódování**: ~5-6 hodin
**Celkový odhad infra setup**: ~2 hodiny
