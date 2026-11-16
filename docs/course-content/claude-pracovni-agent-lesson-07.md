# Claude jako pracovní agent - Lekce 7

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 7
- Název: Celý výukový balíček jednou úlohou
- Předmět e-mailu: Lekce 7: Jedno zadání, čtyři soubory
- Preheader: Pracovní list, test s klíčem, prezentace a průvodní e-mail, které spolu sedí.
- Délka čtení: 6 minut + asi 30 minut práce
- Režim doručení: on_click

## Tělo e-mailu

```html
<p>Dobrý den. Dosud měla každá úloha jeden hlavní výstup. Dnes jich bude několik najednou: <strong>pracovní list, test s klíčem, krátká prezentace a průvodní e-mail</strong>. Dohromady balíček, se kterým může někdo jiný odučit dvacet minut o tom, jak hospodaří Praha.</p>

<p>Novinka není v počtu souborů. Novinka je v tom, že výstupy musí <strong>sedět k sobě</strong>: test se smí ptát jen na to, co je v listu, a prezentace nesmí tvrdit nic jiného než list.</p>

<h3><strong>1. Proč jedna úloha a ne čtyři</strong></h3>

<p>Čtyři samostatné úlohy by daly čtyři dobré soubory, které se k sobě nehodí. V jedné se píše „přebytek“, ve druhé „kladné saldo“. Test se ptá na číslo, které v listu není. Když má agent všechno v jedné úloze, může si to ohlídat. Musíte mu ale říct, že má, a v jakém pořadí:</p>

<ol>
  <li><p><strong>Nejdřív cíle:</strong> co má člověk po dvaceti minutách umět. Tři věci.</p></li>
  <li><p><strong>Potom pracovní list,</strong> který ty tři věci naučí.</p></li>
  <li><p><strong>Potom test,</strong> který je ověří, a jen z listu.</p></li>
  <li><p><strong>Nakonec prezentace a e-mail,</strong> které z listu vycházejí.</p></li>
</ol>

<p>Tomu pořadí se říká práce od cíle. Dobří učitelé tak plánují hodiny a dobře funguje i pro školení kolegů nebo návody pro zákazníky.</p>

<h3><strong>2. Publikum rozhoduje o všem</strong></h3>

<p>Hlavní cvičení je psané pro žáky osmé a deváté třídy. Jestli chcete, vyměňte v briefu řádek o publiku za jeden z těchto:</p>

<ul>
  <li><p><strong>Kolegové:</strong> „Úředníci nebo učitelé, kteří mají rozpočet umět vysvětlit druhým. 20 minut na poradě.“</p></li>
  <li><p><strong>Veřejnost:</strong> „Dospělí na besedě v knihovně, bez znalosti ekonomie.“</p></li>
</ul>

<p>Všimněte si, co všechno se tím změní: slovník, délka vět, typ úloh i to, jestli má smysl test.</p>

<h3><strong>Dnešní úkol: brief na balíček</strong></h3>

<p>V Claude Desktop připojte složku Kurz AI s povolenými úpravami a pošlete:</p>

<p><strong>„CÍL: Výukový balíček Jak hospodaří Praha, se kterým učitel odučí 20 minut v hodině občanské výchovy.<br>
PUBLIKUM: žáci 8. a 9. třídy, o rozpočtech nic nevědí.<br>
PODKLADY: report hospodareni-prahy-v-cislech.docx a sešit rozpocet-praha-2024-2026.xlsx ve složce Kurz AI. Čísla jen z nich. Web nepoužívej.<br>
VÝSTUP: nová složka Balicek - rozpocet Prahy ve složce Kurz AI a v ní:<br>
1) 01-pracovni-list.docx: jedna strana. Výklad do 150 slov, tři pojmy vysvětlené jednou větou, jedna malá tabulka se skutečnými čísly, dvě úlohy k vyplnění.<br>
2) 02-test-a-klic.docx: pět otázek s výběrem ze čtyř možností a jedna otevřená. Klíč na samostatné straně: správná odpověď a věta proč.<br>
3) 03-prezentace.pptx: pět slajdů pro učitele k promítání, s poznámkami řečníka a jednou otázkou do třídy na každém slajdu.<br>
4) 04-pruvodni-email.txt: e-mail kolegovi učiteli do 120 slov: co v balíčku je, jak dlouho to trvá, co si připravit.<br>
POSTUP: nejdřív napiš tři cíle (co žák po 20 minutách umí). Z nich udělej pracovní list. Test se ptá jen na to, co je v listu. Prezentace a e-mail vycházejí z listu. Ve všech souborech používej stejné pojmy a stejná čísla.<br>
HOTOVO: existují čtyři soubory. Na konci mi vypiš tabulku souladu: každá testová otázka a místo v pracovním listu, kde je odpověď. Správné odpovědi jsou rozložené mezi A až D a nejsou delší než ostatní možnosti.<br>
OMEZENÍ: nic mimo novou složku neměň. Žádné obrázky z internetu. Žádná vymyšlená čísla ani příklady, které vypadají jako skutečná data.<br>
Nejdřív mi napiš tři cíle a plán a počkej na souhlas.“</strong></p>

<p>Tři cíle si přečtěte pozorně. Všechno ostatní z nich vyrůstá. Pokud je cíl moc široký („rozumí rozpočtu“), požádejte o konkrétnější („vysvětlí rozdíl mezi příjmem a výdajem a řekne, co je přebytek“).</p>

<h3><strong>Tabulka souladu</strong></h3>

<p>Na konci úlohy dostanete tabulku: otázka a kde je v listu odpověď. Projděte ji řádek po řádku s otevřeným pracovním listem. Je to pět minut a odhalí to dvě nejčastější vady: otázku na něco, co v listu není, a klíč, který neodpovídá textu.</p>

<p>Co nesedí, opravte úzkým pokynem: <strong>„Otázka 4 se ptá na transfery, které v listu nejsou. Nahraď ji otázkou na pojem přebytek a uprav klíč. Ostatní otázky neměň.“</strong></p>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Učitelé:</strong> stejný brief nad vlastním učivem na příští týden. Podklady = vaše příprava a text z učebnice, který smíte použít. K rozboru výsledků školy se hodí veřejná data CERMAT a zprávy ČŠI na jejich webech.</p></li>
  <li><p><strong>Kancelář:</strong> školení nového kolegy: návod na jednu stranu, pět kontrolních otázek, pět slajdů a pozvánka. Podklady = interní postup.</p></li>
  <li><p><strong>Živnostníci:</strong> podklady k nové službě: jednostránkový popis pro zákazníky, nejčastější otázky s odpověďmi, krátká prezentace a e-mail stávajícím klientům. Podklady = ceník a vaše poznámky.</p></li>
</ul>

<h3><strong>Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Test si udělejte sami</strong> jen s pracovním listem v ruce. Jde odpovědět na všechno?</p></li>
  <li><p><strong>Klíč:</strong> dvě odpovědi ověřte proti reportu.</p></li>
  <li><p><strong>Stejná čísla:</strong> vyberte jedno číslo a najděte ho v listu, testu i prezentaci. Je všude stejné?</p></li>
  <li><p><strong>Stejná slova:</strong> říká se téže věci všude stejně?</p></li>
  <li><p><strong>Přiměřenost:</strong> přečtěte výklad očima čtrnáctiletého. Kterému slovu by nerozuměl?</p></li>
  <li><p><strong>Složka:</strong> změnilo se něco mimo nový balíček?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Výstupy, které mají sedět k sobě, zadávejte jednou úlohou a určete pořadí.</p></li>
  <li><p>Pracujte od cíle: co má člověk umět, potom materiál, potom test.</p></li>
  <li><p>Tabulka souladu je nejrychlejší kontrola testu.</p></li>
  <li><p>Publikum změní všechno. Je to první řádek briefu, ne poslední.</p></li>
</ul>

<p>V další lekci pustíte agenta ven ze složky: na web a ke svým připojeným službám. Práce bude zajímavější a pravidla přísnější.</p>

<p>Až bude balíček zkontrolovaný, klikněte pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
