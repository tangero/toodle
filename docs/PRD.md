# Letní škola AI — PRD (Dokument s požadavky na produkt)

## Shrnutí

Platforma pro e-mailové kurzy s postupným zasíláním. Uživatel si objedná kurz (zdarma nebo za cca 50 Kč), každý den obdrží jeden krátký vzdělávací e-mail, na konci absolvuje test a získá certifikát ve formátu PDF s veřejně ověřitelným QR kódem.

MVP: dva kurzy („AI pro začátečníky“ a „AI pro firmy“) s minimálními administrativními náklady.

## Doména

- Aplikace: `skola.aivefirmach.cz`
- E-mail: `mail.skola.aivefirmach.cz`

## Technologický stack

- **Hosting**: Cloudflare Pages
- **Backend**: Cloudflare Workers (TypeScript)
- **DB**: Cloudflare D1
- **Úložiště**: Cloudflare R2 (obrázky lekcí, certifikáty v PDF)
- **Frontend**: Astro + React (administrativní a interaktivní části)
- **CSS**: Tailwind CSS
- **E-mail**: Resend
- **Hodnocení LLM**: Claude API (Anthropic) — hodnocení otevřených otázek v testech
- **Cron**: Cloudflare Cron Triggers (prostřednictvím doprovodného Workeru)
- **Secrets**: Cloudflare Workers secrets
- **PDF**: pdf-lib (generování certifikátů ve Workeru)
- **QR**: qrcode (npm)

## Datový model (D1)

```sql
users: id, email, name, created_at, verified_at, deleted_at
courses: id, slug, title, perex, description_md, author_name, price_czk, lesson_count, delivery_mode, status, welcome_email_md, completion_email_md, created_at
lessons: id, course_id, position, title, content_md, reading_minutes
enrollments: id, user_id, course_id, status (pending|active|paused|stalled|completed|cancelled), current_lesson, next_send_at, started_at, completed_at, score
orders: id, user_id, course_id, enrollment_id, vs, částka_czk, stav (čeká|zaplaceno|zrušeno|přeplaceno|nedoplatek), vytvořeno_v, zaplaceno_v, vyprší_v
platby: id, fio_transaction_id, vs, částka_czk, přijato_v, odpovídající_id_objednávky (může být prázdné), poznámka
email_log: id, enrollment_id, lesson_id (nullable), template, sent_at, resend_id, opened_at, clicked_at, bounced_at
tests: id, course_id, questions_json
test_attempts: id, enrollment_id, answers_json, score, feedback_json, llm_evaluation_raw, completed_at
certificates: id, enrollment_id, public_id (pro QR), issued_at, pdf_r2_key
magic_links: token, user_id, expires_at, used_at
audit_log: id, actor, action, target, payload_json, created_at
```

Všechny ID jsou TEXT (ULID), všechny časové značky jsou řetězce ISO 8601.

## Klíčové funkce

### 1. Veřejný katalog kurzů
- SEO-friendly URL: `/kurz/[slug]`
- Domovská stránka s výpisem publikovaných kurzů
- Detail kurzu: popis v Markdownu, osnova lekcí, CTA pro objednávku

### 2. Objednávkový proces
- Bezplatné kurzy: okamžitá registrace po ověření e-mailu
- Placené kurzy (~50 CZK): bankovní převod přes FIO API
- Generování unikátního variabilního symbolu (VS)
- Automatické párování plateb (cron každých 30 min)
- Expirace nezaplacených objednávek po 14 dnech

### 3. Double opt-in
- Ověření e-mailu přes magic link
- Registrace se aktivuje až po ověření (bezplatné) nebo zaplacení (placené)

### 4. Dva způsoby doručení
- **next_workday**: automatické doručení Po-Pá v 7:00 UTC
- **on_click**: další lekce až po kliknutí na „Hotovo“ (okamžité odeslání)

### 5. Cron triggery
- `0 7 * * 1-5` — doručování lekcí
- `*/30 * * * *` — párování plateb FIO
- `0 9 * * *` — upomínky + vypršení platnosti objednávek
- `0 18 * * *` — denní přehled pro administrátora

### 6. Autentizace pomocí magického odkazu
- Žádná hesla, přihlášení přes odkaz v e-mailu (platnost 15 min)
- JWT session v HttpOnly cookie (7 dní)
- HMAC-SHA256 podpis přes Web Crypto API

### 7. Uživatelský profil
- Přehled aktivních a dokončených kurzů
- Detail registrace s přehledem lekcí (dokončené/aktuální/budoucí)
- Pozastavení/obnovení kurzu
- Nastavení účtu, export/smazání podle GDPR

### 8. Závěrečný test
- Otázky s výběrem odpovědí + otevřené otázky
- Otázky s výběrem odpovědí: automatické hodnocení
- Otevřené otázky: hodnocení pomocí Claude API (strukturovaný výstup JSON s zpětnou vazbou pro každou otázku)
- Minimální počet bodů pro úspěšné absolvování: 70 %
- Výsledky s podrobnou zpětnou vazbou

### 9. Certifikát ve formátu PDF
- A4 na šířku, pdf-lib
- Jméno studenta, název kurzu, datum, skóre
- QR kód odkazující na veřejnou verifikační stránku (`/certifikat/[publicId]`)
- Nahrání do R2, stažení přes API

### 10. Admin dashboard
- **Single admin** (Patrick): přístup přes ADMIN_EMAIL secret
- Dashboard: statistiky registrací, tržby, nepárované platby
- CRUD kurzů: formulář s auto-slugem, Markdown editory, způsob doručení, stav
- Editor lekcí: inline editor s pozicemi, přidání/úprava/smazání, Markdown obsah
- Editor testů: MC + otevřené otázky, výběr správné odpovědi, bodování
- Správa uživatelů: seznam, detail (registrace, objednávky, e-mailový log)
- Objednávky: přehled s filtrem podle stavu
- Platby: přehled plateb FIO, ruční přiřazování nepřipojených plateb
- Nastavení: stav systému, přehled cronů, reference tajných klíčů
- Denní souhrnný e-mail pro administrátora

### 11. Opětovné odeslání webhooků
- Endpoint: `/api/webhooks/resend`
- Sledování: doručeno, otevřeno, kliknuto, odraženo, stížnost
- Aktualizace tabulky `email_log`
- Odraženo → pozastavení registrace
- Stížnost → zrušení registrace
- HMAC ověření podpisu svix

### 12. Soulad s GDPR
- Double opt-in (ověření e-mailu)
- Odhlášení z kurzu (HMAC podepsaný token v zápatí e-mailu)
- Export dat (stažení všech dat ve formátu JSON)
- Smazání účtu (kaskádové smazání + anonymizace + smazání souborů R2)

### 13. Omezení rychlosti
- Magic link: 3 požadavky/e-mail/hodina
- Objednávky: 5 požadavků/e-mail/hodina
- Posuvné okno v paměti

### 14. Notifikace pro administrátora
- Okamžité: nepárovaná platba, přeplaceno/nedoplaceno
- Denní přehled: nové registrace, tržby, dokončené kurzy, odražené e-maily

## Architektura

### Struktura adresářů

```
toodle/
├── astro.config.mjs # Astro + Cloudflare + React + Tailwind
├── wrangler.jsonc # D1, R2, cron spouštěče
├── tsconfig.json # strict TS + aliasy cest
├── db/
│ ├── schema.sql # kanonické schéma
│ └── migrations/0001_initial.sql
├── src/
│ ├── env.d.ts # typizované Env (DB, BUCKET, secrets)
│ ├── middleware.ts # auth + admin guard
│ ├── lib/
│ │ ├── types.ts # rozhraní TypeScript
│ │ ├── db.ts # generátor ULID + wrappery D1
│ │ ├── auth.ts # magic link, JWT, relace, cookies
│ │ ├── email.ts # klient API pro opětovné odeslání
│ │ ├── fio.ts # klient API banky FIO
│ │ ├── llm.ts # vyhodnocení testů API Claude
│ │ ├── certificate.ts # generování PDF + nahrávání R2
│ │ ├── markdown.ts # marked + DOMPurify
│ │ ├── rate-limit.ts # omezovač rychlosti v paměti
│ │ ├── audit.ts # pomocník pro auditní protokol
│ │ ├── unsubscribe.ts # HMAC tokeny pro odhlášení
│ │ └── email-templates/ # základ, magický odkaz, ověření, uvítání,
│ │ # lekce, dokončení, připomenutí, souhrn pro správce
│ ├── components/
│ │ ├── admin/
│ │ │ ├── CourseForm.tsx
│ │ │ ├── LessonEditor.tsx
│ │ │ └── TestEditor.tsx
│ │ └── TestForm.tsx
│ ├── layouts/
│ │ ├── BaseLayout.astro
│ │ ├── PublicLayout.astro
│ │ └── AdminLayout.astro
│ ├── pages/
│ │ ├── index.astro # domovská stránka / katalog
│ │ ├── 404.astro
│ │ ├── prihlaseni.astro # přihlašovací odkaz
│ │ ├── overeni.astro # stránka pro ověření e-mailu
│ │ ├── sitemap.xml.ts
│ │ ├── kurz/[slug].astro # detail kurzu
│ │ ├── objednavka/[slug].astro # objednávkový proces
│ │ ├── profil/
│ │ │ ├── index.astro # hlavní panel
│ │ │ ├── nastaveni.astro # GDPR
│ │ │ └── kurz/[id].astro # detail registrace
│ │ ├── test/[enrollmentId].astro
│ │ ├── certifikat/[publicId].astro
│ │ ├── odhlášení/[token].astro
│ │ ├── admin/
│ │ │ ├── index.astro
│ │ │ ├── kurzy/{index,nový,[id]}.astro
│ │ │ ├── uživatelé/{index,[id]}.astro
│ │ │ ├── objednavky.astro
│ │ │ ├── platby.astro
│ │ │ └── nastaveni.astro
│ │ └── api/
│ │ ├── auth/{magic-link,verify,verify-email,logout}.ts
│ │ ├── orders/create.ts
│ │ ├── registrace/[id]/{hotovo,pozastavit}.ts
│ │ ├── test/odeslat.ts
│ │ ├── certifikáty/[publicId].ts
│ │ ├── webhooky/znovu odeslat.ts
│ │ ├── cron/{odeslat-lekce,porovnat-platby,vyprší-objednávky,upomínky,admin-souhrn}.ts
│ │ ├── admin/{courses,lessons,tests,users,payments}.ts
│ │ └── gdpr/{export,delete}.ts
│ └── styles/global.css
└── public/
    ├── robots.txt
    └── favicon.{ico,svg}
```

### Klíčová technická rozhodnutí

1. **ULID pro ID** — lze třídit podle času, bezpečné pro URL, bez problémů s automatickým zvyšováním D1
2. **JWT v cookies** — relace bez ukládání na straně serveru, 7denní platnost, HMAC-SHA256
3. **Cron přes companion Worker** — Cloudflare Pages nemá nativní cron, malý worker volá API endpointy s X-Cron-Secret headerem
4. **On-click = okamžité odeslání** — UX: uživatel dostane další lekci hned, nečeká na cron
5. **FIO polling každých 30 min** — bezpečné vzhledem k rate limitům FIO API
6. **HMAC tokeny pro odhlášení** — odhlášení z kurzu bez přihlášení, podepsané JWT secretem

## Kontrolní seznam nasazení

1. `wrangler d1 create letni-skola-ai-db` → aktualizovat `database_id` v `wrangler.jsonc`
2. `wrangler d1 execute letni-skola-ai-db --file=./db/migrations/0001_initial.sql`
3. `wrangler r2 bucket create letni-skola-ai-storage`
4. Nastavit secrets:
```
   
wrangler secret put RESEND_API_KEY
   wrangler secret put RESEND_WEBHOOK_SECRET
   wrangler secret put ANTHROPIC_API_KEY
   wrangler secret put FIO_API_TOKEN
   wrangler secret put ADMIN_EMAIL
   wrangler secret put JWT_SECRET
   wrangler secret put CRON_SECRET
   ```
5. Přidat doménu `mail.skola.aivefirmach.cz` v Resend, nastavit DNS záznamy
6. Nastavit Resend webhook na `https://skola.aivefirmach.cz/api/webhooks/resend`
7. Vytvořit companion Worker pro cron triggery
8. Deploy: `wrangler pages deploy`
9. Vložit první kurzy přes `/admin/kurzy/novy`
