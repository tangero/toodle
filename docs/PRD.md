# Letní škola AI — PRD (Product Requirements Document)

## Summary

Drip email course platform. User orders a course (free or ~50 CZK), receives one short educational email daily, takes a test at the end, and gets a PDF certificate with a publicly verifiable QR code.

MVP: two courses ("AI pro začátečníky" and "AI pro firmy") with minimal admin overhead.

## Domain

- App: `skola.aivefirmach.cz`
- Email: `mail.skola.aivefirmach.cz`

## Tech Stack

- **Hosting**: Cloudflare Pages
- **Backend**: Cloudflare Workers (TypeScript)
- **DB**: Cloudflare D1
- **Storage**: Cloudflare R2 (lesson images, PDF certificates)
- **Frontend**: Astro + React (admin and interactive parts)
- **CSS**: Tailwind CSS
- **Email**: Resend
- **LLM eval**: Claude API (Anthropic) — hodnocení open-ended otázek v testech
- **Cron**: Cloudflare Cron Triggers (via companion Worker)
- **Secrets**: Cloudflare Workers secrets
- **PDF**: pdf-lib (generování certifikátů v Worker)
- **QR**: qrcode (npm)

## Data Model (D1)

```sql
users: id, email, name, created_at, verified_at, deleted_at
courses: id, slug, title, perex, description_md, author_name, price_czk, lesson_count, delivery_mode, status, welcome_email_md, completion_email_md, created_at
lessons: id, course_id, position, title, content_md, reading_minutes
enrollments: id, user_id, course_id, status (pending|active|paused|stalled|completed|cancelled), current_lesson, next_send_at, started_at, completed_at, score
orders: id, user_id, course_id, enrollment_id, vs, amount_czk, status (pending|paid|cancelled|overpaid|underpaid), created_at, paid_at, expires_at
payments: id, fio_transaction_id, vs, amount_czk, received_at, matched_order_id (nullable), note
email_log: id, enrollment_id, lesson_id (nullable), template, sent_at, resend_id, opened_at, clicked_at, bounced_at
tests: id, course_id, questions_json
test_attempts: id, enrollment_id, answers_json, score, feedback_json, llm_evaluation_raw, completed_at
certificates: id, enrollment_id, public_id (for QR), issued_at, pdf_r2_key
magic_links: token, user_id, expires_at, used_at
audit_log: id, actor, action, target, payload_json, created_at
```

Všechny ID jsou TEXT (ULID), všechny timestamps jsou ISO 8601 strings.

## Key Features

### 1. Veřejný katalog kurzů
- SEO-friendly URL: `/kurz/[slug]`
- Homepage s výpisem publikovaných kurzů
- Detail kurzu: Markdown popis, osnova lekcí, CTA objednávky

### 2. Objednávkový flow
- Bezplatné kurzy: okamžitý zápis po ověření emailu
- Placené kurzy (~50 CZK): bankovní převod přes FIO API
- Generování unikátního variabilního symbolu (VS)
- Automatické párování plateb (cron každých 30 min)
- Expirace nezaplacených objednávek po 14 dnech

### 3. Double opt-in
- Ověření emailu přes magic link
- Enrollment se aktivuje až po ověření (free) nebo zaplacení (paid)

### 4. Dva delivery mody
- **next_workday**: automatické doručení Po-Pá v 7:00 UTC
- **on_click**: další lekce až po kliknutí "Hotovo" (okamžité odeslání)

### 5. Cron triggery
- `0 7 * * 1-5` — doručování lekcí
- `*/30 * * * *` — párování plateb FIO
- `0 9 * * *` — upomínky + expirace objednávek
- `0 18 * * *` — denní digest adminovi

### 6. Magic link autentizace
- Žádná hesla, přihlášení přes email odkaz (15 min platnost)
- JWT session v HttpOnly cookie (7 dní)
- HMAC-SHA256 podpis přes Web Crypto API

### 7. Uživatelský profil
- Přehled aktivních a dokončených kurzů
- Detail enrollmentu s přehledem lekcí (dokončené/aktuální/budoucí)
- Pause/resume kurzu
- Nastavení účtu, GDPR export/smazání

### 8. Závěrečný test
- Multiple choice + open-ended otázky
- MC otázky: automatické hodnocení
- Open-ended: hodnocení Claude API (structured JSON output s per-question feedback)
- Passing score: 70 %
- Výsledky s detailní zpětnou vazbou

### 9. PDF certifikát
- A4 landscape, pdf-lib
- Jméno studenta, název kurzu, datum, skóre
- QR kód odkazující na veřejnou verifikační stránku (`/certifikat/[publicId]`)
- Upload do R2, stažení přes API

### 10. Admin dashboard
- **Single admin** (Patrick): přístup přes ADMIN_EMAIL secret
- Dashboard: statistiky enrollmentů, tržby, nespárované platby
- CRUD kurzů: formulář s auto-slugem, Markdown editory, delivery mode, stav
- Lesson editor: inline editor s pozicemi, add/edit/delete, Markdown obsah
- Test editor: MC + open-ended otázky, výběr správné odpovědi, bodování
- Správa uživatelů: seznam, detail (enrollmenty, objednávky, email log)
- Objednávky: přehled s filtrem dle stavu
- Platby: přehled FIO plateb, ruční párování nespárovaných plateb
- Nastavení: stav systému, cron přehled, secrets reference
- Denní digest email adminovi

### 11. Resend webhooks
- Endpoint: `/api/webhooks/resend`
- Tracking: delivered, opened, clicked, bounced, complained
- Update `email_log` tabulky
- Bounce → pauza enrollmentu
- Complaint → zrušení enrollmentu
- HMAC ověření svix podpisu

### 12. GDPR compliance
- Double opt-in (ověření emailu)
- Unsubscribe z kurzu (HMAC podepsaný token v patičce emailu)
- Data export (JSON download všech dat)
- Smazání účtu (cascade delete + anonymizace + smazání R2 souborů)

### 13. Rate limiting
- Magic link: 3 požadavky/email/hodina
- Objednávky: 5 požadavků/email/hodina
- In-memory sliding window

### 14. Admin notifikace
- Okamžité: nespárovaná platba, přeplaceno/nedoplaceno
- Denní digest: nové enrollmenty, tržby, dokončené kurzy, bounces

## Architecture

### Directory Structure

```
toodle/
├── astro.config.mjs          # Astro + Cloudflare + React + Tailwind
├── wrangler.jsonc             # D1, R2, cron triggers
├── tsconfig.json              # strict TS + path aliases
├── db/
│   ├── schema.sql             # kanonické schéma
│   └── migrations/0001_initial.sql
├── src/
│   ├── env.d.ts               # typed Env (DB, BUCKET, secrets)
│   ├── middleware.ts           # auth + admin guard
│   ├── lib/
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── db.ts              # ULID generátor + D1 wrappery
│   │   ├── auth.ts            # magic link, JWT, session, cookies
│   │   ├── email.ts           # Resend API klient
│   │   ├── fio.ts             # FIO bank API klient
│   │   ├── llm.ts             # Claude API evaluace testů
│   │   ├── certificate.ts     # PDF generace + R2 upload
│   │   ├── markdown.ts        # marked + DOMPurify
│   │   ├── rate-limit.ts      # in-memory rate limiter
│   │   ├── audit.ts           # audit log helper
│   │   ├── unsubscribe.ts     # HMAC unsubscribe tokeny
│   │   └── email-templates/   # base, magic-link, verification, welcome,
│   │                          # lesson, completion, reminder, admin-digest
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CourseForm.tsx
│   │   │   ├── LessonEditor.tsx
│   │   │   └── TestEditor.tsx
│   │   └── TestForm.tsx
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PublicLayout.astro
│   │   └── AdminLayout.astro
│   ├── pages/
│   │   ├── index.astro              # homepage / katalog
│   │   ├── 404.astro
│   │   ├── prihlaseni.astro         # magic link login
│   │   ├── overeni.astro            # email verification landing
│   │   ├── sitemap.xml.ts
│   │   ├── kurz/[slug].astro        # detail kurzu
│   │   ├── objednavka/[slug].astro  # objednávkový flow
│   │   ├── profil/
│   │   │   ├── index.astro          # dashboard
│   │   │   ├── nastaveni.astro      # GDPR
│   │   │   └── kurz/[id].astro      # detail enrollmentu
│   │   ├── test/[enrollmentId].astro
│   │   ├── certifikat/[publicId].astro
│   │   ├── odhlaseni/[token].astro
│   │   ├── admin/
│   │   │   ├── index.astro
│   │   │   ├── kurzy/{index,novy,[id]}.astro
│   │   │   ├── uzivatele/{index,[id]}.astro
│   │   │   ├── objednavky.astro
│   │   │   ├── platby.astro
│   │   │   └── nastaveni.astro
│   │   └── api/
│   │       ├── auth/{magic-link,verify,verify-email,logout}.ts
│   │       ├── orders/create.ts
│   │       ├── enrollments/[id]/{done,pause}.ts
│   │       ├── test/submit.ts
│   │       ├── certificates/[publicId].ts
│   │       ├── webhooks/resend.ts
│   │       ├── cron/{send-lessons,match-payments,expire-orders,reminders,admin-digest}.ts
│   │       ├── admin/{courses,lessons,tests,users,payments}.ts
│   │       └── gdpr/{export,delete}.ts
│   └── styles/global.css
└── public/
    ├── robots.txt
    └── favicon.{ico,svg}
```

### Key Technical Decisions

1. **ULID pro ID** — time-sortable, URL-safe, bez problémů s D1 auto-increment
2. **JWT v cookies** — session bez server-side store, 7denní expiry, HMAC-SHA256
3. **Cron přes companion Worker** — Cloudflare Pages nemá nativní cron, malý worker volá API endpointy s X-Cron-Secret headerem
4. **On-click = okamžité odeslání** — UX: uživatel dostane další lekci hned, ne čekání na cron
5. **FIO polling každých 30 min** — bezpečný vzhledem k rate limitům FIO API
6. **HMAC unsubscribe tokeny** — odhlášení z kurzu bez přihlášení, podepsané JWT secretem

## Deployment Checklist

1. `wrangler d1 create letni-skola-ai-db` → aktualizovat `database_id` ve `wrangler.jsonc`
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
