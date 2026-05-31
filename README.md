# Letní škola AI – skola-ai

Moderní implementace emailového kurzu na Astro + Cloudflare (D1 + R2).

## Rychlý start pro vývojáře

```bash
npm install
cp .env.example .env.local   # uprav hodnoty
npm run build
npm run dev:wrangler         # doporučený lokální server s D1/R2 emulací
```

## Důležité dokumenty

- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) – jak spustit lokálně s plnou emulací
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) – kompletní checklist před produkčním launchi
- [docs/PRD.md](./docs/PRD.md) – produktové požadavky
- [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) – historický plán implementace

## Technologický stack

- Astro 6 + React (admin část)
- Cloudflare Pages + Workers
- Cloudflare D1 (databáze)
- Cloudflare R2 (soubory, certifikáty)
- Resend (email)
- OpenRouter (dynamický výběr modelu pro hodnocení otevřených otázek)
- FIO API (automatické párování plateb)

## Důležitá poznámka

Projekt používá Cloudflare bindings přes centrální helper `@lib/env`.

Viz `LOCAL_DEVELOPMENT.md` pro detaily.

## Go-live checklist

Před spuštěním na reálné doméně projdi celý [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md).
