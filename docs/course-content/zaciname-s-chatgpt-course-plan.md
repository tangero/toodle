# Začínáme s ChatGPT - osnova kurzu a pravidla tvorby lekcí

Tento dokument je obsahový podklad pro kurz **Začínáme s ChatGPT**. Kurz má 15 lekcí, tedy tři pracovní týdny bez víkendů.

Cílová skupina: lidé bez hlubších technických zkušeností, kteří umí používat webový prohlížeč a e-mail, ale nemají zkušenost s LLM ani s prompty.

## Základní pravidla kurzu

- Každá lekce je e-mailová lekce, ne článek ani dokumentace.
- Jedna lekce má pokrýt jedno hlavní téma a jeden praktický výstup.
- Čtení má trvat přibližně 5-8 minut.
- Každá lekce musí obsahovat hotový prompt nebo postup ke zkopírování.
- Každý nový pojem nad rámec běžného používání prohlížeče krátce vysvětlit při prvním výskytu.
- U nových pojmů přidat odkaz na spolehlivé vysvětlení, typicky Wikipedii nebo oficiální nápovědu nástroje.
- Nepředpokládat znalost AI zkratek. Zkratku vždy rozepsat a vysvětlit.
- Psát klidně, prakticky a konkrétně. Bez technického zahlcení.
- U funkcí, které se mohou měnit, před finálním psaním ověřit aktuální názvy, dostupnost a limity.
- U placených funkcí vždy říct, zda jsou pro danou lekci nutné. Pokud nejsou, nabídnout bezplatnou variantu.

## Styl e-mailové lekce

Vzor stylu: `docs/course-content/zaciname-s-chatgpt-lesson-01.md`.

Každá lekce má mít metadata:

- Kurz
- Lekce
- Název
- Předmět e-mailu
- Preheader
- Délka čtení

Každá lekce má mít tuto strukturu:

1. Krátké přivítání a jasné vymezení dnešního cíle.
2. Vysvětlení tématu po malých krocích.
3. Krátké vysvětlení nových pojmů.
4. Praktický postup nebo prompt ke zkopírování.
5. Navazující prompt, který ukáže, že práce s ChatGPT je dialog.
6. Upozornění na častou chybu nebo bezpečnostní riziko, pokud se k tématu hodí.
7. Shrnutí „Co si z dneška odnést“.
8. Krátký můstek na další lekci.
9. Podpis:

```html
<p>— <strong>Tým Letní školy AI</strong><br>Patrick a Iva</p>
```

## Jazyková pravidla

- Oslovovat čtenáře v jednotném čísle: „otevři“, „zkus“, „pošli“.
- Vyhýbat se větám typu „jak všichni víme“ nebo „je to jednoduché“. Začátečník se nemá cítit pozadu.
- Nepoužívat anglické pojmy bez vysvětlení.
- Když je anglický pojem běžný, uvést české vysvětlení hned vedle něj.
- Nepoužívat příliš mnoho možností najednou. Začátečník má po lekci vědět, co udělat teď.
- Každý prompt dát jako samostatný výrazný odstavec.
- U delších promptů vysvětlit, proč obsahují jednotlivé části.

## Povinné vysvětlování pojmů

Při prvním výskytu v kurzu vysvětlit například:

- **Prompt**: zadání, které napíšeš ChatGPT.
- **LLM / velký jazykový model**: systém, který pracuje s jazykem a vytváří odpovědi podle zadání.
- **Kontext**: informace z předchozí části konverzace, na které ChatGPT navazuje.
- **Halucinace**: věrohodně znějící, ale vymyšlená nebo nepřesná odpověď AI.
- **Model**: konkrétní varianta AI systému, která může mít různé schopnosti.
- **Multimodální AI**: AI, která nepracuje jen s textem, ale také s obrázky, soubory nebo hlasem.
- **Paměť**: funkce, která si může pamatovat vybrané informace napříč konverzacemi.
- **Vlastní pokyny / Custom Instructions**: nastavení, které ChatGPT říká, jak má odpovídat.
- **GPTs / vlastní GPT**: upravená verze ChatGPT pro konkrétní účel.

U každého pojmu přidat odkaz, pokud to lekci nezahltí. Vhodné typy zdrojů:

- Wikipedie pro obecné pojmy.
- Oficiální nápověda OpenAI pro konkrétní funkce ChatGPT.
- Oficiální stránky nástroje, pokud se popisuje placená nebo nová funkce.

## Osnova 15 lekcí

### Lekce 1 - Začínáme s ChatGPT: účet, rozhraní a první prompt

Cíl: založit účet, zorientovat se v rozhraní a poslat první prompt.

Obsah:

- chatgpt.com, registrace a přihlášení,
- základní části rozhraní,
- co je prompt,
- rozdíl mezi bezplatnou a placenou verzí,
- webová, mobilní a desktopová aplikace,
- první konverzace,
- první upozornění na halucinace.

Praktický výstup: čtenář pošle první prompt a navazující otázku.

Stav: vzorová lekce je uložená v `zaciname-s-chatgpt-lesson-01.md`.

### Lekce 2 - Jak napsat lepší prompt

Cíl: ukázat rozdíl mezi neurčitým a konkrétním zadáním.

Obsah:

- proč nestačí napsat jen krátkou otázku,
- čtyři části dobrého promptu: cíl, kontext, forma výstupu, tón,
- rozdíl mezi „napiš mi něco“ a „napiš mi konkrétní výstup pro konkrétní situaci“,
- jak si říct o tabulku, odrážky nebo stručnou verzi.

Praktický výstup: čtenář přepracuje jednoduchý dotaz na použitelný prompt.

Nové pojmy: struktura promptu, tón odpovědi, formát výstupu.

### Lekce 3 - Kontext konverzace: proč nemusíš všechno opakovat

Cíl: vysvětlit, že ChatGPT v jedné konverzaci navazuje na předchozí zprávy.

Obsah:

- co znamená kontext,
- kdy se hodí pokračovat ve stejné konverzaci,
- kdy je lepší začít nový chat,
- jak opravovat a zpřesňovat odpověď,
- proč se někdy ChatGPT „zamotá“, když je konverzace dlouhá.

Praktický výstup: čtenář postupně vylepší jednu odpověď ve třech navazujících krocích.

Nové pojmy: kontext, navazující prompt, nový chat.

### Lekce 4 - Pokročilejší promptování bez technických triků

Cíl: naučit čtenáře zadat ChatGPT roli, publikum, omezení a postup práce.

Obsah:

- co znamená „dej ChatGPT roli“ a kdy to pomáhá,
- jak popsat cílového čtenáře,
- jak nastavit omezení: délka, jazyk, styl, seznam, tabulka,
- jak požádat o návrh a potom o úpravu.

Praktický výstup: čtenář vytvoří text ve dvou verzích pro různé publikum.

Nové pojmy: role, cílové publikum, omezení.

### Lekce 5 - Bezpečnost, soukromí a halucinace

Cíl: dát začátečníkům jednoduchá pravidla bezpečného používání.

Obsah:

- co do ChatGPT nepsat,
- osobní údaje a citlivé informace,
- halucinace a proč mohou znít věrohodně,
- jak se ptát na jistotu odpovědi,
- kdy ověřovat informace mimo ChatGPT.

Praktický výstup: čtenář si vyzkouší prompt, který požádá o označení nejistých tvrzení.

Nové pojmy: citlivá data, halucinace, ověřování.

### Lekce 6 - Paměť a vlastní pokyny

Cíl: vysvětlit, jak si ChatGPT může pamatovat preference a jak nastavit způsob odpovídání.

Obsah:

- co je paměť a kdy se hodí,
- co do paměti neukládat,
- co jsou vlastní pokyny,
- příklady vlastních pokynů pro běžného uživatele,
- rozdíl mezi nastavením účtu a jedním promptem.

Praktický výstup: čtenář si připraví jednoduché vlastní pokyny pro styl odpovědí.

Nové pojmy: paměť, vlastní pokyny, preference.

Poznámka: před psaním lekce ověřit aktuální názvy menu a dostupnost paměti podle účtu.

### Lekce 7 - Řetězení promptů: jak z jednoho úkolu udělat postup

Cíl: ukázat, že složitější úkol je lepší rozdělit na menší kroky.

Obsah:

- proč nechtít všechno v jednom promptu,
- rozdělení práce na plán, návrh, úpravu a kontrolu,
- jak se doptat na slabá místa,
- jak z jedné odpovědi udělat finální výstup.

Praktický výstup: čtenář vytvoří krátký pracovní plán pomocí tří navazujících promptů.

Nové pojmy: řetězení promptů, pracovní postup.

### Lekce 8 - Práce se soubory a projekty

Cíl: ukázat, jak ChatGPT pomáhá s dokumenty, poznámkami a delšími texty.

Obsah:

- kdy nahrát soubor,
- co ChatGPT umí se souborem udělat: shrnout, přepsat, najít body, připravit otázky,
- jak zadat, co má z dokumentu vytáhnout,
- základní pravidla soukromí u souborů,
- co jsou projekty a kdy se hodí.

Praktický výstup: čtenář použije ukázkový text a nechá si z něj udělat shrnutí a seznam úkolů.

Nové pojmy: soubor, projekt, shrnutí dokumentu.

Poznámka: před psaním lekce ověřit aktuální limity nahrávání souborů.

### Lekce 9 - ChatGPT pro e-maily a běžné texty

Cíl: dát čtenáři praktické použití pro každodenní komunikaci.

Obsah:

- návrh e-mailu,
- úprava tónu: vstřícně, stručně, formálně,
- zkrácení dlouhého textu,
- převedení odrážek do e-mailu,
- kontrola srozumitelnosti.

Praktický výstup: čtenář vytvoří pracovní nebo osobní e-mail ze stručných poznámek.

Nové pojmy: tón komunikace, návrh textu, revize.

### Lekce 10 - Vyhledávání a práce se zdroji

Cíl: naučit čtenáře používat ChatGPT opatrně při hledání informací.

Obsah:

- rozdíl mezi odpovědí z modelu a odpovědí se zdroji,
- proč nestačí věřit první odpovědi,
- jak požádat o zdroje,
- jak ověřit důležité tvrzení,
- kdy raději použít vyhledávač nebo oficiální stránku.

Praktický výstup: čtenář porovná odpověď ChatGPT s jedním externím zdrojem.

Nové pojmy: zdroj, fact-checking, citace.

Poznámka: před psaním lekce ověřit aktuální možnosti vyhledávání v ChatGPT.

### Lekce 11 - Plánování s ChatGPT na příkladu výletu nebo nákupu

Cíl: ukázat praktický postup pro rozhodování a plánování.

Obsah:

- jak popsat potřeby a omezení,
- jak si nechat navrhnout varianty,
- jak vytvořit tabulku pro porovnání,
- jak požádat o otázky, které pomohou plán zpřesnit,
- jak výstup ověřit.

Praktický výstup: čtenář vytvoří plán výletu, nákupu nebo rodinné aktivity.

Nové pojmy: kritéria, varianta, rozhodovací tabulka.

### Lekce 12 - Práce s daty bez znalosti programování

Cíl: ukázat, že ChatGPT může pomoci pochopit tabulku nebo jednoduchá data.

Obsah:

- co je dataset jednoduchým jazykem,
- jak popsat tabulku,
- jak se ptát na trendy a rozdíly,
- jak si nechat vysvětlit graf nebo výpočet,
- opatrnost u čísel a ověřování výsledků.

Praktický výstup: čtenář použije malou ukázkovou tabulku a nechá si z ní vytvořit slovní shrnutí.

Nové pojmy: data, dataset, trend, graf.

Poznámka: nepoužívat těžké statistické pojmy bez vysvětlení.

### Lekce 13 - Vlastní GPTs a kdy je použít

Cíl: vysvětlit, co jsou vlastní GPTs a kdy se hodí začátečníkovi.

Obsah:

- co je vlastní GPT,
- rozdíl mezi běžným chatem a upraveným pomocníkem,
- příklady: pomocník na e-maily, učitel jazyka, plánovač,
- jak vybírat GPT opatrně,
- soukromí a důvěryhodnost.

Praktický výstup: čtenář si připraví zadání pro vlastního jednoduchého pomocníka, i když ho nemusí vytvořit.

Nové pojmy: GPTs, vlastní GPT, nástroj třetí strany.

Poznámka: před psaním lekce ověřit dostupnost GPTs podle tarifu.

### Lekce 14 - Obrázky v ChatGPT

Cíl: ukázat, jak zadat vytvoření obrázku a jak popsat požadovaný výsledek.

Obsah:

- co znamená generování obrázků,
- jak popsat účel, styl, formát a prvky obrázku,
- proč je dobré uvést, kde se obrázek použije,
- omezení textu v obrázcích,
- autorská práva a bezpečné publikování.

Praktický výstup: čtenář vytvoří prompt pro jednoduchý obrázek, například pozvánku, ilustraci nebo obrázek k příspěvku.

Nové pojmy: generování obrázků, styl, formát, autorská práva.

Poznámka: před psaním lekce ověřit aktuální názvy obrazových funkcí v ChatGPT.

### Lekce 15 - Úpravy obrázků a vlastní pracovní postup

Cíl: zakončit kurz praktickým použitím a vytvořením osobní sady promptů.

Obsah:

- úprava existujícího obrázku,
- co lze realisticky změnit,
- jak popsat požadovanou změnu,
- jak si sestavit vlastní sadu promptů pro opakované použití,
- rekapitulace kurzu,
- doporučení, jak pokračovat po skončení kurzu.

Praktický výstup: čtenář si vytvoří vlastní minišablonu: „můj prompt pro e-mail“, „můj prompt pro shrnutí“, „můj prompt pro plánování“.

Nové pojmy: úprava obrázku, šablona promptu, pracovní návyk.

## Checklist pro psaní nové lekce

Před uložením každé lekce zkontrolovat:

- Má lekce metadata?
- Je jasný jeden hlavní cíl lekce?
- Je vysvětlen každý nový pojem?
- Je u nového pojmu odkaz na vysvětlení nebo oficiální zdroj?
- Je v lekci aspoň jeden prompt ke zkopírování?
- Je v lekci navazující prompt nebo další krok?
- Je uvedeno, zda je potřeba placená funkce?
- Je zmíněno bezpečnostní nebo ověřovací riziko, pokud k tématu patří?
- Končí lekce shrnutím „Co si z dneška odnést“?
- Navazuje poslední odstavec na další lekci?
- Text je vhodný pro člověka bez technického zázemí?

## Poznámky k budoucímu zpracování

- Lekce psát jako HTML blok stejně jako vzorová lekce 1.
- Nepřebírat staré lekce mechanicky. Starý obsah použít jen jako zdroj témat.
- U lekcí 6, 8, 10, 13, 14 a 15 znovu ověřit aktuální stav funkcí ChatGPT těsně před psaním.
- Pokud některá funkce nebude dostupná ve free tarifu, lekce musí mít variantu „bez placení“ nebo jasně říct, že jde o volitelnou část.
