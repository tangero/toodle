# Lokální vývoj – Letní škola AI

Projekt běží jako Cloudflare Worker (Astro 6 + `@astrojs/cloudflare`). Lokálně ho spouští `wrangler dev` s emulací D1, R2 a rate limiteru.

## Požadavky

- Node.js >= 22.12
- Wrangler (je v devDependencies)

## Rychlý start

```bash
npm install

# Proměnné prostředí – wrangler je čte ze souboru .dev.vars (je v .gitignore)
cp .env.example .dev.vars
# Vyplň alespoň JWT_SECRET, CRON_SECRET, ADMIN_EMAIL. EMAIL_DEV_LOG=1 nechej zapnuté.

# Lokální D1: aplikuje všechny migrace z db/migrations (sleduje, které už proběhly)
npm run db:migrate:local

# Build + wrangler dev na http://localhost:8788
npm run dev:wrangler
```

Data lokální D1 a R2 jsou v `.wrangler/state` a přežijí restart.

## npm skripty

| Skript | Popis |
|---|---|
| `npm run dev:wrangler` | **Doporučeno** – build a `wrangler dev` s D1, R2 a rate limiterem |
| `npm run dev` | Astro dev server bez D1/R2 – stránky sahající do DB nefungují |
| `npm run db:migrate:local` | Aplikuje migrace do lokální D1 |
| `npm test` | Unit testy (vitest) – časy doručení, escapování, certifikát, LLM |
| `npm run check` | Typová kontrola (`astro check`) |
| `npm run build` | Produkční build do `dist/` |
| `npm run generate-types` | Vygeneruje `worker-configuration.d.ts` |

## E-maily lokálně

S `EMAIL_DEV_LOG=1` se e-maily neodesílají. Do konzole wrangleru se vypíše řádek `[email:dev] … → příjemce | předmět` a HTML těla (`[email:dev-body]`), včetně přihlašovacích a potvrzovacích odkazů. Bez této proměnné a se skutečným `RESEND_API_KEY` e-maily opravdu odejdou.

## První admin

Admin je uživatel s e-mailem z `ADMIN_EMAIL`. Stačí se přihlásit na `/prihlaseni`. Přihlašovací odkaz se ale posílá jen existujícím účtům, takže admina je potřeba nejdřív vložit:

```bash
npx wrangler d1 execute skola-ai-db --local --persist-to .wrangler/state --command \
  "INSERT INTO users (id, email, name, verified_at) VALUES ('admin-1', 'tvuj@email.cz', 'Admin', datetime('now'))"
```

## Crony

V produkci je spouští Cloudflare přímo ve stejném Workeru (`scheduled` handler v `src/worker.ts`, výrazy v `wrangler.jsonc` → `triggers.crons`). Lokálně se cron endpointy volají ručně:

```bash
curl -X POST http://localhost:8788/api/cron/send-lessons -H "X-Cron-Secret: $CRON_SECRET"
# další: reminders, expire-orders, cleanup, admin-digest, match-payments
```

`wrangler dev --test-scheduled` (`/__scheduled?cron=…`) se sestaveným `dist/server/wrangler.json` nefunguje: požadavek dostane Astro a vrátí 404. Nejspíš je to kvůli `no_bundle`. Kopie konfigurace bez `no_bundle` a `rules` scheduled handler spustí:

```bash
cd dist/server && python3 -c "import json;d=json.load(open('wrangler.json'));[d.pop(k,None) for k in ('no_bundle','rules')];json.dump(d,open('wrangler.sched.json','w'))"
npx wrangler dev --config wrangler.sched.json --port 8797 --test-scheduled --env-file ../../.dev.vars --persist-to ../../.wrangler/state
curl "http://localhost:8797/__scheduled?cron=0+7+*+*+*"
```

## Omezení

- OpenRouter (hodnocení otevřených otázek) volá reálné API a stojí peníze. Bez `OPENROUTER_API_KEY` vrátí test s otevřenými otázkami 503.
- FIO: bez `FIO_API_TOKEN` se párování plateb přeskočí (kurzy jsou zatím zdarma).
- Rate limiter je lokálně emulovaný (10 požadavků / 60 s na IP).

## Časté problémy

**„Astro.locals.runtime.env has been removed“** – používej `import { env } from '@lib/env'`.

**Změna schématu DB** – přidej novou migraci `db/migrations/000N_*.sql`, srovnej `db/schema.sql` a spusť `npm run db:migrate:local`.
