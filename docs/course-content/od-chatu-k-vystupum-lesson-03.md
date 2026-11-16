# Od chatu k hotovým výstupům - Lekce 3

## Metadata

- Kurz: Od chatu k hotovým výstupům
- Lekce: 3
- Název: Dlouhý dokument: shrnutí, které se dá ověřit
- Předmět e-mailu: Lekce 3: 31 stran na jednu, a každé číslo dohledatelné
- Preheader: Shrnutí zprávy o rozpočtu Prahy s odkazy na strany a kontrola tří čísel, než ho pošleš dál.
- Délka čtení: 8 minut
- Poznámka pro autory: čísla v lekci ověřena proti `praha-zprava-o-plneni-rozpoctu-2025.pdf` (strany podle PDF prohlížeče, dokument nemá tištěná čísla stran) 12. 11. 2026.

## Tělo e-mailu

```html
<p>Dobré ráno. Včera jsi založil/a projekt Rozpočet Prahy a nahrál/a do něj podklady. Dnes z nich vznikne první skutečný výstup.</p>

<p>Uděláš z 31stránkové zprávy o plnění rozpočtu <strong>shrnutí na jednu stranu</strong>, ve kterém půjde každé číslo dohledat. A pak tři čísla sám/sama ověříš. To je dovednost, kterou budeš potřebovat u každého dalšího výstupu v kurzu.</p>

<h3><strong>1️⃣ Proč u dlouhých dokumentů nestačí „shrň mi to“</strong></h3>

<p>Když napíšeš jen „shrň mi tohle PDF“, dostaneš obecný text, který zní rozumně, ale nevíš:</p>

<ul>
  <li><p><strong>pro koho</strong> je. Zastupitel chce jiné informace než rodič nebo podnikatel.</p></li>
  <li><p><strong>odkud</strong> je které číslo. Bez zdroje ho nemáš jak ověřit.</p></li>
  <li><p><strong>co vynechal.</strong> Shrnutí je vždycky výběr. Chceš vědět, podle čeho AI vybírala.</p></li>
</ul>

<p>Dobré zadání shrnutí má proto čtyři části: <strong>čtenář</strong>, <strong>rozsah</strong>, <strong>odkazy na zdroj</strong> a <strong>formát</strong>.</p>

<h3><strong>2️⃣ Proč AI chybuje právě v číslech</strong></h3>

<p>AI si PDF převádí hlavně na text. Tabulky se při tom často rozpadnou na řady čísel bez jasných sloupců. A ve zprávě o rozpočtu má skoro každá tabulka vedle sebe pět sloupců, které vypadají podobně:</p>

<ul>
  <li><p><strong>rozpočet schválený</strong>: s čím město do roku vstupovalo,</p></li>
  <li><p><strong>rozpočet upravený</strong>: plán po všech změnách během roku,</p></li>
  <li><p><strong>skutečnost 2025</strong>: kolik opravdu vybralo nebo utratilo,</p></li>
  <li><p><strong>skutečnost 2024 a 2023</strong> pro srovnání.</p></li>
</ul>

<p>Splést si sloupec je ta nejčastější chyba. Druhá je jednotka: zpráva uvádí částky <strong>v tisících Kč</strong>, takže „148 140 567,66“ znamená zhruba 148 miliard, ne 148 milionů. Třetí je rok.</p>

<h3><strong>✏️ Dnešní úkol, krok 1: shrnutí s odkazy na strany</strong></h3>

<p>Otevři projekt Rozpočet Prahy, založ v něm nový chat a pošli:</p>

<p><strong>„Ze zprávy o plnění rozpočtu Prahy za rok 2025 (PDF v podkladech) mi udělej shrnutí na jednu stranu A4.<br>
Čtenář: obyvatel Prahy, který chce vědět, jak město v roce 2025 hospodařilo, ale rozpočtům nerozumí.<br>
Obsah: celkové příjmy, výdaje a výsledek hospodaření; odkud město bere nejvíc peněz; na co nejvíc utrácí; co se nepovedlo vyčerpat podle plánu; srovnání s rokem 2024.<br>
Pravidla: u každého čísla uveď v závorce stranu PDF, ze které je. Uváděj vždy skutečnost, ne rozpočet, pokud výslovně nepíšeš o plánu. Částky převeď na miliardy Kč s jedním desetinným místem.<br>
Formát: nadpis, pět krátkých odstavců s mezititulky, na konci tři věty ‚Co z toho plyne‘.“</strong></p>

<p>Všimni si, že pravidlo o skutečnosti a rozpočtu míří přesně na nejčastější chybu z bodu 2. Dobrá zadání nevznikají z obecných rad, ale z toho, co se u daného typu dokumentu obvykle pokazí.</p>

<p><strong>V Claude</strong> i <strong>v ChatGPT</strong> je postup stejný. Pokud jsi projekt nezaložil/a, nahraj PDF přímo do chatu přes ikonu sponky nebo <em>+</em> u pole pro zprávu.</p>

<h3><strong>✏️ Krok 2: nech AI přiznat, kde si není jistá</strong></h3>

<p>Pošli navazující prompt:</p>

<p><strong>„Projdi své shrnutí znovu. U každého čísla zkontroluj v PDF, že je ze správného sloupce (skutečnost 2025) a správně převedené z tisíců Kč. Vypiš mi tabulku: číslo ve shrnutí, strana, původní hodnota v PDF, převod. Označ čísla, u kterých máš pochybnost.“</strong></p>

<p>Tahle tabulka je tvůj kontrolní seznam. AI se při druhém průchodu často opraví sama. Kontrolu ale za tebe nedokončí, protože by kontrolovala sama sebe.</p>

<h3><strong>✏️ Krok 3: ověř tři čísla sám/sama</strong></h3>

<p>Otevři PDF ve svém prohlížeči nebo čtečce. Stranou myslíme pořadí strany v souboru, jak ho ukazuje prohlížeč, protože zpráva vlastní čísla stran nemá. Začni třemi hlavními čísly. Souhrnná tabulka je na <strong>straně 4</strong> a ve sloupci Skutečnost k 31. 12. 2025 bys měl/a najít:</p>

<ul>
  <li><p>příjmy celkem 148 140 567,66 tis. Kč, tedy asi <strong>148,1 mld. Kč</strong>,</p></li>
  <li><p>výdaje celkem 123 970 124,04 tis. Kč, tedy asi <strong>124,0 mld. Kč</strong>,</p></li>
  <li><p>rozdíl (přebytek) 24 170 443,63 tis. Kč, tedy asi <strong>24,2 mld. Kč</strong>.</p></li>
</ul>

<p>Pokud tvoje shrnutí uvádí třeba výdaje 145 mld. Kč, AI vzala sloupec „rozpočet upravený“ místo skutečnosti. Napiš jí to konkrétně: <strong>„Výdaje na straně 4 jsou ve sloupci Skutečnost 123 970 124,04 tis. Kč. Oprav to a zkontroluj stejnou chybu u ostatních čísel.“</strong></p>

<p>Pak si z kontrolní tabulky vyber ještě <strong>dvě čísla z jiných stran</strong> a dohledej je stejně. U těch ti správnou hodnotu neprozradíme, a právě proto je to ta důležitější část cvičení.</p>

<p>Proč jen pár čísel? Nemusíš kontrolovat všechno. Když namátkou vybraná čísla sedí, je dobrá šance, že AI pracovala se správným sloupcem. Když nesedí jediné, prověř všechna.</p>

<h3><strong>🌀 Bonus: i úřední dokument se může splést</strong></h3>

<p>Na straně 9 se v textu píše, že příjmy „v upraveném rozpočtu“ byly 117,9 mld. Kč. Tabulka hned pod tím ale uvádí upravený rozpočet 128,3 mld. Kč a 117,9 mld. je ve skutečnosti rozpočet <em>schválený</em>. Zkus se AI zeptat: <strong>„Najdi ve zprávě místa, kde si text a tabulka odporují.“</strong> Pozorné čtení dlouhých dokumentů je jedna z věcí, ve kterých ti AI opravdu ušetří čas, pokud jí řekneš, co hledat.</p>

<h3><strong>💼 Pro tvoji práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> shrnutí výroční zprávy nebo smlouvy pro vedení, s odkazy na strany a články.</p></li>
  <li><p><strong>Učitelé:</strong> shrnutí metodiky, inspekční zprávy nebo kapitoly učebnice pro kolegy, se stranami, aby si každý mohl dohledat detail.</p></li>
  <li><p><strong>Živnostníci:</strong> stáhni si sadu <a target="_blank" rel="noopener noreferrer nofollow" href="https://skola.aivefirmach.cz/soubory/podnikani.zip">Podnikání (ZIP)</a> a nech si stejným postupem vysvětlit pokyny k daňovému přiznání: „co se týká mě jako OSVČ, s odkazem na stranu“.</p></li>
</ul>

<h3><strong>🔍 Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Čísla:</strong> tři ověřená proti PDF, správný sloupec, správná jednotka, správný rok.</p></li>
  <li><p><strong>Zdroje:</strong> má každé číslo stranu? Číslo bez zdroje buď doplň, nebo smaž.</p></li>
  <li><p><strong>Výběr:</strong> zeptej se „Co důležitého ve shrnutí chybí a proč?“ a rozhodni sám/sama, jestli to tam chybí.</p></li>
  <li><p><strong>Tón:</strong> shrnutí má informovat, ne hodnotit. Pokud v něm AI město chválí nebo kritizuje, a ty jsi to nechtěl/a, napiš jí to.</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Dobré zadání shrnutí: čtenář, rozsah, odkazy na zdroj, formát.</p></li>
  <li><p>AI chybuje v číslech z PDF tabulek: sloupec, jednotka, rok. Řekni jí předem, na co si má dát pozor.</p></li>
  <li><p>Nech AI vypsat kontrolní tabulku a tři čísla ověř sám/sama.</p></li>
  <li><p>Opravené shrnutí nech v tomhle chatu projektu. Zítra v něm budeš pokračovat a uděláš ze shrnutí první živý dokument.</p></li>
</ul>

<p>Zítra se shrnutí promění v <strong>dokument</strong>, který můžeš upravovat po odstavcích, sdílet odkazem a stáhnout jako Word. Ukážeme si Claude Docs a dokumenty v režimu Work v ChatGPT.</p>

<p>— <strong>Tým Letní školy AI</strong><br>Patrick a Iva</p>
```
