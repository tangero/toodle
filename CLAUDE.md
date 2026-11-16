# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

Škola AI (`skola.aivefirmach.cz`) – platforma pro e-mailové kurzy s postupným doručováním lekcí. Uživatel si objedná kurz (zdarma nebo placený převodem), dostává lekce e-mailem, na konci vyplní test (otevřené otázky hodnotí LLM) a získá PDF certifikát s veřejně ověřitelným QR kódem. UI, texty, komentáře i dokumentace jsou česky. Značka je jen „Škola AI“ (dřívější „Letní škola AI“ se nepoužívá) a web, e-maily i lekce čtenáři **vykají**.

**Na začátku session si přečti `docs/todo.md` → `## Kde jsme skončili` a navaž na první krok.** Rozhodnutí s důvody jsou v `docs/decisions.md`, záludnosti v `docs/gotchas.md`.

Produktové požadavky: `docs/PRD.md`. Lokální vývoj: `LOCAL_DEVELOPMENT.md`. Stav před produkčním spuštěním: `DEPLOYMENT_CHECKLIST.md`.

## Příkazy

```bash
npm run build            # astro build → dist/
npm run check            # astro check (typová kontrola)
npm test                 # vitest – tests/*.test.ts; jeden soubor: npx vitest run tests/time.test.ts
npm run dev:wrangler     # build + wrangler dev na :8788 s lokální D1/R2/rate limiterem (doporučeno), env z .dev.vars
npm run db:migrate:local # aplikuje db/migrations do lokální D1 (.wrangler/state)
npm run dev              # astro dev – BEZ D1/R2 bindingů, stránky sahající do DB nefungují
npm run generate-types   # wrangler types → worker-configuration.d.ts
```

- `.dev.vars` vznikne z `.env.example`. `EMAIL_DEV_LOG=1` e-maily neodesílá, jen je vypíše do konzole i s odkazy (`[email:dev]`).
- Lokálně se crony volají ručně: `curl -X POST http://localhost:8788/api/cron/send-lessons -H "X-Cron-Secret: $CRON_SECRET"`. `wrangler dev --test-scheduled` se sestaveným buildem nefunguje, nejspíš kvůli `no_bundle` (obejití popisuje LOCAL_DEVELOPMENT.md).
- Produkce: `npx wrangler d1 migrations apply skola-ai-db --remote`, pak `npm run build && npx wrangler deploy`. Postup a secrets popisuje `DEPLOYMENT_CHECKLIST.md`.
- Pozor: OpenRouter (hodnocení testů) se volá naostro a stojí peníze.

## Architektura

**Astro 6 v režimu `output: 'server'` na Cloudflare Workers** (`@astrojs/cloudflare`). PRD místy zmiňuje Cloudflare Pages, ve skutečnosti jde o Worker s vlastním vstupem `src/worker.ts`: `fetch` předává Astro `handle()` a `scheduled` obsluhuje crony. Statické assets jsou z `dist/client`.

- **Přístup k env a bindingům výhradně přes `import { env } from '@lib/env'`** (obaluje `cloudflare:workers`, typ `AppEnv`). `locals.runtime.env` v Astro 6 vyhazuje výjimku (viz `MIGRATION_NEEDED.md`). Nové secrets a bindingy patří do `AppEnv` v `src/lib/env.ts`.
- **Aliasy** `@lib/*`, `@components/*` a `@layouts/*` jsou definované třikrát: v `tsconfig.json`, ve `vite.resolve.alias` v `astro.config.mjs` a ve `vitest.config.ts`.
- **Databáze D1** bez ORM: tenké helpery `getOne` / `getAll` / `run` v `src/lib/db.ts` (`run` vrací `meta.changes`, používá se pro podmíněné „claim“ UPDATE). Víc příkazů atomicky → `env.DB.batch()`. ID jsou ULID (`generateId()`).
  - **Časy se ukládají ve formátu SQLite `YYYY-MM-DD HH:MM:SS` (UTC)**, vždy přes `toSqlDateTime()` z `src/lib/time.ts`, porovnávají se `datetime(col) <= datetime('now')`. ISO formát s `T` se s `datetime('now')` textově porovnává špatně.
  - Schéma: migrace v `db/migrations/` (wrangler `migrations_dir`), souhrn v `db/schema.sql`. Při změně přidat novou migraci a srovnat `schema.sql`. Foreign keys se v D1 vynucují.
- **Autentizace** (`src/lib/auth.ts`): magic link (login 15 min, potvrzení zápisu 48 h, max. 3 za hodinu na uživatele). Potvrzovací odkaz zápisu nese `magic_links.enrollment_id` a spustí jen ten jeden kurz (`activateConfirmedEnrollment`); běžné přihlášení žádný čekající zápis nespouští, protože ho pod cizí adresou mohl založit kdokoli. V DB je jen SHA-256 hash tokenu. Odkaz v e-mailu vede na potvrzovací stránku `/prihlaseni/potvrzeni` a token se spotřebuje až POSTem na `/api/auth/verify`, takže ho nespotřebují skenery pošty. Session je JWT v cookie (HMAC-SHA256, 7 dní, `SameSite=Lax`). Login posílá odkaz jen existujícím účtům, ale navenek vrací vždy stejnou odpověď. Admin je jediný e-mail z `ADMIN_EMAIL`, role v DB nejsou.
- **Middleware** (`src/middleware.ts`): kontrola `Origin` u ne-GET požadavků (náhrada za Astro `checkOrigin`, který je vypnutý). Výjimkou jsou `/api/unsubscribe/`, `/api/webhooks/` a `/api/cron/`. Chrání `/profil/*`, `/test/*`, `/admin/*` a `/api/admin/*` a přidává bezpečnostní hlavičky. Pro statické soubory je má `public/_headers`.
- **Zápis do kurzu** (`/api/orders/create`): přihlášenému se bezplatný kurz aktivuje hned. Nepřihlášenému vznikne `pending` zápis a jde potvrzovací e-mail (double opt-in); aktivuje ho až potvrzení (`activatePendingFreeEnrollments`). Zrušený zápis se při novém zápisu obnoví (UNIQUE user+course).
- **Doručování lekcí** – jádro je v `src/lib/enrollment.ts`:
  - `deliverNextLesson()` nejdřív podmíněným UPDATE „zabere“ řádek (posune `current_lesson` a `next_send_at`) a zamkne ho sloupcem `sending_at` (zámek starší 10 minut je opuštěný), pak odešle s Resend `Idempotency-Key` a hlavičkami List-Unsubscribe a zámek uvolní. Když odeslání selže, změnu vrátí, ale stav změněný mezitím uživatelem (pozastavení, odhlášení) nepřepíše. Klíče obsahují `enrollments.run_no`, který roste při opakovaném zápisu.
  - Režim `next_workday`: cron `send-lessons` bere `active` zápisy s prošlým `next_send_at`. Další termín počítá `nextDeliverySlot()` (`time.ts`): příští pracovní den v 7:00 pražského času, svátky neřeší.
  - Režim `on_click`: tlačítko „Hotovo“ → `/api/enrollments/[id]/done`.
  - Stavy zápisu: `pending` → `active` ⇄ `paused`, `active` → `stalled` (připomínka po 3 dnech nečinnosti u on_click), dále `completed` a `cancelled`.
- **Crony**: výrazy jsou ve `wrangler.jsonc` → `triggers.crons` a musí sedět s `CRON_MAP` v `src/worker.ts`. Handler volá `/api/cron/*` interně přes `handle()` s `X-Cron-Secret` a po úspěchu pingne volitelný BetterStack heartbeat. Časy jsou v UTC, `send-lessons` běží v 05, 06 a 07 UTC, aby pokryl CET i CEST. Každý cron endpoint musí ověřovat secret přes `isCronAuthorized()` (`src/lib/cron.ts`). `cleanup` maže prošlé magic linky a audit log starší 2 let.
- **Platby** se zatím nepoužívají (všechny kurzy jsou zdarma). Kód pro FIO (`src/lib/fio.ts`, `match-payments`, `expire-orders`) zůstává, ale bez `FIO_API_TOKEN` scheduled handler párování přeskočí.
- **E-maily**: `sendEmail` v `src/lib/email.ts` (Resend, timeout, `idempotencyKey`, vlastní `headers`). Šablony jsou TS funkce v `src/lib/email-templates/` nad `base.ts`. **Všechna data od uživatele (jméno, názvy) se escapují přes `escapeHtml` (`src/lib/escape.ts`)**. Markdown z DB renderuje `src/lib/markdown.ts` (marked + regexový whitelist tagů). Odhlášení: HMAC token (`src/lib/unsubscribe.ts`). `/odhlaseni/[token]` na GET jen zobrazí potvrzení a odhlásí až POST; `/api/unsubscribe/[token]` je one-click POST pro poštovní klienty. Webhook `/api/webhooks/resend` vyžaduje podpis (Svix) a čerstvý timestamp. Do `email_log` se zapisují lekce, připomínky, uvítací, závěrečné a certifikátové e-maily (`logEmail`).
- **Testy a certifikáty**: `/api/test/submit` hodnotí otevřené otázky přes OpenRouter (`src/lib/llm.ts`). Při jakékoli chybě LLM vrací 503 a pokus neukládá, body se „naslepo“ nepřidělují. Limit je 5 pokusů za 24 h. Správné odpovědi se do prohlížeče neposílají. Certifikát (`src/lib/certificate.ts`) generuje `pdf-lib` + `@pdf-lib/fontkit` s TTF fonty z `src/assets/fonts` (kvůli české diakritice). QR kód kreslí vektorově přes čisté jádro `qrcode/lib/core/qrcode`, protože hlavní vstup balíčku tahá Node moduly, které ve Workeru nejsou. PDF je v R2, veřejné ověření na `/certifikat/[publicId]`. Lepší skóre vydá nový certifikát. Obrázky lekcí jdou z R2 přes `/api/images/[...key]` (jen prefix `images/`, bez SVG).
- **Ostatní**: audit log (`logAudit`). Rate limiting: binding `RATE_LIMITER` (Cloudflare, 10 požadavků / 60 s na IP) + limit odkazů na uživatele v DB; `checkRateLimit()` v `src/lib/rate-limit.ts`. GDPR export a smazání (`/api/gdpr/*`, `deleteUserData()` v `src/lib/users.ts`): jedním batchem maže zápisy, pokusy, certifikáty a logy, anonymizuje uživatele i audit log a pak smaže PDF z R2. Dotazy na uživatele filtrují `deleted_at IS NULL`.

### Frontend

- Veřejný web má jeden vzhled v `src/styles/site.css`, celý scopovaný pod třídou `.site` (`SiteLayout.astro`): IBM Plex Sans a Mono, černé linky 1 px, ostré rohy, jedna akcentní barva, bez tmavého režimu. Velikosti jsou v rem, layout se skládá přes flex-wrap, `auto-fit` a `clamp()` s jednotkou `cqi` (kontejner je `.site`), ne přes media queries. Nové stránky skládej z hotových tříd (`.wrap`, `.page-head`, `.box`, `.form`, `.field`, `.note`, `.btn`, `.facts`, `.prose`). Admin (`AdminLayout.astro`) jede na Tailwind 4 (`global.css`).
- Fonty jsou self-hostované přes `@fontsource` (import v `global.css`), Google Fonts se nenačítají. PDF certifikát má vlastní TTF v `src/assets/fonts`.
- Formuláře: chyby polí až po interakci (`:user-invalid`, `src/scripts/form-errors.ts`), hlášky ve stálé `aria-live` oblasti, cíle aspoň 44 px. U webového kódu používej skill `modern-web-guidance`.
- React jen pro interaktivní ostrůvky: editory v adminu (`src/components/admin/`) a formulář testu (`TestForm.tsx`). Zbytek jsou Astro stránky renderované na serveru.
- URL jsou česky (`/kurz/[slug]`, `/objednavka/[slug]`, `/prihlaseni`, `/profil`, `/admin/kurzy`, `/admin/uzivatele` …).

## Nabídky a hodnocení

- **Sekce „Další naše AI vzdělávání“**: `src/lib/events.ts` čte nejbližší akce z `https://www.vibecoding.cz/api/event-tips?source=skola-ai` (timeout 2,5 s, při chybě prázdné pole, propustí jen odkazy na vibecoding.cz). Web si UTM přepisuje na `utm_medium=referral` (`asWebReferral`), e-maily nechávají `email`. Blok je pod každou lekcí, v uvítacím a závěrečném e-mailu (`resolvePromo` v `enrollment.ts`); cron `send-lessons` načítá akce jednou na běh. Když není co nabídnout, sekce se nezobrazí.
- **Odhlášení nabídek** je oddělené od odhlášení z kurzu: `users.promo_opt_out_at`, stránka `/odhlaseni-nabidek/[token]` (odhlásí až POST) a přepínač v `/profil/nastaveni` (`/api/profile/promo`).
- **Tokeny v e-mailech** (`src/lib/unsubscribe.ts`, HMAC) mají tři účely, které nejdou zaměnit: odhlášení z kurzu (holé id zápisu), nabídky (`promo:<id uživatele>`), hodnocení (`rating:<id zápisu>`).
- **Hodnocení kurzu**: denní cron `reminders` pošle jednou, tři dny po dokončení, žádost s odkazem na `/hodnoceni/[token]`; ukládá se do `course_ratings` (známka 1–5, text, souhlas se zveřejněním pod křestním jménem), přehled je v `/admin/hodnoceni`. Zveřejňování hodnocení na webu zatím není.
- Zásady zpracování údajů jsou stránka `src/pages/ochrana-osobnich-udaju.astro`. Když změníš, jaké údaje aplikace ukládá nebo komu je předává, uprav i ji.

## Obsah kurzů

`docs/course-content/` je **jediný zdroj** textů kurzů. Pravidla psaní (vykání, bez emoji, podpis „Tým Školy AI, Patrick a Andrea“, formát souboru, ověřování faktů) jsou v `pravidla-psani-lekci.md`. Kurz tvoří karta `<prefix>-course.md`, lekce `<prefix>-lesson-NN.md` a test `<prefix>-test.md`. Do D1 se dostávají skriptem `scripts/import-courses.mjs`: vygeneruje SQL (kurz, lekce, test), které se pustí přes `wrangler d1 execute --file`. Skript řádky přepisuje na místě podle slugu a pozice, nový kurz zakládá jako `draft` a stav existujícího nemění. Úpravy lekcí proto dělej v souborech, příští import by změny z adminu přepsal. Tělo lekce se ukládá do `content_md` jako HTML. Kurzy mají v katalogu pole `audience`, `requirements` a `sort_order` (první kurz podle pořadí je doporučený na titulce).
