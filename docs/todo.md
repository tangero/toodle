# Úkoly a předávka

## Kde jsme skončili

**2026-11-25** · session `a3c8d055-2be7-4bc7-bbce-c446329d7da1` · větev `main` @ `3c09797` (před commitem této předávky) · prompty 11/11

**Na čem se dělalo:** Code review Markdown editoru pozvánky (PR #12), oprava všech osmi nálezů, sloučení PR #12 a #13 (skrytí staré chyby na `/prihlaseni`) do `main`, úklid větví a nasazení do produkce.

**Rozdělané:** nic, vše hotové a commitnuté. Produkce (`https://skola.aivefirmach.cz`) běží z `3c09797`, verze Workeru `bed4da81`. Migrace 0011 (`campaign_templates`) v produkci je. Na GitHubu i lokálně zůstala jen větev `main`.

**První krok příště:** Před další vlnou pozvánek otevřít `/admin/pozvanka`, poslat si zkušební e-mail a zkontrolovat, že výchozí text má podpis s mezerou a drobnou poznámku „Zápis zabere minutu…“ jako pilot. Pak prověřit zranitelné závislosti (úkol níže v Udělat později).

**Důsledky dnešních rozhodnutí:**
- Uložení textu shodného s výchozím smaže vlastní text vlny; vlna pak bere výchozí text z kódu včetně pozdějších oprav (`docs/decisions.md`, Editor pozvánky).
- Během rozesílky nejde text pozvánky uložit; změna z jiné záložky rozesílku zastaví (`docs/decisions.md`, Editor pozvánky).
- `npx wrangler deploy` blokuje klasifikátor oprávnění, nasazuje Patrick přes `!` v promptu (`docs/gotchas.md`, Pracovní postup).

**Čeká na uživatele:** rozhodnutí v sekci Otevřené otázky níže; jinak nic.

**Neověřeno:**
- Editor pozvánky v produkci za přihlášením nikdo neotevřel; zámek ukládání během rozesílky a zastavení po změně textu jsou ověřené jen testy a čtením kódu, ne v prohlížeči.
- Oprava `/prihlaseni` je v produkčním skriptu, ale na prošlém odkazu ji nikdo nevyzkoušel.
- Bezpečnostní review sloučených změn (`a3d48f9..3c09797`) nenašlo nic; dělal ho subagent čtením kódu.
- Starší body z předávky 16. 11. (lekce neprošlé v ChatGPT ani Claude, právník neviděl AI Act a zásady, e-maily neověřené v Outlooku) tato session neřešila a platí dál.
- Meze této předávky: bez kompaktace; nečteno 23 bloků myšlení a 44,6 kB zkrácených výstupů nástrojů (hlavně výpis `wrangler deploy`).

## Otevřené otázky

- **Prahy pro „k přepisu“** (20 odpovědí a 15 % u kurzů na potvrzení, 10 odpovědí a 30 % u denních) jsou odhad bez dat. Upraví se podle prvních týdnů provozu; konstanty jsou v `src/lib/feedback.ts` (`REWRITE_THRESHOLDS`).
- **Právní posouzení zásad zpracování údajů** a formulace při zápisu („Součástí lekcí je krátká nabídka…“). Spuštěno s návrhem, právník je neviděl.
- **Paměť a projekty na bezplatném účtu ChatGPT v Česku:** nápověda OpenAI si odporuje. Zjistí se průchodem lekcí 6, 8 a 13 na bezplatném účtu.

## Udělat později

- **Zranitelné závislosti.** GitHub (Dependabot) hlásí na `main` 101 zranitelností (3 kritické, 44 vysokých, stav 25. 11. 2026). Projít kritické a vysoké (`npm audit`, https://github.com/tangero/toodle/security/dependabot), zjistit, které se týkají kódu Workeru v produkci a které jen nástrojů pro vývoj (`npm audit --omit=dev`), a aktualizovat. Po aktualizaci `npm test`, `npm run check`, `npm run build`.
- **Zpětná vazba, fáze 2:** návrh přepisu lekce jazykovým modelem, schválení v adminu, znovuposlání přepsané lekce čtenářům, kteří ji označili. Data jsou připravená (`lessons.version`, `lesson_feedback.resent_version`). Zadání: `docs/zpetna-vazba-srozumitelnost.md`, část „Přepis lekce“.
- **Admin v novém vzhledu.** Schváleno, neuděláno; admin jede na Tailwindu a na telefonu se roztahuje kvůli pevnému postrannímu panelu.
- **PDF certifikát** má nové jméno, ale staré písmo (Plus Jakarta Sans v `src/assets/fonts`). IBM Plex by se muselo stáhnout z internetu, k tomu je potřeba Patrickův souhlas.
- **Měření návštěvnosti** (Cloudflare Web Analytics, bez cookies). Schváleno, vyžaduje založení v Cloudflare dashboardu; pak doplnit do zásad.
- **Zobrazení hodnocení kurzů na webu.** Sbírají se, přehled je v `/admin/hodnoceni`, veřejně se neukazují.
- **Lekce 8 kurzu Začínáme s ChatGPT** opakuje nastavení trénování, které zavádí lekce 5; stačí odkázat zpět.
- **Kurzy E–I** podle `docs/course-content/rada-dalsi-kurzy.md` nejsou začaté. Kurz C je odložený.
- **Automatické testy doručování:** projekt nemá testovací databázi, logika v `src/lib/enrollment.ts` je bez testů.
- **Odpověď na lekci e-mailem** zpracovaná z příchozí pošty v Resendu (schránka `tereza@skola.aivefirmach.cz` existuje).
