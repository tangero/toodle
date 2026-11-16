# Další kurzy řady „Od promptu k práci s AI“ – návrh

Návrh kurzů, které navazují na kurz A (Od chatu k hotovým výstupům) a kurz B (Claude jako pracovní agent). Osnova A a B je v `rada-od-promptu-k-praci.md`. Stav k 12. 11. 2026: pořadí schváleno, kurz D je napsaný jako koncept, ostatní zatím nejsou rozepsané do lekcí.

Společné předpoklady jsou stejné jako u A a B: placený tarif Claude nebo ChatGPT, kurz zdarma, tři skupiny čtenářů (kancelář, učitelé, živnostníci), každá lekce má jeden hmatatelný výstup, kontrolu výstupu a blok „Pro tvoji práci“. Pravidla psaní: skill `course-lesson-authoring`.

## Jak kurzy do řady zapadají

| Kurz | Typ | Pro koho | Předpoklad | Lekcí | Režim |
|---|---|---|---|---|---|
| A – Od chatu k hotovým výstupům | základ řady | všichni | umí chat | 10 | `next_workday` |
| B – Claude jako pracovní agent | základ řady | všichni | kurz A | 10 | `on_click` |
| **D – Bezpečně s AI v práci a ve škole** | průřezový, krátký | všichni | žádný | 6 | `next_workday` |
| **E – AI pro učitele** | profesní | učitelé | kurz A nebo zkušenost s projekty | 10 | `next_workday` |
| **F – Tabulky a data s AI** | dovednostní | všichni | kurz A | 10 | `next_workday` |
| **G – AI pro živnostníky** | profesní | živnostníci | kurz A nebo zkušenost s projekty | 10 | `next_workday` |
| **H – AI v kanceláři** | profesní | kancelář | kurz A nebo zkušenost s projekty | 10 | `next_workday` |
| **I – Rešerše a ověřování s AI** | dovednostní | všichni | umí chat | 8 | `next_workday` |
| C – ChatGPT Work jako pracovní agent | zrcadlo kurzu B | uživatelé ChatGPT | kurz A | 10 | `on_click` |

Kurz C zůstává odložený (schválené byly jen A a B). Od prvního návrhu se změnila jedna věc: režim Work v ChatGPT je dnes doložený v nápovědě OpenAI, takže kurz napsat jde. Rozhodnutí je na vás.

Profesní kurzy (E, G, H) berou dovednosti z kurzu A a staví je na situace jedné skupiny. Hlavní cvičení v nich už není společné, je šité na profesi. Dovednostní kurzy (F, I) jdou do hloubky v jedné lekci kurzu A (F rozvádí A6, I rozvádí A8).

## Doporučené pořadí tvorby

1. **Dopsat A a B.** Hotovo 12. 11. 2026 jako koncepty (20 lekcí a dva testy), zbývá zkouška v nástrojích. Všechny další kurzy na ně odkazují.
2. **D – Bezpečně s AI.** Krátký, nepotřebuje nová data, hodí se jako vstupní kurz i pro lidi, kteří A nedělali. Certifikát může firmě nebo škole sloužit jako doklad o proškolení.
3. **E – AI pro učitele.** Skupina, u které jste sami navrhli výukové materiály s testem. Nepotřebuje hostovaná data, učitel pracuje s vlastním učivem.
4. **F – Tabulky a data.** Cvičná data už existují (sada Statistiky a Rozpočet Prahy).
5. **G – AI pro živnostníky** a **H – AI v kanceláři.** Oba potřebují novou cvičnou sadu (smyšlená firma), proto až potom.
6. **I – Rešerše a ověřování.** Nejvíc závisí na funkcích a limitech, které se mění. Psát až těsně před spuštěním.

## Co je ověřené a co ne

Ověřeno 12. 11. 2026 v nápovědě výrobců: Claude Docs, Slides, Design (všechny tarify), Claude Sheets (beta, od tarifu Pro), plánované úlohy v Claude, konektory (Google Drive, Gmail, Microsoft 365, Slack), ChatGPT Work (dokumenty, tabulky, prezentace, Google Docs/Sheets/Slides, šablony, plánované úlohy), projekty v obou nástrojích.

**Neověřeno, před psaním ověřit:** hloubková rešerše v obou nástrojích (název, limity podle tarifu), nabídka konektorů v ChatGPT, podmínky pro nezletilé a školní účty, ChatGPT pro Excel. Právní tvrzení (GDPR, AI Act, autorské právo) musí před vydáním projít právníkem nebo se opřít o citovaný úřední zdroj.

---

# Kurz D – Bezpečně s AI v práci a ve škole

Slug návrh: `bezpecne-s-ai`. 6 lekcí, `next_workday`, čtení 5–7 minut. Bez cvičných souborů.

Cíl: čtenář ví, co do AI nepatří, umí výstup ověřit, zná rizika agentů a konektorů a má sepsaná vlastní pravidla na jednu stranu.

Miniprojekt: **„Moje pravidla pro AI“** – jednostránkový dokument, který se skládá lekci po lekci a na konci ho čtenář může předložit vedení nebo kolegům.

| # | Lekce | Výstup |
|---|---|---|
| 1 | Co se s tvými daty děje: kde AI běží, nastavení soukromí, osobní vs. firemní účet | zkontrolované nastavení soukromí ve svém nástroji |
| 2 | Osobní a citlivé údaje: co nenahrávat a jak text anonymizovat | anonymizovaná verze jednoho vlastního dokumentu |
| 3 | Halucinace a ověřování: čísla, citace, jména, data | osobní kontrolní seznam před odesláním |
| 4 | Agenti a konektory: prompt injection, co smí AI udělat sama a co jen připravit | tabulka „AI připravuje / já potvrzuji“ pro tři vlastní úkoly |
| 5 | Autorská práva a přiznání AI: cizí texty a obrázky, kdy říct, že pomáhala AI | pravidlo pro označování vlastních výstupů |
| 6 | Pravidla na jednu stranu: pro sebe, pro tým, pro třídu | hotový dokument „Moje pravidla pro AI“ |

Pro tvoji práci: kancelář – firemní data a smlouvy; učitelé – údaje žáků a známky; živnostníci – údaje zákazníků.

Závěrečný test: 6 otázek s výběrem odpovědi a 1 otevřená („Kolega chce nahrát do AI tabulku se jmény a platy. Co mu poradíš?“; kritéria: osobní údaje, anonymizace, firemní účet, pravidla organizace).

Poznámky:

- AI Act (čl. 4, gramotnost v oblasti AI) dává firmám a školám důvod zaměstnance proškolit. Kurz může být jedním z podkladů, ale **nesmíme slibovat, že certifikát povinnost splní**. Formulaci ověřit s právníkem.
- Nahrazuje a aktualizuje nápad č. 6 z `ai-course-ideas.md`, jen pro pokročilejší čtenáře a s agenty.

---

# Kurz E – AI pro učitele

Slug návrh: `ai-pro-ucitele`. 10 lekcí, `next_workday`, čtení 6–8 minut.

Cíl: učitel umí s AI připravit hodinu, pracovní list ve více úrovních, test s klíčem, prezentaci a zpětnou vazbu, bez osobních údajů žáků, a má pro třídu pravidla používání AI.

Miniprojekt: **„Jedna hodina od A do Z“** – učitel si v lekci 2 vybere vlastní téma a ročník a celý kurz k němu skládá balíček: příprava, pracovní list, test, prezentace, procvičování, zpráva rodičům.

| # | Lekce | Výstup |
|---|---|---|
| 1 | Kde AI učiteli pomůže a kde ne; pravidla školy, údaje žáků | seznam tří příprav, které chci zrychlit, a co do AI nesmí |
| 2 | Projekt pro předmět a ročník: učivo, pokyny, styl | projekt s pokyny „piš pro žáky X. třídy“ |
| 3 | Příprava hodiny: cíl, aktivity, časový plán, pomůcky | příprava jedné hodiny na jednu stranu |
| 4 | Pracovní list ve třech úrovních obtížnosti | pracovní list (docx) ve třech variantách |
| 5 | Test s klíčem a hodnoticí tabulkou | test, klíč zvlášť, kritéria hodnocení otevřené úlohy |
| 6 | Interaktivní procvičování: kvíz jako artefakt, který žák otevře z odkazu | sdílený kvíz k tématu |
| 7 | Prezentace do hodiny a poznámky pro učitele | prezentace (pptx) na 15 minut |
| 8 | Zpětná vazba na žákovské práce, anonymně a podle kritérií | komentář ke dvěma anonymizovaným pracím |
| 9 | Rodiče a kolegové: zpráva rodičům, materiál pro předmětovou komisi | zpráva rodičům a jednostránkový návod pro kolegy |
| 10 | Žáci a AI: pravidla ve třídě a úlohy, které AI nevyřeší za žáka | pravidla pro třídu a jedna přepracovaná úloha |

Cvičné soubory: žádné hostované. Učitel pracuje s vlastním učivem. Pro ty, kdo nemají téma, nabídnout sadu Rozpočet Prahy (občanská výchova, finanční gramotnost) a odkazy na data CERMAT a zprávy ČŠI (jen odkaz, viz `cvicne-soubory.md`).

Závěrečný test: 7 otázek s výběrem odpovědi a 2 otevřené („Napiš zadání pro pracovní list ve dvou úrovních k tématu podle vlastního výběru“; „Popiš, jak zkontroluješ test vytvořený AI, než ho dáš žákům“).

Poznámky a rizika:

- Překryv s lekcí A7 (výukový materiál s testem) je záměrný: A7 je ukázka, tady je to celý pracovní postup.
- Lekce 6: ověřit, jestli žák otevře sdílený artefakt bez účtu a jaké jsou věkové podmínky.
- Lekce 8 a 10 jsou citlivé (hodnocení žáků, podvádění). Text musí být opatrný a nesmí radit nahrávat práce se jmény.
- Zvážit odborného čtenáře z praxe (učitel ZŠ nebo SŠ), než kurz vyjde.

---

# Kurz F – Tabulky a data s AI

Slug návrh: `tabulky-a-data-s-ai`. 10 lekcí, `next_workday`, čtení 6–8 minut.

Cíl: čtenář umí nechat AI tabulku uklidit, spojit, spočítat a zobrazit a umí výsledek zkontrolovat. Nepotřebuje znát vzorce Excelu.

Miniprojekt: **„Moje obec v číslech“** – jednostránkový přehled (obyvatelé, mzdy v kraji, inflace) s grafy. Čtenář si vybere vlastní obec ze sady Statistiky.

| # | Lekce | Výstup |
|---|---|---|
| 1 | Co AI s tabulkou opravdu dělá: kdy počítá a kdy odhaduje | první otázka nad tabulkou obyvatel a jedno ručně ověřené číslo |
| 2 | Úklid tabulky: vícenásobné hlavičky, řádky krajů a okresů, mezisoučty | čistá tabulka obcí (xlsx) |
| 3 | České CSV: středník, čárka, kódování, desetinná čárka | správně načtená tabulka inflace |
| 4 | Otázky na data: filtr, pořadí, změna v čase | „moje obec 2024 → 2025“ s výpočtem změny |
| 5 | Spojení dvou tabulek podle společného klíče | jedna tabulka obyvatel za dva roky |
| 6 | Široká a dlouhá tabulka: otočení mezd podle odvětví | tabulka mezd připravená pro graf |
| 7 | Graf, který nelže: typ grafu, osy, popisky, zdroj | dva grafy s popisem a zdrojem |
| 8 | Vzorce, které zůstanou: tabulka, kterou jde dál upravovat (Claude Sheets, tabulky ve Work) | xlsx s funkčními vzorci |
| 9 | Kontrola: kontrolní součty, „ukaž postup“, list Poznámky k datům | list kontrol ve vlastní tabulce |
| 10 | Přehled na jednu stranu a postup na příště | „Moje obec v číslech“ a uložené zadání pro další rok |

Cvičné soubory: sada Statistiky (hotová), sada Rozpočet Prahy (hotová). Nástrahy v datech popsané v `cvicne-soubory.md` jsou přímo obsahem lekcí 2, 3 a 6.

Závěrečný test: 7 otázek s výběrem odpovědi a 2 otevřené („Napiš zadání pro sloučení dvou tabulek obyvatel včetně kontroly“; „AI ti vrátila graf. Co na něm zkontroluješ?“).

Poznámky:

- Překryv s A6 (jedna lekce o grafu) a B4 (sloučení tabulek agentem) je malý: tady jde o porozumění datům, ne o nástroj.
- Tabulka inflace má skoro 3 MB. V lekci 3 ověřit, že ji oba nástroje načtou. Jinak připravit menší výřez a přiznat to v `ZDROJE.txt`.
- Claude Sheets je v betě, ChatGPT pro Excel neověřeno. Lekci 8 psát jako poslední.

---

# Kurz G – AI pro živnostníky

Slug návrh: `ai-pro-zivnostniky`. 10 lekcí, `next_workday`, čtení 6–8 minut.

Cíl: živnostník má v AI připravenou „firmu v projektu“ a umí s ní rychle odpovědět na poptávku, udělat nabídku, ceník, texty na web a měsíční přehled.

Miniprojekt: **„Moje firma v projektu“** – projekt s ceníkem, popisem služeb a šablonami, který po kurzu zůstane v provozu.

| # | Lekce | Výstup |
|---|---|---|
| 1 | Na co AI v malé firmě je a co jí nedávat (údaje zákazníků, smlouvy) | tři činnosti, které chci zrychlit |
| 2 | Projekt „Moje firma“: služby, ceník, tón komunikace | projekt s pokyny a podklady |
| 3 | Odpověď na poptávku a doplňující otázky zákazníkovi | dvě odpovědi na cvičné poptávky |
| 4 | Cenová nabídka jako dokument | nabídka (docx, PDF) ze šablony |
| 5 | Ceník a kalkulace zakázky v tabulce | tabulka s kalkulací a marží |
| 6 | Texty na web, profil firmy a příspěvek na sociální síť | popis služeb ve třech délkách |
| 7 | Návod a časté dotazy pro zákazníky | jednostránkový návod a FAQ |
| 8 | Měsíční přehled příjmů a výdajů | přehled s grafem z cvičných dat |
| 9 | Úřady lidsky: pokyny, dopisy, termíny (a kdy zavolat účetní) | kontrolní seznam povinností z pokynů k přiznání |
| 10 | Průzkum cen a konkurence, měsíční rutina | krátká rešerše a seznam opakovaných zadání |

Cvičné soubory:

- sada Podnikání (hotová) pro lekci 9,
- **nová sada „Smyšlená firma“** (připravit): ceník, popis služeb, tři poptávky, roční přehled příjmů a výdajů. Data si vytvoříme sami, takže odpadá licence. Navrhuji řemeslnou živnost (např. truhlář nebo instalatér), protože má zakázky, materiál i práci.

Závěrečný test: 7 otázek s výběrem odpovědi a 2 otevřené („Napiš pokyny projektu pro svou firmu“; „Zákazník poslal nejasnou poptávku. Jaké zadání dáš AI a co zkontroluješ, než odpověď odešleš?“).

Poznámky:

- Lekce 9 není daňové poradenství. V textu to říct jasně a odkázat na účetní.
- Aktualizuje nápad č. 5 z `ai-course-ideas.md`.

---

# Kurz H – AI v kanceláři

Slug návrh: `ai-v-kancelari`. 10 lekcí, `next_workday`, čtení 6–8 minut.

Cíl: čtenář má AI zapojenou do běžného pracovního týdne: pošta, porady, podklady, reporty, zaškolení kolegy. Ví, co smí dělat na osobním a co na firemním účtu.

Miniprojekt: **„Můj pracovní týden s AI“** – sada vlastních šablon (odpověď na e-mail, zápis z porady, podklad pro rozhodnutí, týdenní report).

| # | Lekce | Výstup |
|---|---|---|
| 1 | Kde v pracovním týdnu AI ušetří nejvíc; firemní pravidla | mapa týdne se třemi místy pro AI |
| 2 | E-maily: odpověď, tón, dlouhé vlákno do pěti bodů | dvě odpovědi a shrnutí vlákna |
| 3 | Zápis z porady z poznámek nebo přepisu | zápis s úkoly, termíny a odpovědnými |
| 4 | Podklad pro rozhodnutí na jednu stranu | dokument „varianty, náklady, doporučení“ |
| 5 | Pravidelný report podle loňského vzoru | report ze šablony s novými čísly |
| 6 | Přehled úkolů a termínů v tabulce | tabulka z rozházených poznámek |
| 7 | Prezentace pro vedení z reportu | pět slajdů s poznámkami |
| 8 | Konektory opatrně: kalendář, pošta, disk | shrnutí příštího týdne z kalendáře |
| 9 | Zaškolení kolegy: návod a krátký test | návod k jednomu postupu a pět otázek |
| 10 | Vlastní šablony a opakovaná zadání | uložená sada šablon a jedna plánovaná úloha |

Cvičné soubory: nová sada „Smyšlená firma“ (stejná jako v kurzu G, doplněná o e-mailové vlákno, poznámky z porady a loňský report).

Závěrečný test: 7 otázek s výběrem odpovědi a 2 otevřené („Napiš zadání pro zápis z porady z přiložených poznámek“; „Co zkontroluješ v reportu od AI, než půjde vedení?“).

Poznámky:

- Největší překryv s kurzem A (dokument, prezentace, konektory). Rozdíl musí být v situacích, ne v nástrojích. Pokud se vám překryv zdá velký, je to první kandidát na vyřazení nebo na zkrácení na 6 lekcí.
- Aktualizuje nápad č. 2 z `ai-course-ideas.md`.

---

# Kurz I – Rešerše a ověřování s AI

Slug návrh: `reserse-a-overovani`. 8 lekcí, `next_workday`, čtení 6–8 minut.

Cíl: čtenář umí zadat rešerši, rozliší primární a sekundární zdroj, ověří klíčová tvrzení a z výsledku udělá podklad pro rozhodnutí.

Miniprojekt: vlastní otázka z práce dotažená do dvoustránkové zprávy se zdroji.

| # | Lekce | Výstup |
|---|---|---|
| 1 | Odpověď z hlavy, hledání na webu, hloubková rešerše: kdy co | jedna otázka zodpovězená třemi způsoby a porovnání |
| 2 | Zadání rešerše: otázka, rozsah, zdroje, co vynechat | vlastní zadání a první zpráva |
| 3 | Primární a sekundární zdroj: úřady, statistiky, zákony | seznam zdrojů roztříděný podle důvěryhodnosti |
| 4 | Ověř tři tvrzení: otevři zdroj a najdi větu | tabulka „tvrzení, zdroj, sedí / nesedí“ |
| 5 | Když si zdroje odporují: datum, autor, zájem | krátké vysvětlení jednoho rozporu |
| 6 | Srovnání variant do tabulky | rozhodovací tabulka (dodavatel, nástroj, nákup) |
| 7 | Rešerše nad vlastními dokumenty a webem zároveň | zpráva, která odlišuje „z mých podkladů“ a „z webu“ |
| 8 | Zpráva se zdroji a pravidelné sledování tématu | dvoustránková zpráva a jedna plánovaná úloha |

Cvičné soubory: sada Podnikání (zpráva ČNB, pokyny MF) a sada Rozpočet Prahy pro lekci 7. Ostatní lekce pracují s webem.

Závěrečný test: 6 otázek s výběrem odpovědi a 2 otevřené („Napiš zadání rešerše k otázce podle výběru“; „Rešerše uvádí číslo bez odkazu. Jak budeš postupovat?“).

Poznámky:

- Názvy a limity hloubkové rešerše jsou neověřené a mění se. Psát až těsně před spuštěním.
- Aktualizuje nápad č. 8 z `ai-course-ideas.md`.

---

## Co se do návrhu nedostalo

- **Automatizace bez programování** (skills, plánované úlohy, úlohy spouštěné událostí) jako pokračování kurzu B. Smysl dává, až bude B hotové a uvidíme, kolik lidí ho dokončí.
- **Vizuály a jednoduchý web** (Claude Design, weby ve Work). Funkce existují, ale je to jiná dovednost než tahle řada. Patří spíš ke kurzu o obrázcích z `ai-course-ideas.md`.

## Rozhodnutí z 12. 11. 2026

- Pořadí tvorby: podle doporučení výše (schváleno).
- Kurz E: učitele z praxe na přečtení lekcí se pokusíme zajistit. Lekce E psát až bude jasné, kdo je přečte, nebo je označit „před odbornou kontrolou“.
- Kurzy G a H: vlastní vymyšlená data smyšlené řemeslné firmy schválena. Sadu připravit před psaním kurzu G.
- Kurz H: zůstává celý, 10 lekcí.
- Kurz D: napsán jako koncept (`bezpecne-s-ai-lesson-01.md` až `-06.md`, `bezpecne-s-ai-test.md`). AI Act je v lekci 6 jen jako souvislost, certifikát neslibuje splnění povinnosti. Lekce 2, 5 a 6 potřebují právní kontrolu.

## Rozhodnutí, která ještě zbývají

1. **Kurz D a AI Act:** chcete kurz nabízet firmám a školám jako „školení AI gramotnosti“? Pak potřebuje právní kontrolu formulací na stránce kurzu i v lekci 6.
2. **Kurz C** (ChatGPT Work jako agent): nechat odložený, nebo zařadit?
3. **ChatGPT v kurzu A:** lekce stojí na režimu Work a Canvas nezmiňují. Potvrdit.
