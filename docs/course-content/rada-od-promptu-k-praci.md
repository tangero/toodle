# Řada „Od promptu k práci s AI“ – osnova kurzů A a B

Dva navazující e-mailové kurzy pro lidi, kteří už s Claude nebo ChatGPT pracují v chatu a chtějí se dostat dál: k dokumentům, prezentacím, tabulkám, rešerším a k úlohám, které za ně AI odpracuje samostatně.

- **Kurz A – Od chatu k hotovým výstupům** (Claude i ChatGPT), 10 lekcí, režim `next_workday`.
- **Kurz B – Claude jako pracovní agent** (dříve Claude Cowork), 10 lekcí, režim `on_click`.

Kurz A je vstupní, kurz B na něj navazuje. Oba kurzy jsou zdarma, ale **předpokládají placený tarif** (Claude Pro/Max nebo ChatGPT Plus/Pro). Na stránce kurzu to musí být napsané v perexu.

Obecná pravidla psaní lekcí (metadata, struktura e-mailu, podpis, jazyk) platí stejně jako v `zaciname-s-chatgpt-course-plan.md`. Níže jsou jen rozdíly a obsah.

## Cílová skupina

Lidé, kteří už promptují, ale používají AI jen jako chat. Vědí, co je prompt a halucinace, takže tyto pojmy už nevysvětlujeme. Vysvětlujeme nové pojmy: artefakt, živý dokument, konektor, agent, úloha, skill, plánovaná úloha, prompt injection.

Tři skupiny čtenářů. Hlavní cvičení je pro všechny stejné (nad společnými cvičnými daty), na konci lekce je krátký blok **„Pro tvoji práci“** se třemi jednovětými variantami:

- **Kancelář** – reporty, podklady pro vedení, porady, školení kolegů.
- **Učitelé** – výukové materiály, pracovní listy, testy pro žáky, materiály pro kolegy.
- **Živnostníci** – nabídky, ceníky, přehled nákladů, návody pro zákazníky.

## Pravidla navíc oproti kurzu Začínáme s ChatGPT

- Čtenář už umí chat. Lekce nezačíná vysvětlováním promptu, ale tím, **co dnes vznikne** (dokument, prezentace, tabulka…).
- Každá lekce má **jeden hmatatelný výstup**, který si čtenář uloží. Výstupy se v kurzu postupně skládají do miniprojektu.
- Cvičení stojí na **cvičných souborech ke stažení** (veřejná data, viz níže). Odkaz na stažení je v lekci jako tlačítko.
- Kurz A: každá praktická část má dva krátké bloky **„V Claude“** a **„V ChatGPT“**. Bloky drž krátké. Pokud se postup v obou nástrojích liší jen názvem tlačítka, stačí jeden postup s poznámkou.
- Kurz B: jen Claude, desktopová aplikace (kvůli práci s místními soubory).
- **Kontrola výstupu** je součást každé lekce: na co se podívat, než výstup někomu pošleš (čísla, zdroje, jména, citlivá data).
- Snímky obrazovky jen výjimečně. Rozhraní se mění rychleji než text lekce, postup popisuj slovy („vpravo nahoře“, „tlačítko Sdílet“).
- Názvy funkcí a tarify **ověřit těsně před psaním lekce** (viz stav funkcí níže).

## Stav funkcí (ověřeno 12. 11. 2026, před psaním znovu ověřit)

**Claude**

- 16. 9. 2026 Anthropic spojil Cowork a chat do jednoho Claude. Uživatel už nevolí režim. Claude sám pozná, kdy jde o delší úlohu, a pracuje s ní jako agent, včetně kontextu projektu, konektorů a skills. Nastavuje se, jak moc se má Claude před kroky ptát. Zdroj: [claude.com/blog/cowork-is-now-claude](https://claude.com/blog/cowork-is-now-claude).
- Spojení se zavádí postupně i v rámci jednoho tarifu: Pro, Max a Ultra první, Team v betě (zapíná správce), Enterprise od 23. 10. Lekce proto vždy uvádějí i postup pro účty, které ještě vidí volbu Chat/Cowork.
- Artefakty začínají ze šablon **Docs, Slides a Design**, dostupné na všech tarifech. Slides jdou exportovat do PowerPointu a PDF. Docs jsou živé dokumenty, na kterých jde pracovat společně. Artefakty jsou na kartě Artefakty v postranním panelu. Zdroj: [support.claude.com – artefakty](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them).
- Práce s místními soubory: desktopová aplikace (macOS, Windows 10/11; ne Windows v režimu S, bez admin práv může agentní práce s počítačem chybět – ověřit).
- Plánované úlohy běží v cloudu, lze je sledovat i z mobilu. Skills a pluginy.

**ChatGPT** (ověřeno 12. 11. 2026 na help.openai.com)

- ChatGPT má dva režimy: **Chat** (rychlé otázky) a **Work** (agent pro delší práci a hotové výstupy). Work vytváří dokumenty, tabulky, prezentace, zprávy a weby, umí Google Docs/Sheets/Slides, šablony přes @Documents, @Spreadsheets, @Presentations. Dostupný na placených tarifech kromě Free a Go, na webu, v mobilu i v desktopové aplikaci. Zdroje: [ChatGPT Work and Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex), [dokumenty, tabulky a prezentace ve Work](https://help.openai.com/en/articles/20001278-creating-and-editing-documents-spreadsheets-and-presentations-with-chatgpt-work).
- Ve Work je i cloudový prohlížeč a plánované úlohy (i spouštěné událostí, ne na Free/Go).
- **Canvas**: nápověda k projektům ho pořád uvádí, ale uživatelé hlásí, že ho nahrazují „writing blocks“. Rozhodnutí: lekce 4 a 5 v ChatGPT stavíme na **Work**, Canvas nezmiňujeme.
- Projekty: soubory a pokyny projektu (••• → Project settings). Zdroj: [Projects in ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt).
- Deep research a limity tarifů: před psaním lekce 8 ověřit.

**Claude – doplnění (12. 11. 2026)**

- Slides podle oznámení exportují do PowerPointu a PDF (Google Slides v oznámení není, neuvádět).
- Spojený Claude: Pro/Max/Ultra postupně, Team v betě (správce zapíná), Enterprise GA od 23. 10. Kdo ještě vidí volbu Chat/Cowork, má starou verzi – v kurzu B mu radíme volit Cowork.
- Artefakty potřebují zapnuté *Settings → Capabilities → Create and edit files*.
- Místní složky jen přes Claude Desktop, jen připojené složky, jen když aplikace běží; úlohy běží na serverech Anthropic. Zdroj: [Use Claude Cowork safely](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely).
- Projekty: nová verze v betě, rozhraní se může lišit.

## Stav psaní lekcí

Stav k 12. 11. 2026. Všechny lekce jsou koncepty. Fakta o funkcích jsou ověřená v nápovědě výrobců, kontrolní čísla proti cvičným datům. **Žádná lekce zatím neprošla zkouškou přímo v Claude a ChatGPT.** To je poslední krok před vložením do adminu.

| Kurz | Soubory | Stav |
|---|---|---|
| A, lekce 1–10 | `od-chatu-k-vystupum-lesson-01.md` až `-10.md` | koncept; lekce 1–3 po revizi |
| A, test | `od-chatu-k-vystupum-test.md` | koncept, včetně `questions_json` |
| B, lekce 1–10 | `claude-pracovni-agent-lesson-01.md` až `-10.md` | koncept; lekce 1 po revizi |
| B, test | `claude-pracovni-agent-test.md` | koncept, včetně `questions_json` |

Odchylky od osnovy níže, ke kterým při psaní došlo:

- A2: do projektu jde jen PDF a ZDROJE.txt, tabulky až v lekci 6 jako příloha chatu.
- A4, A5, A7, A10: ChatGPT stojí na režimu Work, Canvas se nezmiňuje. A10 používá šablony Work (@Template-Creator) vedle vlastních GPT.
- A10: první celá úloha je nad pokyny k daňovému přiznání ze sady Podnikání (nový dokument, na kterém čtenář použije vše naučené), ne nad rozpočtem Prahy.
- B9: plánovaná úloha je webová (přehled novinek), protože nové plánované úlohy běží v cloudu a s místní složkou nepracují.
- B8: práce v prohlížeči je jen popsaná, cvičení používá vyhledávání na webu a koncept e-mailu.

## Cvičné soubory

Veřejná data s otevřenou licencí jsou v `public/soubory/` a stahují se z `/soubory/...` jako statické soubory, bez úprav kódu. Soupis, zdroje, licence a nástrahy v datech: `cvicne-soubory.md`.

- **Rozpočet Prahy** (`/soubory/rozpocet-praha.zip`): rozpočty MHMP 2024–2026 (CSV) a zpráva o plnění rozpočtu 2025 (PDF).
- **Statistiky** (`/soubory/statistiky.zip`): obyvatelé obcí 2024 a 2025, inflace, mzdy (ČSÚ).
- **Podnikání** (`/soubory/podnikani.zip`): ekonomické subjekty, inflace, pokyny k daňovému přiznání, zpráva ČNB.
- **Neuklizená složka** (`/soubory/neuklizena-slozka.zip`, jen kurz B).
- **Učitelé**: data CERMAT a zprávy ČŠI nemají otevřenou licenci, v lekcích na ně jen odkazujeme.

---

# Kurz A – Od chatu k hotovým výstupům

Slug návrh: `od-chatu-k-vystupum`. 10 lekcí, `next_workday`, čtení 6–8 minut.

Cíl kurzu: čtenář umí v Claude i ChatGPT udělat z podkladů hotový dokument, prezentaci, tabulku s grafem a výukový materiál s testem. Ví, kdy stačí chat a kdy úlohu svěřit agentovi.

Miniprojekt, který lekce skládají: **„Rozpočet Prahy srozumitelně“** – briefing, prezentace, graf a krátké školení s testem nad skutečným rozpočtem hl. m. Prahy. Variantně si čtenář může od lekce 2 vzít vlastní téma, třeba svou obec ze sady Statistiky.

### Lekce 1 – Od chatu k výsledku: co dnes AI umí kromě odpovídání

Cíl: ukázat mapu „chat → projekt → dokument a prezentace → agent“ a kdy co použít.

Obsah:

- proč odpověď v chatu ještě není hotová práce,
- co je artefakt a živý dokument (Docs, Slides v Claude; dokumenty a soubory v ChatGPT),
- co je agent a úloha (Claude, ChatGPT Work) – jen ukázka, podrobně v lekci 10 a kurzu B,
- co tento kurz předpokládá: placený tarif, kde ho ověřit.

Praktický výstup: seznam tří vlastních opakovaných úkolů, které čtenář chce přesunout z chatu do hotového výstupu. Prompt ke zkopírování: „Zeptej se mě na mou práci a pomoz mi najít tři úkoly…“.

Pro tvoji práci: kancelář – měsíční report; učitel – pracovní list k tématu; živnostník – cenová nabídka.

Nové pojmy: artefakt, živý dokument, agent, úloha.

### Lekce 2 – Projekt: pracovní prostor s podklady a pokyny

Cíl: založit projekt, nahrát do něj podklady a napsat pokyny, aby čtenář nemusel kontext opakovat.

Obsah:

- projekt v Claude a v ChatGPT, rozdíl proti jednomu dlouhému chatu,
- pokyny projektu (instrukce): pro koho píšu, styl, co nikdy nedělat,
- nahrání zprávy o plnění rozpočtu (PDF) a ZDROJE.txt; tabulky CSV se do projektu nedávají (jsou velké a popisují jen Magistrát), přikládají se až v lekci 6,
- co do projektu nenahrávat (osobní údaje, interní dokumenty bez svolení).

Praktický výstup: projekt „Rozpočet Prahy“ s podklady a pokyny.

Cvičné soubory: sada Rozpočet Prahy.

Nové pojmy: projekt, pokyny projektu, znalostní báze projektu.

### Lekce 3 – Dlouhý dokument: shrnutí, které se dá ověřit

Cíl: vytáhnout z dlouhého PDF to podstatné tak, aby šlo každé tvrzení dohledat.

Obsah:

- shrnutí pro konkrétního čtenáře (zastupitel, občan, rodič, podnikatel),
- „u každého čísla uveď stranu dokumentu“,
- kontrola tří náhodných čísel proti PDF,
- proč AI chybuje právě v číslech a tabulkách z PDF.

Praktický výstup: shrnutí závěrečného účtu na jednu stranu s odkazy na strany a ověřenými třemi čísly.

Pozor: halucinace čísel, záměna let a jednotek (tis. Kč vs. Kč).

### Lekce 4 – Živý dokument: Claude Docs a dokumenty v ChatGPT

Cíl: vytvořit dokument, upravovat ho po částech a sdílet nebo exportovat.

Obsah:

- Claude: dokument ze šablony Docs, úprava vybrané části, komentáře, sdílení, export,
- ChatGPT: dokument v režimu Work (případně jako Google Doc), úprava části, stažení docx,
- rozdíl mezi „přepiš celý text“ a „uprav tento odstavec“,
- verze a návrat ke starší verzi.

Praktický výstup: briefing „Rozpočet Prahy srozumitelně“ (1–2 strany) jako sdílitelný dokument a soubor docx.

Nové pojmy: Docs, export, sdílení odkazem.

### Lekce 5 – Prezentace z hotového dokumentu

Cíl: udělat z briefingu prezentaci a upravit ji slajd po slajdu.

Obsah:

- Claude Slides: prezentace z dokumentu v chatu, export do PowerPointu a PDF,
- ChatGPT: prezentace v režimu Work (pptx nebo Google Slides),
- osnova jako první krok („nejdřív navrhni 6 slajdů, prezentaci až po schválení“),
- jeden slajd = jedna myšlenka, poznámky řečníka,
- kontrola: čísla na slajdech proti dokumentu.

Praktický výstup: šestislajdová prezentace exportovaná do pptx.

Pro tvoji práci: učitel – výklad do hodiny; živnostník – prezentace služeb pro klienta.

### Lekce 6 – Tabulka a graf z otevřených dat

Cíl: nechat AI analyzovat tabulku, udělat graf a ověřit výpočty.

Obsah:

- nahrání CSV nebo xlsx, popis sloupců, otázka na trend,
- graf jako obrázek a jako interaktivní artefakt (Claude), stažení xlsx s grafem,
- „ukaž mi, jak jsi to spočítal“ a kontrola jednoho součtu ručně,
- české CSV: kódování a středník jako oddělovač.

Praktický výstup: graf vývoje výdajů města za několik let (nebo inflace) a tabulka xlsx.

Cvičné soubory: sada Rozpočet Prahy (tři roky), sada Statistiky.

Nové pojmy: CSV, interaktivní graf.

### Lekce 7 – Výukový materiál s testem

Cíl: z podkladu vytvořit materiál, který naučí někoho dalšího, včetně krátkého testu a klíče.

Obsah:

- pracovní list nebo školicí materiál pro konkrétní publikum (žáci 8. třídy, noví kolegové, zákazníci),
- test: 5 otázek s výběrem odpovědi + 1 otevřená, klíč správných odpovědí zvlášť,
- interaktivní kvíz jako artefakt v Claude, kvíz a tisková verze v ChatGPT,
- kontrola: jsou otázky jednoznačné? Není správná odpověď vždy nejdelší?
- autorská práva u převzatých textů a obrázků.

Praktický výstup: pracovní list „Jak hospodaří Praha“ + test s klíčem (docx) + interaktivní kvíz.

Pro tvoji práci: učitel – materiál do hodiny i pro kolegy; kancelář – školení nového kolegy; živnostník – návod pro brigádníka nebo zákazníka.

### Lekce 8 – Hloubková rešerše se zdroji

Cíl: zadat rešerši, která sama prohledá web a vrátí zprávu se zdroji, a umět ji zkontrolovat.

Obsah:

- Research v Claude, deep research v ChatGPT – kdy se vyplatí čekat minuty místo vteřin,
- zadání rešerše: otázka, rozsah, jaké zdroje preferovat (úřady, statistiky), co vynechat,
- kontrola zdrojů: otevřít tři odkazy, ověřit, že tvrzení opravdu obsahují,
- limit rešerší podle tarifu.

Praktický výstup: rešerše „Na co Praha vydává nejvíc a jak se to změnilo za poslední roky“, nebo podle skupiny „Co se mění pro OSVČ v roce 2026“ či „Co říká ČŠI o přijímačkách“, se seznamem zdrojů.

Nové pojmy: hloubková rešerše, primární zdroj.

### Lekce 9 – Konektory: e-mail, disk a kalendář

Cíl: připojit k AI vlastní data opatrně a s rozmyslem.

Obsah:

- co je konektor (Gmail, Google Drive, kalendář, Notion, Microsoft 365 – ověřit nabídku),
- jaká oprávnění konektor dostává a jak je odebrat,
- firemní účet vs. osobní: kdo o připojení rozhoduje,
- prompt injection jednoduše: text v e-mailu nebo dokumentu může obsahovat „pokyny“ pro AI,
- bezpečný první krok: jen čtení, jedna složka.

Praktický výstup: připojený jeden konektor a shrnutí týdne z kalendáře nebo vybrané složky.

Nové pojmy: konektor, oprávnění, prompt injection.

### Lekce 10 – Opakovatelný postup a první úloha pro agenta

Cíl: z jednorázové práce udělat postup, který jde zopakovat, a poprvé svěřit úlohu agentovi.

Obsah:

- pokyny projektu jako šablona, Skills v Claude, vlastní GPT v ChatGPT,
- první delší úloha: Claude ji pozná a rozplánuje; v ChatGPT režim Work,
- dobré zadání úlohy: cíl, podklady, co je „hotovo“, co nesmí dělat,
- shrnutí kurzu a pozvánka do kurzu B.

Praktický výstup: dokončený miniprojekt „Rozpočet Prahy srozumitelně“ (briefing, prezentace, graf, materiál s testem) a jedna opakovatelná šablona.

### Závěrečný test kurzu A

- 7 otázek s výběrem odpovědi: kdy projekt vs. chat, co je artefakt, jak ověřit číslo z PDF, co je prompt injection, co sdílí konektor, kdy použít hloubkovou rešerši, export prezentace.
- 2 otevřené otázky (hodnotí LLM):
  1. „Napiš zadání, kterým necháš z přiloženého PDF udělat shrnutí pro konkrétního čtenáře tak, aby šlo ověřit.“ Kritéria: čtenář, rozsah, odkazy na strany, formát.
  2. „Popiš, co zkontroluješ, než pošleš prezentaci vytvořenou AI vedení nebo rodičům.“ Kritéria: čísla, zdroje, jména, citlivá data, tón.

---

# Kurz B – Claude jako pracovní agent

Slug návrh: `claude-pracovni-agent`. 10 lekcí, `on_click` (úlohy trvají různě dlouho, čtenář pokračuje tlačítkem „Hotovo“). Čtení 5–7 minut plus samotná práce.

Předpoklady: placený Claude (Pro/Max, u Team ověřit), desktopová aplikace, absolvovaný kurz A nebo zkušenost s projekty a artefakty.

Pozn. k názvu: Cowork už není samostatný režim (od 16. 9. 2026 je součástí Claude). V perexu jednou zmínit „dříve Claude Cowork“, v lekcích mluvit o „úloze“ a „agentovi“.

Cíl kurzu: čtenář umí Claude svěřit vícekrokovou práci s jeho soubory, sledovat ji, zasáhnout a výsledek zkontrolovat. Umí z opakované práce udělat skill nebo plánovanou úlohu a ví, kde jsou bezpečnostní hranice.

### Lekce 1 – Chat, nebo úloha? Jak Claude pracuje jako agent

Cíl: pochopit, co se děje, když Claude místo odpovědi „pracuje“, a připravit si prostředí.

Obsah:

- co je agent: plánuje kroky, pracuje se soubory, používá nástroje,
- desktopová aplikace, přístup ke složce, nastavení „jak moc se má ptát“,
- pracovní složka jen pro kurz, rozbalení cvičných dat,
- první úloha: „projdi složku a napiš mi, co obsahuje“.

Praktický výstup: připravená složka „Kurz AI“ a první soupis souborů od Claude.

Nové pojmy: agent, úloha, pracovní složka, oprávnění.

### Lekce 2 – Zadání úlohy: brief, se kterým agent nebloudí

Cíl: naučit se psát zadání pro samostatnou práci. Na této dovednosti stojí celý kurz.

Obsah:

- pět částí: cíl, podklady, výstup (formát, kam uložit), co je „hotovo“, co nedělat,
- proč u agenta víc záleží na kritériu hotovo než u chatu,
- nech Claude nejdřív navrhnout plán a schval ho,
- šablona briefu ke zkopírování.

Praktický výstup: vlastní šablona briefu a jedna úloha podle ní.

### Lekce 3 – Úklid složky: přejmenovat, roztřídit, sepsat

Cíl: první skutečná úloha se soubory, bezpečně na kopii.

Obsah:

- práce vždy na kopii, nikdy na jediném originálu,
- pravidlo pojmenování (rok_téma_zdroj), třídění do podsložek, nalezení duplicit,
- soupis do tabulky: co kde je a odkud,
- co agent smí smazat (nic) a jak mu to říct.

Praktický výstup: uklizená cvičná složka a soupis souborů v xlsx.

Cvičné soubory: Neuklizená složka (ZIP).

### Lekce 4 – Sloučit tabulky a spočítat to správně

Cíl: spojit několik tabulek do jedné, přidat výpočty a graf a ověřit je.

Obsah:

- rozpočty více let (nebo více měst) do jedné tabulky,
- sjednocení sloupců a jednotek, kontrolní součty,
- graf a list „Poznámky k datům“ (co agent musel upravit),
- ruční kontrola dvou čísel proti zdroji.

Praktický výstup: sloučená xlsx s grafem a listem kontrol.

Cvičné soubory: sada Rozpočet Prahy (tři roky), sada Statistiky.

### Lekce 5 – Report z podkladů ve složce

Cíl: nechat agenta napsat zprávu z více souborů najednou.

Obsah:

- zadání reportu: čtenář, osnova, délka, povinné grafy, citace souborů,
- výstup jako Claude Doc a jako docx do složky,
- revize: označit místa bez zdroje,
- rozdíl proti kurzu A: Claude si soubory najde a zpracuje sám.

Praktický výstup: report „Hospodaření Prahy v číslech“ s grafy (docx + Doc).

### Lekce 6 – Prezentace z reportu a úpravy slajd po slajdu

Cíl: z reportu vytvořit prezentaci a dotáhnout ji.

Obsah:

- Slides z reportu, export do pptx do složky,
- úpravy: „slajd 3 zkrať“, „přidej graf ze sloučené tabulky“,
- poznámky řečníka a krátká verze na 3 minuty,
- kontrola čísel na slajdech.

Praktický výstup: prezentace v pptx a PDF.

### Lekce 7 – Celý výukový balíček jednou úlohou

Cíl: zadat úlohu s více výstupy najednou.

Obsah:

- jeden brief → pracovní list, test s klíčem, prezentace a průvodní e-mail,
- přizpůsobení publiku (žáci, kolegové, zákazníci),
- kontrola souladu: test se ptá jen na to, co je v materiálu.

Praktický výstup: složka „Balíček – rozpočet Prahy“ se čtyřmi soubory.

Pro tvoji práci: učitel – hodina na příští týden; kancelář – školení; živnostník – podklady k nové službě.

Cvičné soubory: sada Rozpočet Prahy (učitelé volitelně vlastní učivo nebo odkazované materiály ČŠI).

### Lekce 8 – Web a připojené nástroje

Cíl: nechat agenta pracovat i s webem a konektory a znát rizika.

Obsah:

- vyhledávání na webu a práce v prohlížeči (Claude v Chrome – ověřit dostupnost a tarif),
- konektory v úloze: najdi v Drive, připrav koncept e-mailu (ne odeslat),
- prompt injection v praxi: webová stránka nebo dokument s „pokyny“ pro AI,
- pravidlo: agent připravuje, člověk odesílá, platí a maže.

Praktický výstup: rešerše z webu doplněná do reportu a koncept e-mailu, který neodešel.

### Lekce 9 – Skill a plánovaná úloha: ať se to dělá samo

Cíl: z opakované práce udělat skill a naplánovat pravidelné spouštění.

Obsah:

- co je skill: uložený postup, který Claude použije, když se hodí,
- vytvoření skillu z úlohy z lekce 5 nebo 7,
- plánovaná úloha (např. každé pondělí přehled novinek z dané oblasti), sledování z mobilu,
- kdy plánovat nechtít (citlivá data, rozhodnutí).

Praktický výstup: vlastní skill a jedna plánovaná úloha.

Nové pojmy: skill, plugin, plánovaná úloha.

### Lekce 10 – Kontrola, bezpečnost a závěrečný projekt

Cíl: mít vlastní kontrolní seznam pro výstupy agenta a dokončit projekt z vlastní práce.

Obsah:

- kontrolní seznam: čísla, zdroje, jména a osobní údaje, nevyžádané změny souborů,
- firemní data a pravidla organizace, co patří jen na firemní tarif,
- co dělat, když agent udělá chybu (verze, záloha, návrat),
- závěrečný projekt: jedna skutečná úloha z vlastní práce podle šablony briefu.

Praktický výstup: vlastní kontrolní seznam a hotová úloha z vlastní práce.

### Závěrečný test kurzu B

- 7 otázek s výběrem odpovědi: co je agent, proč pracovat na kopii, co patří do briefu, jak poznat prompt injection, co agent nemá dělat sám (odesílat, platit, mazat), kdy se hodí skill vs. plánovaná úloha, co zkontrolovat ve sloučené tabulce.
- 2 otevřené otázky (hodnotí LLM):
  1. „Napiš brief pro agenta: ze složky s pěti tabulkami rozpočtu udělej jednu souhrnnou tabulku s grafem.“ Kritéria: cíl, podklady, výstup a místo uložení, kritérium hotovo, omezení (nepřepisovat originály).
  2. „Agent ti připravil report pro vedení. Popiš, jak ho zkontroluješ, než ho odešleš.“ Kritéria: ověření čísel proti zdroji, zdroje, osobní údaje, nevyžádané změny.

## Otevřené otázky

- Nová podoba projektů v Claude (projekt jako jedna konverzace s vlákny) je v betě. Až se rozšíří, lekci A2 přepsat.
- ChatGPT: limity deep research podle tarifu (lekce 8), konektory (lekce 9).
- Data pro živnostníky jsou nejslabší sada (chybí data po oborech a ceny energií), viz `cvicne-soubory.md`.
- Souhlas CERMAT a ČŠI, pokud chceme jejich soubory hostovat.
