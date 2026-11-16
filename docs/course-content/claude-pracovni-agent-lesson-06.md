# Claude jako pracovní agent - Lekce 6

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 6
- Název: Prezentace z reportu a úpravy slajd po slajdu
- Předmět e-mailu: Lekce 6: Z reportu prezentace, ze které nic nepřetéká
- Preheader: Slides z reportu, úpravy po slajdech, tříminutová verze a kontrola čísel.
- Délka čtení: 5 minut + asi 20 minut práce
- Režim doručení: on_click
- Fakta o funkcích ověřena: 12. 11. 2026 (support.claude.com – artefakty a Slides; claude.com/blog/cowork-is-now-claude)

## Tělo e-mailu

```html
<p>Ahoj. Report je hotový a zkontrolovaný. Dnes z něj uděláš <strong>prezentaci</strong> ve dvou délkách, na deset a na tři minuty, a uložíš ji jako PowerPoint a PDF.</p>

<p>Pokud jsi prošel/prošla kurzem Od chatu k hotovým výstupům, osnovu a pravidlo „jeden slajd, jedna myšlenka“ už znáš. Tady přidáme to, co je pro agenta specifické: prezentace vzniká ze souborů ve složce a ty ji řídíš krátkými pokyny.</p>

<h3><strong>1️⃣ Prezentace není zkrácený report</strong></h3>

<p>Když agentovi řekneš „udělej z reportu prezentaci“, dostaneš report nasekaný do odrážek. Prezentace má jinou stavbu:</p>

<ul>
  <li><p><strong>Report</strong> se čte. Může jít do podrobností a čtenář se vrací.</p></li>
  <li><p><strong>Prezentace</strong> se poslouchá. Publikum vidí slajd pár vteřin a pamatuje si z něj jednu věc.</p></li>
</ul>

<p>Proto v briefu řekni, <strong>co si má publikum odnést</strong>, a nech agenta vybrat z reportu jen to, co k tomu vede. Zbytek zůstane v reportu, na který prezentace odkáže.</p>

<h3><strong>✏️ Dnešní úkol, krok 1: osnova a slajdy</strong></h3>

<p>V Claude Desktop připoj složku Kurz AI a pošli:</p>

<p><strong>„CÍL: Prezentace na 10 minut pro veřejné setkání s občany. Mají si odnést tři věci: Praha skončila rok 2025 v přebytku, velkou část plánovaných investic nevyčerpala, a největší položkou rozpočtu Magistrátu je doprava.<br>
PODKLADY: jen report hospodareni-prahy-v-cislech.docx a sešit rozpocet-praha-2024-2026.xlsx ve složce Kurz AI. Čísla ber z reportu, grafy ze sešitu.<br>
VÝSTUP: prezentace (Slides), nejvýš 8 slajdů. Nadpis každého slajdu je tvrzení, ne téma. Na slajdu jedno hlavní číslo a nejvýš tři krátké body. Poznámky řečníka ke každému slajdu. Na posledním slajdu zdroje.<br>
HOTOVO: každé číslo na slajdech je i v reportu ve stejné hodnotě. U čísel je vždy řečeno, jestli jde o Prahu celkem, nebo o Magistrát.<br>
OMEZENÍ: žádná nová čísla, žádné hodnocení. Soubory ve složce neměň.<br>
Nejdřív mi napiš osnovu slajdů (nadpis, hlavní číslo, jedna věta) a počkej na souhlas.“</strong></p>

<p>Osnovu uprav, dokud nesedí. Pak nech prezentaci vytvořit. Otevře se vedle konverzace.</p>

<h3><strong>✏️ Krok 2: úpravy slajd po slajdu</strong></h3>

<p>Prezentaci projdi a posílej krátké pokyny s číslem slajdu. Čím užší pokyn, tím míň toho agent změní okolo:</p>

<ul>
  <li><p><strong>„Slajd 3: text zkrať na polovinu, zbytek přesuň do poznámek řečníka.“</strong></p></li>
  <li><p><strong>„Slajd 5: přidej graf šesti největších oblastí ze sešitu, list Graf. Osa od nuly.“</strong></p></li>
  <li><p><strong>„Slajd 6: do nadpisu doplň, že jde o schválený rozpočet Magistrátu.“</strong></p></li>
</ul>

<p>Drobnosti, jako překlep nebo pořadí bodů, oprav rovnou rukou. V Slides můžeš upravovat přímo slajd. A komentář na slajdu se zmínkou @Claude funguje stejně jako pokyn v konverzaci.</p>

<h3><strong>✏️ Krok 3: tříminutová verze</strong></h3>

<p><strong>„Udělej z prezentace druhou, zkrácenou verzi na 3 minuty: nejvýš 4 slajdy, jen tři hlavní sdělení a závěr. Původní prezentaci neměň. Poznámky řečníka napiš tak, aby se daly přečíst nahlas za tři minuty.“</strong></p>

<p>Krátká verze je dobrý test té dlouhé. Pokud se do tří minut nevejde to hlavní, dlouhá verze nejspíš taky nemá jasné sdělení.</p>

<h3><strong>✏️ Krok 4: export do složky</strong></h3>

<p><strong>„Ulož obě prezentace do složky Kurz AI jako PowerPoint a jako PDF. Názvy: praha-rozpocet-10min a praha-rozpocet-3min.“</strong></p>

<p>Když to agent do složky uložit nezvládne, stáhni soubory přes export v prezentaci a ulož je ručně. Slides se exportují do PowerPointu a PDF.</p>

<h3><strong>💼 Pro tvoji práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> prezentace pro vedení z čtvrtletního reportu a tříminutová verze na poradu.</p></li>
  <li><p><strong>Učitelé:</strong> výklad na jednu hodinu z vlastní přípravy. Krátká verze poslouží jako opakování na začátku příští hodiny.</p></li>
  <li><p><strong>Živnostníci:</strong> představení firmy pro většího zákazníka a krátká verze na úvodní schůzku.</p></li>
</ul>

<h3><strong>🔍 Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Čísla proti reportu:</strong> projdi všechny slajdy. Každé číslo najdi v reportu. Tady se nespoléhej na vzorek, slajdů je jen pár.</p></li>
  <li><p><strong>Celek:</strong> je u každého čísla jasné, jestli jde o Prahu, nebo o Magistrát?</p></li>
  <li><p><strong>Soubory:</strong> otevři pptx i PDF ze složky. Nepřetéká text? Jsou tam grafy a poznámky řečníka?</p></li>
  <li><p><strong>Nahlas:</strong> přečti tříminutovou verzi se stopkami.</p></li>
  <li><p><strong>Složka:</strong> změnilo se v ní něco kromě čtyř nových souborů?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Prezentace se staví od toho, co si má publikum odnést, ne od reportu.</p></li>
  <li><p>Úpravy zadávej úzce a s číslem slajdu.</p></li>
  <li><p>Krátká verze prověří, jestli má dlouhá jasné sdělení.</p></li>
  <li><p>U prezentace zkontroluj všechna čísla, ne jen vzorek.</p></li>
</ul>

<p>V další lekci zadáš úlohu, ze které vzniknou čtyři soubory najednou: celý výukový balíček. A uvidíš, co se stane se zadáním, když má agent hlídat, aby spolu výstupy seděly.</p>

<p>Až budeš mít prezentace ve složce, klikni pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Letní školy AI</strong><br>Patrick a Iva</p>
```
