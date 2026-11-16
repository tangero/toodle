# Claude jako pracovní agent - Lekce 2

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 2
- Název: Zadání úlohy: brief, se kterým agent nebloudí
- Předmět e-mailu: Lekce 2: Pět řádků, které rozhodnou o výsledku
- Preheader: Šablona zadání pro samostatnou práci a první úloha podle ní.
- Délka čtení: 6 minut + asi 20 minut práce
- Režim doručení: on_click

## Tělo e-mailu

```html
<p>Ahoj. Minule ti Claude sepsal, co je ve složce Kurz AI. Byla to jednoduchá úloha a stačila na ni jedna věta.</p>

<p>Dnes se naučíš psát <strong>brief</strong>, tedy zadání pro práci, kterou agent udělá sám a ty u ní nebudeš sedět. Na téhle dovednosti stojí celý kurz. Všechny další lekce jsou jen různé briefy.</p>

<h3><strong>1️⃣ Proč u agenta nestačí zadání jako do chatu</strong></h3>

<p>V chatu vidíš odpověď za pár vteřin a hned ji opravíš. Agent pracuje minuty, udělá dvacet kroků a rozhodne při nich dvacet věcí za tebe: které soubory otevřít, jak pojmenovat výstup, co dělat, když něco nesedí. Co mu neřekneš, to si domyslí. A domyslí si to sebejistě.</p>

<p>Představ si, že úkol předáváš šikovnému brigádníkovi a odcházíš na celý den. Co všechno bys mu řekl/a mezi dveřmi?</p>

<h3><strong>2️⃣ Pět částí briefu</strong></h3>

<ul>
  <li><p><strong>Cíl:</strong> co má vzniknout, pro koho a k čemu to bude. Jedna až dvě věty.</p></li>
  <li><p><strong>Podklady:</strong> které soubory a složky použít. A které ne.</p></li>
  <li><p><strong>Výstup:</strong> formát, název souboru, kam ho uložit, rozsah.</p></li>
  <li><p><strong>Hotovo:</strong> podle čeho se pozná, že je práce dokončená a správná.</p></li>
  <li><p><strong>Omezení:</strong> co nesmí (mazat, přepisovat originály, hledat na webu) a kdy se má zeptat.</p></li>
</ul>

<p>Nejdůležitější a nejčastěji vynechaný je bod <strong>Hotovo</strong>. V chatu jsi kritériem ty: čteš a řekneš „stačí“. Agent tě u sebe nemá. Bez kritéria skončí buď u první verze, která nějak vypadá, nebo přidává věci, o které nikdo nestál. Dobré „hotovo“ se dá zkontrolovat: „tabulka má řádek pro každý soubor“ je lepší než „tabulka je kompletní“.</p>

<h3><strong>3️⃣ Nejdřív plán, potom práce</strong></h3>

<p>Do každého briefu přidej větu: <strong>„Nejdřív mi napiš plán a počkej na souhlas.“</strong> Plán přečteš za půl minuty a uvidíš v něm, jak agent zadání pochopil. Opravit plán stojí jednu větu. Opravit hotovou práci stojí další úlohu.</p>

<p>V plánu hledej tři věci: sahá agent jen na soubory, které má? Vznikne výstup tam, kde ho chceš? A je tam krok, kterým si výsledek sám zkontroluje?</p>

<h3><strong>✏️ Dnešní úkol, krok 1: ulož si šablonu</strong></h3>

<p>Ve složce Kurz AI si vytvoř textový soubor <strong>brief-sablona.txt</strong> (v Poznámkovém bloku nebo TextEditu) a zkopíruj do něj:</p>

<p><strong>CÍL: [co má vzniknout, pro koho, k čemu]<br>
PODKLADY: [soubory a složky, které použít; co nepoužívat]<br>
VÝSTUP: [formát, název, kam uložit, rozsah]<br>
HOTOVO: [jak se pozná, že je to dokončené a správné]<br>
OMEZENÍ: [co nesmíš; kdy se zeptat]<br>
Nejdřív mi napiš plán a počkej na souhlas. Na konci napiš, co jsi udělal, co jsi nemohl udělat a čím si nejsi jistý.</strong></p>

<p>Poslední věta je stejně důležitá jako plán. Agent ti na konci sám řekne, kde hledat chyby.</p>

<h3><strong>✏️ Krok 2: první úloha podle briefu</strong></h3>

<p>Otevři Claude Desktop, v nové konverzaci připoj složku <strong>Kurz AI</strong> a tentokrát povol i úpravy, protože vznikne nový soubor. Pošli:</p>

<p><strong>„CÍL: Chci jednostránkový průvodce cvičnými daty pro kolegu, který je uvidí poprvé a potřebuje vědět, který soubor na co použít.<br>
PODKLADY: všechny soubory ve složce Kurz AI včetně podsložek a souborů ZDROJE.txt. Web nepoužívej.<br>
VÝSTUP: dokument Word s názvem pruvodce-daty.docx, uložený přímo do složky Kurz AI. Nejvýš jedna strana. Tabulka: soubor, co obsahuje, období, jednotky, zdroj a licence, na co si dát pozor.<br>
HOTOVO: tabulka má řádek pro každý datový soubor ve složce, u každého je zdroj podle ZDROJE.txt a pod tabulkou jsou tři věty, čím začít.<br>
OMEZENÍ: žádný existující soubor neměň, nepřesouvej a nemaž. Když si u souboru nejsi jistý obsahem, napiš to do sloupce ‚pozor‘, nehádej.<br>
Nejdřív mi napiš plán a počkej na souhlas. Na konci napiš, co jsi udělal, co jsi nemohl udělat a čím si nejsi jistý.“</strong></p>

<p>Přečti si plán. Pokud v něm chybí některá podsložka nebo se chystá soubor uložit jinam, oprav to hned. Pak dej souhlas a nech Claude pracovat.</p>

<h3><strong>✏️ Krok 3: zkus to schválně špatně</strong></h3>

<p>V nové konverzaci se stejnou složkou pošli jen: <strong>„Udělej mi přehled těch dat.“</strong> Soubor, který vznikne, pojmenuj jinak nebo ho pak smaž. Porovnej oba výsledky. Kam se uložil? Jak je dlouhý? Je v něm zdroj a licence? Rozdíl mezi nimi je přesně to, co dělá brief.</p>

<h3><strong>💼 Pro tvoji práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> napiš brief na report, který děláš každý měsíc. U bodu Hotovo vyjmenuj kapitoly a grafy, které v něm nesmí chybět.</p></li>
  <li><p><strong>Učitelé:</strong> brief na pracovní list: ročník, téma, rozsah, a Hotovo = „každá úloha jde vyřešit jen z výkladu na listu“.</p></li>
  <li><p><strong>Živnostníci:</strong> brief na cenovou nabídku: podklady jsou ceník a poptávka, Omezení = „ceny jen z ceníku, nic neodhaduj“.</p></li>
</ul>

<h3><strong>🔍 Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Proti bodu Hotovo:</strong> spočítej datové soubory ve složce a řádky v tabulce. Sedí?</p></li>
  <li><p><strong>Proti Omezením:</strong> změnilo se ve složce něco kromě nového dokumentu? Seřaď soubory podle data změny.</p></li>
  <li><p><strong>Namátkou:</strong> u dvou souborů porovnej zdroj a licenci se ZDROJE.txt.</p></li>
  <li><p><strong>Závěrečná zpráva:</strong> co agent napsal, že nemohl udělat nebo čím si není jistý? Prověř to první.</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Brief má pět částí: cíl, podklady, výstup, hotovo, omezení.</p></li>
  <li><p>„Hotovo“ musí jít zkontrolovat. Bez něj agent neví, kdy přestat.</p></li>
  <li><p>Nejdřív plán a souhlas, na konci zpráva o tom, co se nepovedlo.</p></li>
  <li><p>Šablonu máš uloženou. Budeš ji používat v každé další lekci.</p></li>
</ul>

<p>V další lekci přijde první úloha, při které se soubory opravdu hýbou: úklid neuklizené složky. A s ní pravidlo, které tě jednou zachrání: vždycky na kopii.</p>

<p>Až budeš mít průvodce daty a projdeš kontrolu, klikni pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Letní školy AI</strong><br>Patrick a Iva</p>
```
