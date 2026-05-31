# Lokální vývoj – Letní škola AI (toodle)

Tento dokument popisuje, jak spustit projekt lokálně s plnou Cloudflare emulací (D1 + R2 + Bindings).

## Požadavky

- Node.js >= 22.12
- Wrangler CLI (nainstalován jako dependency)
- (Volitelně) účet na Resend, OpenRouter, FIO pro reálné testy

## Rychlý start (doporučený způsob)

```bash
# 1. Instalace závislostí
npm install

# 2. Vytvoř .env.local z příkladu
cp .env.example .env.local
# Uprav .env.local – alespoň APP_URL a JWT_SECRET + CRON_SECRET

# 3. Build projektu (vytvoří dist/)
npm run build

# 4. Spuštění s plnou Cloudflare emulací (D1 + R2 v paměti)
npm run dev:wrangler
```

Aplikace poběží na `http://localhost:8788`.

## Dostupné npm skripty

| Skript                | Popis |
|-----------------------|-------|
| `npm run dev`         | Klasický Astro dev server (bez D1/R2 bindingů) |
| `npm run build`       | Produkční build do `dist/` |
| `npm run preview`     | Preview buildu |
| `npm run dev:wrangler`| **Doporučeno** – wrangler pages dev s lokální D1 + R2 emulací |
| `npm run check`       | Type checking přes Astro |
| `npm run generate-types` | Vygeneruje Cloudflare types |

## Lokální databáze a storage (D1 + R2)

Wrangler automaticky vytváří dočasné D1 databáze a R2 buckety v paměti při spuštění `wrangler pages dev`.

Po restartu se data ztratí (to je v lokálním vývoji normální).

### Trvalá lokální D1 (volitelné)

Pokud chceš data přežít restart:

```bash
npx wrangler d1 create toodle-local --experimental-remote  # nebo lokálně
# Pak uprav příkaz v package.json nebo spusť ručně s --d1=...
```

## První admin účet

Po prvním spuštění nemáš žádného admina.

### Možnost A – Bootstrap endpoint (doporučeno)

Viz `src/pages/api/admin/bootstrap.ts` (musí být implementován – viz níže).

### Možnost B – Ruční vložení přes SQL

```bash
npx wrangler d1 execute toodle-local --local --command "
  INSERT INTO users (id, email, name, verified_at) 
  VALUES ('ulid-here', 'tvuj@email.cz', 'Patrick', datetime('now'));
"
```

## Důležitá omezení lokálního vývoje

- Email (Resend) – lokálně se neposílá (nebo použij testovací klíč)
- FIO API – reálné volání na banku (pozor na limity)
- LLM (OpenRouter) – reálné volání (může stát peníze)
- Crony – lokálně se nespouštějí automaticky (musíš je volat ručně přes curl s `CRON_SECRET`)

Příklad ručního spuštění cronu:

```bash
curl -X POST http://localhost:8788/api/cron/send-lessons \
  -H "X-Cron-Secret: $CRON_SECRET"
```

## Řešení častých problémů

**"Astro.locals.runtime.env has been removed"**

→ V novém kódu nepoužívej `locals.runtime.env`; používej `@lib/env`, který čte Cloudflare bindings přes `cloudflare:workers`.

**Build selže na typech**

```bash
npm run check
```

**Chceš reálnou D1 databázi lokálně**

Použij `wrangler d1 execute ... --local --file=db/migrations/0001_initial.sql`

## Další kroky po lokálním spuštění

1. Vytvoř si prvního admina
2. Přidej minimálně jeden kurz přes `/admin/kurzy/novy`
3. Otestuj celý flow (registrace → objednávka → "platba" → lekce → test → certifikát)
4. Až vše funguje lokálně → pokračuj podle `DEPLOYMENT_CHECKLIST.md`

---

**Poznámka pro vývojáře**: Při přidávání nových API routes a Astro stránek drž jednotný pattern `import { env } from '@lib/env'`.
