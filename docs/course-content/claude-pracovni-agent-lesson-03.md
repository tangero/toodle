# Claude jako pracovní agent - Lekce 3

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 3
- Název: Úklid složky: přejmenovat, roztřídit, sepsat
- Předmět e-mailu: Lekce 3: Dvanáct souborů, dvě kopie navíc a jeden pořádek
- Preheader: První úloha, při které se soubory opravdu hýbou. Proto vždy na kopii.
- Délka čtení: 6 minut + asi 25 minut práce
- Režim doručení: on_click
- Poznámka pro autory: obsah `neuklizena-slozka.zip` ověřen 12. 11. 2026. Složka „Neuklizena slozka“ má 12 souborů ve třech úrovních (kořen, „k vyrizeni“, „stare“). Duplicity: zpráva o plnění rozpočtu 2× (`duvodova-zprava-i-hl-m-praha.pdf`, `k vyrizeni/zprava - precist!!.pdf`), rozpočet 2025 2× (`data (1).csv`, `stare/rozpocet25 KOPIE.csv`). Unikátních souborů je 10. Vedle složky jsou tři soubory ZDROJE-*.txt.

## Tělo e-mailu

```html
<p>Ahoj. Dnes Claude poprvé pustíš k práci, při které se soubory přejmenovávají a stěhují. Je to nejužitečnější a zároveň nejrizikovější typ úlohy, takže si k ní rovnou osvojíš správné návyky.</p>

<p>Výstupem bude <strong>uklizená složka a soupis souborů v Excelu</strong>.</p>

<h3><strong>1️⃣ Tři pravidla pro práci se soubory</strong></h3>

<ul>
  <li><p><strong>Vždycky na kopii.</strong> Než agenta pustíš ke složce, zkopíruj ji. Originál nech stranou, mimo připojenou složku nebo aspoň pod jasným názvem. Když se cokoli pokazí, kopii smažeš a začneš znovu.</p></li>
  <li><p><strong>Agent nic nemaže.</strong> Ani duplicity, ani „zjevné smetí“. Co je navíc, přesune do zvláštní složky a rozhodneš ty. Claude se před trvalým smazáním ve výchozím nastavení ptá, ale v briefu to napiš i tak.</p></li>
  <li><p><strong>Každý přesun je v soupisu.</strong> Původní název a umístění, nový název a umístění. Bez toho nejde zjistit, kam se co podělo.</p></li>
</ul>

<h3><strong>2️⃣ Pravidlo pojmenování</strong></h3>

<p>Úklid stojí na jednom pravidle, které jde aplikovat bez přemýšlení. Použijeme:</p>

<p><strong>rok_tema_zdroj.pripona</strong>, malými písmeny, bez diakritiky a mezer, slova oddělená pomlčkou. Například <em>2025_rozpocet-magistrat_praha.csv</em>.</p>

<p>Nejde o to, že je tohle pravidlo nejlepší na světě. Jde o to, že je jedno a je napsané. Agent ho dodrží u dvanácti souborů stejně jako u dvanácti set.</p>

<h3><strong>✏️ Dnešní úkol, krok 1: připrav kopii</strong></h3>

<ol>
  <li><p>Stáhni do složky Kurz AI cvičnou sadu a rozbal ji:<br>
  <a target="_blank" rel="noopener noreferrer nofollow" href="https://skola.aivefirmach.cz/soubory/neuklizena-slozka.zip"><strong>⬇️ Neuklizená složka (ZIP, 6 MB)</strong></a></p></li>
  <li><p>Po rozbalení vznikne složka <strong>neuklizena-slozka</strong>. V ní je složka <strong>Neuklizena slozka</strong> a tři soubory ZDROJE. Složku Neuklizena slozka zkopíruj (Ctrl+C a Ctrl+V, na Macu Cmd), kopii přesuň <strong>přímo do složky Kurz AI</strong> a přejmenuj ji na <strong>Uklid - pracovni</strong>.</p></li>
  <li><p>Podívej se dovnitř. Soubory jako <em>data (1).csv</em>, <em>tabulka.xlsx</em> nebo <em>export_final_v2.csv</em> asi znáš i ze svého počítače.</p></li>
</ol>

<h3><strong>✏️ Krok 2: brief na úklid</strong></h3>

<p>V Claude Desktop připoj složku Kurz AI s povolenými úpravami a pošli:</p>

<p><strong>„CÍL: Uklidit složku Uklid - pracovni tak, aby z názvu každého souboru bylo jasné, co obsahuje, a aby v ní nebyly duplicity.<br>
PODKLADY: jen složka Uklid - pracovni ve složce Kurz AI a soubory ZDROJE-*.txt ve složce neuklizena-slozka (ty jen čti). Složku Neuklizena slozka neotvírej a nic v ní neměň, je to originál.<br>
VÝSTUP: 1) Soubory přejmenované podle pravidla rok_tema_zdroj.pripona (malá písmena, bez diakritiky a mezer, slova oddělená pomlčkou). Obsah zjisti otevřením souboru, ne z názvu. 2) Podsložky: rozpocet, statistiky, podnikani, ostatni. 3) Duplicity (soubory se stejným obsahem) přesuň do podsložky _duplicity, nemaž je. 4) Soubor soupis.xlsx v kořeni složky se sloupci: původní název, původní umístění, nový název, nové umístění, co soubor obsahuje, období, zdroj, poznámka.<br>
HOTOVO: v soupisu je řádek pro každý soubor, který ve složce byl. V kořeni složky zůstal jen soupis.xlsx a podsložky. Původní podsložky nech prázdné, nemaž je.<br>
OMEZENÍ: nic nemaž. Obsah souborů neměň. Když u souboru nepoznáš rok nebo zdroj, dej do názvu ‚neznamy‘ a napiš to do poznámky. Soubor poznamky.txt si přečti, může obsahovat nápovědu.<br>
Nejdřív mi napiš plán včetně navržených nových názvů a počkej na souhlas. Na konci napiš, co jsi udělal, co jsi nemohl udělat a čím si nejsi jistý.“</strong></p>

<h3><strong>✏️ Krok 3: přečti plán pořádně</strong></h3>

<p>Tentokrát plán obsahuje konkrétní nové názvy. Projdi je:</p>

<ul>
  <li><p>Poznal Claude, že <em>1300722503.xlsx</em> jsou obyvatelé obcí a <em>tabulka.xlsx</em> mzdy? To z názvu nejde, musel soubory otevřít.</p></li>
  <li><p>Našel <strong>dvě dvojice duplicit</strong>? Zpráva o plnění rozpočtu je ve složce dvakrát a rozpočet na rok 2025 také.</p></li>
  <li><p>Sedí roky u tří rozpočtových tabulek (2024, 2025, 2026)? Podle názvu to poznat nejde, podle sloupce <em>rok</em> uvnitř ano.</p></li>
</ul>

<p>Co nesedí, oprav jednou větou a teprve pak dej souhlas.</p>

<h3><strong>3️⃣ Když se úklid nepovede</strong></h3>

<p>Smaž složku Uklid - pracovni, udělej novou kopii originálu a spusť úlohu znovu s opraveným briefem. Proto jsme pracovali na kopii. Nezkoušej nepovedený úklid „opravovat“ dalšími pokyny, obvykle to zamotá víc věcí, než vyřeší.</p>

<h3><strong>💼 Pro tvoji práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> kopie složky Stažené soubory nebo sdílené složky projektu. Pravidlo pojmenování si vezmi firemní, pokud existuje.</p></li>
  <li><p><strong>Učitelé:</strong> kopie složky s přípravami: třídění podle ročníku a tématu, název <em>rocnik_tema_typ</em>. Bez složek se známkami a jmény žáků.</p></li>
  <li><p><strong>Živnostníci:</strong> kopie složky s nabídkami a podklady k zakázkám, název <em>rok-mesic_zakaznik_typ</em>. Účetní doklady nech mimo, ty mají svůj systém.</p></li>
</ul>

<h3><strong>🔍 Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Počet:</strong> v originále je 12 souborů. V soupisu má být 12 řádků, v podsložkách 10 souborů a ve složce _duplicity 2.</p></li>
  <li><p><strong>Nic nezmizelo:</strong> sečti soubory v uklizené složce (bez soupisu). Je jich pořád 12?</p></li>
  <li><p><strong>Originál:</strong> otevři složku Neuklizena slozka. Je beze změny?</p></li>
  <li><p><strong>Namátkou:</strong> otevři dva přejmenované soubory. Odpovídá obsah názvu? Hlavně rok.</p></li>
  <li><p><strong>Duplicity:</strong> jsou soubory v _duplicity opravdu stejné jako ty ponechané? Porovnej velikost.</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Se soubory vždy na kopii. Originál nech mimo dosah úlohy.</p></li>
  <li><p>Agent nemaže. Přesouvá stranou a rozhoduješ ty.</p></li>
  <li><p>Jedno napsané pravidlo pojmenování a soupis každého přesunu.</p></li>
  <li><p>Počet souborů před a po je nejrychlejší kontrola.</p></li>
</ul>

<p>V další lekci z uklizených tabulek rozpočtu uděláš jednu: sloučíš tři roky, přidáš výpočty a graf. A naučíš se kontrolní součet, který odhalí většinu chyb.</p>

<p>Až budeš mít uklizeno a zkontrolováno, klikni pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Letní školy AI</strong><br>Patrick a Iva</p>
```
