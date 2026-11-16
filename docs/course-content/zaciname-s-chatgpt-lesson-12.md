# Začínáme s ChatGPT - Lekce 12

## Metadata

- Kurz: Začínáme s ChatGPT
- Lekce: 12
- Název: Práce s daty bez znalosti programování
- Předmět e-mailu: Lekce 12: Co vám ChatGPT poví o tabulce s čísly
- Preheader: Malá tabulka, tři druhy otázek a jedno číslo, které si přepočítáte sami.
- Délka čtení: 7 minut
- Fakta ověřena: 16. 11. 2026 (help.openai.com: „Data analysis with ChatGPT“ – doporučená podoba tabulky, grafy jako obrázek, výpočty pomocí kódu a výzva ke kontrole; „Uploading files and audio to ChatGPT“ – nahrávání tabulek na tarifu Free, formáty XLSX a CSV, volba + a Add photos & files; „ChatGPT Free Tier FAQ“ – analýza dat a nahrávání souborů na tarifu Free se samostatnými limity)
- Ověřit před publikací: český název volby „Add photos & files“ v nabídce + (nápověda uvádí jen anglické znění). Kontrolní hodnoty cvičné tabulky: součet tržeb 300 000 Kč, průměr 50 000 Kč, rozdíl červen – leden 23 000 Kč, nejnižší únor, nejvyšší červen.

## Tělo e-mailu

```html
<p>Dobré ráno z kurzu <strong>Začínáme s ChatGPT</strong>.</p>

<p>Včera jste si při plánování nechali sestavit tabulku, která porovnávala varianty. Dnes to otočíme: tabulku s čísly dodáte vy a ChatGPT vám pomůže zjistit, co se z ní dá vyčíst. Nepotřebujete vzorce ani programování. Potřebujete vědět, jak se ptát a jak si výsledek zkontrolovat.</p>

<h3><strong>1. Co jsou data a dataset</strong></h3>

<p><strong>Data</strong> jsou zaznamenané údaje, se kterými se dá dál pracovat: tržby, docházka, výdaje nebo počty kroků. <strong>Dataset</strong> (česky datová sada) je sada takových údajů pohromadě, nejčastěji jedna tabulka. Každý řádek je jeden záznam, například jeden měsíc, a každý sloupec jedna sledovaná věc. Obecné vysvětlení najdete na Wikipedii pod heslem <a target="_blank" rel="noopener noreferrer nofollow" href="https://cs.wikipedia.org/wiki/Data">Data</a>.</p>

<p>ChatGPT si s tabulkou poradí nejlépe, když má v prvním řádku srozumitelné názvy sloupců a na každém řádku právě jeden záznam. Doporučuje to i <a target="_blank" rel="noopener noreferrer nofollow" href="https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt">nápověda OpenAI k analýze dat</a>.</p>

<h3><strong>2. Jak tabulku do ChatGPT dostat</strong></h3>

<p>Máte dvě možnosti a obě fungují i na bezplatném účtu:</p>

<ul>
  <li><p><strong>Vložit ji jako text.</strong> Malou tabulku zkopírujete přímo do zprávy. Pro dnešek je to nejjednodušší cesta.</p></li>
  <li><p><strong>Nahrát soubor.</strong> U pole pro zprávu zvolte <strong>+</strong> a potom volbu pro přidání fotek a souborů (anglicky <em>Add photos &amp; files</em>). ChatGPT přijímá běžné tabulkové formáty, například XLSX z Excelu nebo CSV.</p></li>
</ul>

<p>Nahrávání souborů a analýza dat mají na bezplatném účtu vlastní limity. Když je vyčerpáte, ChatGPT vám to oznámí a je potřeba počkat. Placené tarify mají limity vyšší, pro tuto lekci je ale nepotřebujete.</p>

<p>Stále platí pravidlo z páté lekce: tabulky se jmény, platy, adresami nebo údaji zákazníků do osobního účtu nevkládejte. Na cvičení použijte naši smyšlenou tabulku.</p>

<h3><strong>3. Jak se ptát: popis, trend, rozdíl</strong></h3>

<p>Dobré otázky na tabulku postupují od obecného ke konkrétnímu:</p>

<ul>
  <li><p><strong>Popis:</strong> „Co je v tabulce a co znamenají jednotlivé sloupce?“</p></li>
  <li><p><strong>Trend:</strong> „Jak se tržby vyvíjely v čase?“ <strong>Trend</strong> je směr, kterým se čísla dlouhodobě ubírají: rostou, klesají, nebo zůstávají podobná.</p></li>
  <li><p><strong>Rozdíl:</strong> „Který měsíc se nejvíc liší od ostatních a čím?“</p></li>
</ul>

<p>Můžete si říct také o <strong>graf</strong>. To je obrázek, který čísla ukáže jako sloupce nebo čáru, takže je vývoj vidět na první pohled. ChatGPT umí graf z dodaných dat vytvořit jako obrázek. Když grafu nerozumíte, napište: „Vysvětli mi dvěma větami, co ten graf ukazuje.“</p>

<h3><strong>4. Proč číslům nevěřit naslepo</strong></h3>

<p>ChatGPT je jazykový model. Skládá text, a pokud zrovna nepoužije nástroj na výpočty, může se v počtech splést stejně sebejistě jako u jiných halucinací. U některých úloh si podle nápovědy OpenAI napíše a spustí krátký program, který čísla spočítá. Programu rozumět nemusíte. Ani pak ale není výsledek zaručený: ChatGPT mohl vzít jiný sloupec nebo si otázku vyložit jinak, než jste ji mysleli.</p>

<p>Proto si u každé práce s čísly aspoň jedno číslo ověřte sami. Nemusíte přepočítávat všechno. Když sedí číslo, které jste si vybrali vy, můžete zbytku věřit víc. Když nesedí, víte, že je potřeba projít celý výsledek.</p>

<h3><strong>Dnešní úkol</strong></h3>

<ol>
  <li><p>Otevřete nový chat a odešlete tento prompt i s tabulkou:</p>
    <p><strong>„Níže je tabulka malé kavárny za první pololetí. Sloupce jsou: měsíc; tržby v Kč; počet zákazníků. Nejdřív mi čtyřmi větami popiš, co z tabulky plyne. Potom spočítej celkové tržby, průměrné měsíční tržby a o kolik korun byly červnové tržby vyšší než lednové. U každého výpočtu ukaž postup. Piš pro člověka, který s čísly běžně nepracuje.<br>
    leden; 42000; 600<br>
    únor; 38500; 550<br>
    březen; 45500; 650<br>
    duben; 51000; 680<br>
    květen; 58000; 725<br>
    červen; 65000; 795“</strong></p></li>
  <li><p>Přečtěte si slovní shrnutí. Odpovídá tomu, co v tabulce vidíte sami?</p></li>
  <li><p>Pošlete navazující prompt:</p>
    <p><strong>„Který měsíc se nejvíc vymyká trendu? Odděl, co plyne přímo z čísel, od toho, co jen odhaduješ jako možnou příčinu. Nakonec vytvoř sloupcový graf tržeb po měsících.“</strong></p></li>
  <li><p><strong>Zkontrolujte jedno číslo.</strong> Sečtěte tržby na kalkulačce v telefonu. Má vyjít 300 000 Kč. Kdo chce, ověří i průměr (50 000 Kč) a rozdíl mezi červnem a lednem (23 000 Kč).</p></li>
  <li><p>Pokud ChatGPT uvedl jiný součet, napište mu: <strong>„Tvůj součet tržeb nesedí, mně vyšlo 300 000 Kč. Najdi chybu a oprav všechny výpočty, které na součtu závisejí.“</strong></p></li>
</ol>

<p>Všimněte si, že tabulka říká, <em>co</em> se stalo, ale ne <em>proč</em>. Důvod únorového poklesu ChatGPT nezná. Může jen hádat, a proto jste po něm chtěli odhady oddělit.</p>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> stejný postup použijte na přehled objednávek nebo docházky bez jmen. Do zprávy pro vedení dejte jen čísla, která jste sami přepočítali.</p></li>
  <li><p><strong>Učitelé:</strong> vložte body z písemky bez jmen žáků a zeptejte se na průměr a na úlohu, která dopadla nejhůř. Jeden průměr si přepočítejte.</p></li>
  <li><p><strong>Živnostníci:</strong> vložte tržby a výdaje po měsících. Než podle výsledku změníte ceny, ověřte součty proti svému účetnictví.</p></li>
</ul>

<h3><strong>Kontrola</strong></h3>

<ul>
  <li><p>Vyšel vám na kalkulačce stejný součet tržeb jako ChatGPT, tedy 300 000 Kč?</p></li>
  <li><p>Odlišuje odpověď to, co plyne z čísel, od odhadů příčin?</p></li>
  <li><p>Odpovídá graf tabulce: šest sloupců, nejnižší únor, nejvyšší červen?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Dataset je sada údajů pohromadě, nejčastěji tabulka s jasně pojmenovanými sloupci.</p></li>
  <li><p>Malou tabulku stačí vložit do zprávy jako text, i na bezplatném účtu.</p></li>
  <li><p>Ptejte se postupně: na popis, na trend a na rozdíly.</p></li>
  <li><p>ChatGPT se v počtech může splést. Aspoň jedno číslo si vždy přepočítejte sami.</p></li>
  <li><p>Tabulka ukazuje, co se stalo. Příčiny jsou jen odhad, dokud je neověříte jinde.</p></li>
</ul>

<p>Zítra se podíváme na pomocníky nastavené pro jeden konkrétní úkol. Řekneme si, proč vlastní GPTs končí, a napíšete si zadání pro vlastního pomocníka, které uložíte do projektu.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
