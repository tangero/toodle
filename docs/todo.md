# Úkoly a předávka

## Kde jsme skončili

**2026-11-16** · session `e68b306c-03b1-4724-8e69-16cb1a063dd7` · větev `redesign-skola-ai` @ `e6c7b4e` (před commitem této předávky) · prompty 64/64

**Na čem se dělalo:** Redesign Školy AI (varianta C „Technická“), čtyři kurzy ve vykání, e-maily se sekcí „Další naše AI vzdělávání“, žádost o hodnocení, opravy z code review a zpětná vazba na srozumitelnost lekcí.

**Rozdělané:**
- **PR #3** (`redesign-skola-ai` → `main`, https://github.com/tangero/toodle/pull/3) je otevřený. Obsahuje i celý PR #2. Review přes Codex proběhlo, tři nálezy jsou opravené v commitu `e6c7b4e`. Verdikt: lze mergovat s výhradou.
- **Produkce** (`https://skola.aivefirmach.cz`) běží z commitu `ce75043`. Opravy z `e6c7b4e` na ní **nejsou nasazené**.
- **PR #4** (`zpetna-vazba-srozumitelnost` → `redesign-skola-ai`, https://github.com/tangero/toodle/pull/4) je otevřený, nenasazený. Zadání je v `docs/zpetna-vazba-srozumitelnost.md` na té větvi.
- **PR #585 ve vibecoding-site** (https://github.com/tangero/vibecoding-site/pull/585) čeká na sloučení Patrickem.
- V `.claude/worktrees/agent-acd79588c232dc2d5` zůstal pracovní strom větve `zpetna-vazba-srozumitelnost`; po sloučení PR #4 ho lze odstranit (`git worktree remove`).

**První krok příště:** Zeptat se Patricka, jestli sloučil PR #3 (`gh pr view 3 --json state`). Pokud ano: `git switch main && git pull`, `npm run build && npx wrangler deploy`, aby se opravy z review dostaly na produkci. Sloučení přes `gh pr merge` dělá Patrick, viz `docs/gotchas.md`.

**Důsledky dnešních rozhodnutí:**
- Soubory v `docs/course-content/` jsou jediný zdroj lekcí; úpravy v adminu příští import přepíše (`docs/decisions.md`, Obsah).
- Běžné přihlášení nespouští čekající zápisy; čekající zápis přihlášený čtenář potvrdí na stránce zápisu (`docs/decisions.md`, Opravy logiky).
- Před nasazením PR #4 se musí na produkční databázi aplikovat migrace `0006_lesson_feedback.sql`.
- Import přes `wrangler d1 execute --file` nesnese `CASE … END` v SQL (`docs/gotchas.md`).

**Čeká na uživatele:**
- Sloučit PR #3, potom PR #4, a PR #585 ve vibecoding-site.
- Přečíst zásady zpracování osobních údajů na webu (slibují mimo jiné posouzení testu člověkem na žádost).
- Potvrdit, že zkušební e-maily z `tereza@skola.aivefirmach.cz` došly do schránky a že příjem odpovědí v Resendu funguje.
- Rozhodnutí v sekci Otevřené otázky níže.

**Neověřeno:**
- Žádnou lekci nikdo neprošel přímo v ChatGPT ani Claude. Co se nepodařilo ověřit u výrobce, je v metadatech lekcí jako „Ověřit před publikací“; kurzy jsou přesto publikované.
- Autorské právo a AI Act v kurzu Bezpečně s AI (lekce 5 a 6) právník neviděl.
- E-maily jen na snímcích z Chrome, ne v Outlooku ani v tmavém režimu klientů. Doručení do schránky nepotvrzeno, jen přijetí Resendem (odpověď 200).
- Opravy doručování (zámek odesílání, číslo průchodu, klíč podle id lekce, potlačení žádosti o hodnocení) nemají automatický test; první dvě ověřeny lokálním průchodem, zbylé jen čtením kódu.
- PR #4: klientský skript tří tlačítek v prohlížeči, tlačítko „Zkopírovat“.
- Meze této předávky: session měla 3 kompaktace a přepis (716 kB) jsem celý nepřečetl; evidence promptů vychází ze shrnutí po kompaktacích a z posledních částí konverzace. Nečteno: 354 bloků myšlení, 1 obrázek, 502 kB zkrácených výstupů nástrojů, 2 odložené výstupy.

## Otevřené otázky

- **Zpětná vazba od první lekce?** PR #4 dává otázku na srozumitelnost do e-mailu už u první lekce. Chybí rozhodnutí, jestli až od druhé. Rozhodne Patrick; úprava je v `src/lib/email-templates/lesson.ts`.
- **Prahy pro „k přepisu“** (20 odpovědí a 15 % u kurzů na potvrzení, 10 odpovědí a 30 % u denních) jsou odhad bez dat. Upraví se podle prvních týdnů provozu; konstanty jsou v `src/lib/feedback.ts` (větev PR #4).
- **Právní posouzení zásad zpracování údajů** a formulace při zápisu („Součástí lekcí je krátká nabídka…“). Spuštěno s návrhem, právník je neviděl.
- **Paměť a projekty na bezplatném účtu ChatGPT v Česku:** nápověda OpenAI si odporuje. Zjistí se průchodem lekcí 6, 8 a 13 na bezplatném účtu.

## Udělat později

- **Zpětná vazba, fáze 2:** návrh přepisu lekce jazykovým modelem, schválení v adminu, znovuposlání přepsané lekce čtenářům, kteří ji označili. Data jsou připravená (`lessons.version`, `lesson_feedback.resent_version`). Zadání: `docs/zpetna-vazba-srozumitelnost.md`, část „Přepis lekce“.
- **Admin v novém vzhledu.** Schváleno, neuděláno; admin jede na Tailwindu a na telefonu se roztahuje kvůli pevnému postrannímu panelu.
- **PDF certifikát** má nové jméno, ale staré písmo (Plus Jakarta Sans v `src/assets/fonts`). IBM Plex by se muselo stáhnout z internetu, k tomu je potřeba Patrickův souhlas.
- **Měření návštěvnosti** (Cloudflare Web Analytics, bez cookies). Schváleno, vyžaduje založení v Cloudflare dashboardu; pak doplnit do zásad.
- **Zobrazení hodnocení kurzů na webu.** Sbírají se, přehled je v `/admin/hodnoceni`, veřejně se neukazují.
- **Lekce 8 kurzu Začínáme s ChatGPT** opakuje nastavení trénování, které zavádí lekce 5; stačí odkázat zpět.
- **Kurzy E–I** podle `docs/course-content/rada-dalsi-kurzy.md` nejsou začaté. Kurz C je odložený.
- **Automatické testy doručování:** projekt nemá testovací databázi, logika v `src/lib/enrollment.ts` je bez testů.
- **Odpověď na lekci e-mailem** zpracovaná z příchozí pošty v Resendu (schránka `tereza@skola.aivefirmach.cz` existuje).
