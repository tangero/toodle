# Rozhodnutí

Rozhodnutí s důvodem. Novější nahoře. Pravidla, která z nich plynou pro kód, jsou v `CLAUDE.md`.

## 2026-11-24 · Odpověď na srozumitelnost odděleně od další lekce (kurzy na potvrzení)

- **Co:** u kurzů na potvrzení tři odpovědi jen ukládají hodnocení; další lekci pošle samostatné tlačítko „Mám přečteno, pošlete další lekci“. Seznam lekcí ukazuje poslední odeslanou jako „čtete teď“ a odeslané lekce jdou číst na webu.
- **Proč:** oba čtenáři kurzu Claude jako pracovní agent v pilotu odpověděli „nerozuměl jsem“ kvůli ovládání: odpověď je posunula o lekci dál, lekci viděli jako „hotovou“ dřív, než ji četli, a nemohli se k ní vrátit.
- **Mění rozhodnutí ze 16. 11.** („jedno kliknutí zapíše odpověď a pošle další lekci“). Cena je jedno kliknutí navíc; odpověď je dál dobrovolná a postup neblokuje.

## 2026-11-21 · Statistika obcí a převzetí uživatelů ze staré aplikace

- **Co:** nepovinná obec u uživatele (`users.municipality_code`, kód obce ČSÚ), našeptávač při zápisu a v nastavení účtu, veřejná stránka `/obce` (podíl obyvatel, počet lidí, kraje). Převzetí všech 7 162 unikátních uživatelů ze staré aplikace (jméno, e-mail, datum registrace, ověření, obec), bez hesel a rolí.
- **Proč:** stará aplikace ukazovala žebříček měst podle počtu i podílu obyvatel; uživatelé ho znali.
- **Počítají se jen ověřené účty**, jinak by nepotvrzený zápis cizí adresy přidával obci „obyvatele“. Veřejně jen obce a kraje s aspoň 5 lidmi (šum malých čísel a soukromí v malých obcích). Text říká „vzdělává se s námi“, ne „prošlo kurzem“: stará data dokončení kurzů neobsahují.
- **Počty obyvatel jsou od ČSÚ (k 1. 1. 2025), ne ze staré tabulky**, která u 911 stejnojmenných obcí přiřadila všem počet té nejmenší (Kladno 232). Klíčem je kód obce; IČO ze staré aplikace se převádí podle názvu a okresu, zbytek přes ARES (`scripts/obce/build_obce.py`).
- **Import neověřených (406) i neaktivních (126) účtů** si vyžádal Patrick. Neověření se do statistiky nepočítají.
- **Obec z nepřihlášeného zápisu čeká u zápisu** (`enrollments.pending_municipality_code`) a do účtu se zapíše až po potvrzení odkazu. Kdyby se zapsala hned, mohl by kdokoli změnit obec cizímu účtu; kdyby se ukládala jen novým účtům, ztratila by se u 4 tisíc převzatých ověřených účtů bez obce.
- **Zamítnuto:** hledání obce dotazem do D1 při psaní (limit 10 požadavků za minutu na IP, `LIKE` nehledá bez diakritiky); `<datalist>` (prohlížeč si možnosti filtruje sám a diakritiku neignoruje, „ceske bud“ nenabídne nic).

## 2026-11-16 · Zpětná vazba na srozumitelnost lekcí

- **Co:** u každé lekce tři stejně výrazné odpovědi (Rozuměl jsem · Něco mi nesedělo · Nerozuměl jsem, potřebuji to vysvětlit lépe). U kurzů na potvrzení jedno kliknutí zapíše odpověď a pošle další lekci; „nerozuměl jsem“ postup neblokuje. Po druhé a třetí odpovědi dobrovolné upřesnění (části lekce, jedna věta). Po třetí odpovědi okamžitá pomoc: zadání ke zkopírování do ChatGPT nebo Claude.
- **Proč:** lekce vznikají s pomocí AI a je potřeba vidět, kterým pasážím lidé nerozumějí. Potvrzení přečtení je chvíle, kdy čtenář stejně kliká, takže odpoví skoro každý.
- **Zamítnuto:** odkaz „nerozumím“ u každé části (zahltí e-mail, chybí kladné odpovědi pro srovnání); odpověď e-mailem jako hlavní cesta (málo odpovědí, nutné třídění); automatické vysvětlení psané naším modelem (další neověřený text od AI); blokování postupu při „nerozuměl jsem“ (lidé by klikali na první možnost).
- **Přepis lekce** jen po schválení člověkem, nasazuje se běžným importem; fáze 2, nepostaveno.

## 2026-11-16 · E-mail

- **Odesílatel a odpovědi:** `Škola AI <tereza@skola.aivefirmach.cz>`, Reply-To tatáž adresa. V Resendu je na ní zapnutý příjem. Původně navržené Reply-To `patrick@zandl.cz` Patrick nahradil touto schránkou.
- **DNS:** zóna `aivefirmach.cz` je na Cloudflare (převedena z Gransy 15.–16. 11. 2026, protože vlastní doménu Workeru jinak nejde nastavit). Záznamy Resendu jsou na `resend._domainkey.skola`, `send.skola`, `mail.skola` (bez proxy) a MX pro příjem na `skola`.
- **DMARC:** `p=none`, hlášení na `dmarc@prijimackynaskolu.cz`; ta doména má povolení `aivefirmach.cz._report._dmarc`.

## 2026-11-16 · Opravy logiky z code review

- **Potvrzovací odkaz spustí jen svůj kurz**, běžné přihlášení nespouští nic. Důvod: čekající zápis může pod cizí adresou založit kdokoli veřejným formulářem. Důsledek: přihlášený čtenář s čekajícím zápisem ho potvrdí na stránce zápisu.
- **Zámek odesílání** (`enrollments.sending_at`) a **číslo průchodu** (`run_no`) v klíčích proti dvojímu odeslání; klíč lekce používá id lekce, ne pozici.
- **Mazání účtu** maže PDF certifikátů před řádky v databázi, aby soubor se jménem nezůstal bez záznamu.

## 2026-11-16 · Mandát k autonomní stavbě

- Commit, push, PR a nasazení na produkci s migracemi dělá Claude sám. Sloučení PR do `main` a změny ve `vibecoding-site` slučuje Patrick.
- Zastavit se před: e-mailem skutečným čtenářům, mazáním produkčních dat, sloučením do Vibecoding.cz.
- Publikace kurzů schválena po dokončení revize; provedena 16. 11. poté, co začaly odcházet e-maily.

## 2026-11-16 · Obsah

- **Vykání všude**, značka jen **Škola AI**, bez emoji, podpis „Tým Školy AI, Patrick a Andrea“. Pravidla: `docs/course-content/pravidla-psani-lekci.md`.
- **První kurz se jmenuje Začínáme s ChatGPT** (slug zůstává `chatgpt-pro-zacatecniky`). Lekce 7–15 byly v produkci prázdné a jsou nově napsané.
- **Lekce 13** staví na projektu s instrukcemi, protože OpenAI vlastní GPTs k 11. 12. 2026 ruší.
- **Soubory v `docs/course-content/` jsou jediný zdroj lekcí.** Důvod: revize, vykání a opravy se dělají hromadně a musí jít porovnat se stavem v databázi.
- **Právní podklad** pro tvrzení o datech a smlouvách: článek https://www.marigold.cz/item/smlouvy-ai-gdpr/ (ověřený právníkem). Autorské právo a AI Act jím pokryté nejsou.

## 2026-11-16 · Redesign

- **K čemu web je:** budovat důvěru a povědomí, aby si čtenář vzpomněl při zmínce o školení AI. Web je pro jednotlivce (zvědavý začátečník, člověk z kanceláře), firmy jako celek neoslovuje.
- **Vzhled:** varianta C „Technická“ (IBM Plex Sans a Mono, černé linky, ostré rohy, jedna akcentní barva `#b93a0d`), vybraná ze tří návrhů. Zamítnuto: převzít vzhled aivefirmach.cz, zklidnit původní barevný styl. Bez tmavého režimu.
- **Titulka:** jeden hlavní krok (zápis do doporučeného kurzu), katalog všech kurzů bez třídění s řádkem „pro koho“ a „co potřebujete“, ukázka lekce, autor, nejbližší akce, odběr novinek. Zamítnuto: třídění podle nástroje i rozcestník podle profese (kurzů je málo).
- **Autor:** Patrick Zandl, s přiznaným propojením na AI ve firmách a Vibecoding.cz. Číslo účastníků se píše „kolem 10 000 lidí od roku 2025“, je to odhad.
- **Nabídky:** sekce „Další naše AI vzdělávání“ se dvěma nejbližšími akcemi z propagačního systému Vibecoding.cz, pod každou lekcí, v uvítacím a závěrečném e-mailu a na webu. Nabízí se vše, co se právě propaguje. Bez zaškrtávacího pole při zápisu, s odhlášením zvlášť od kurzu.
- **Novinky:** vlastní newsletter Škola AI nemá; odkazuje na `zandl.substack.com` a WhatsApp kanál. Newsletter Vibecoding.cz se nenabízí (příliš technický).
- **Patička a právní texty** podle Vibecoding.cz (provozovatel Patrick Zandl, IČO 43943420).
- **Kurzy zdarma;** placené „možná časem“.
- Podklad: https://claude.ai/artifact/9go6sSt4QRn34VQEvjQvWA, návrhy vzhledu: https://claude.ai/artifact/TF6g5fWLTojW32kobUGQz1.

## 2026-11-21 Pilotní běh kurzů

- **Pozvánka 100 nejstarším ověřeným účtům** ze staré aplikace, s odkazem na jejich dřívější souhlas s oslovením o nových kurzech. Starý název „Letní škola AI“ smí pozvánka jednou zmínit (schválil Patrick), jinde ne. Oslovení je ve všech e-mailech jen „Dobrý den,“ bez jména: jméno by se muselo správně skloňovat do 5. pádu a automaticky to spolehlivě nejde (Patrick, 22. 11. 2026).
- **Seznam příjemců se zmrazí jednou** (`campaign_recipients`), aby opakované odeslání nepokračovalo dalšími lidmi a šlo měřit, kdo z pozvaných se zapsal a odpověděl. Neaktivní a admin účty se vynechávají podle starých dat, protože import tyto příznaky nepřenesl.
- **Vysvětlení na připomínky navrhuje model, posílá člověk.** Model `anthropic/claude-sonnet-5.5` (vybral Patrick), volá se jen kliknutím u konkrétní připomínky, nikdy hromadně. Bez schválení nic neodejde. Zásady ochrany údajů to popisují v bodě 4.
- **Otázka na srozumitelnost zůstává od první lekce** (Patrick).
