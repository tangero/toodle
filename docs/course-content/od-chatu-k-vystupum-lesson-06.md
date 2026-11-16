# Od chatu k hotovým výstupům - Lekce 6

## Metadata

- Kurz: Od chatu k hotovým výstupům
- Lekce: 6
- Název: Tabulka a graf z otevřených dat
- Předmět e-mailu: Lekce 6: Skoro šest tisíc řádků rozpočtu a jeden graf
- Preheader: Necháte AI spočítat výdaje Magistrátu za tři roky, uděláte graf a jeden součet ověříte.
- Délka čtení: 8 minut
- Poznámka pro autory: kontrolní hodnoty spočítány ze souborů `rozpocet-praha-mhmp-2024/2025/2026.csv` 12. 11. 2026 (sloupec rozpocet_schvaleny, položky začínající 5 a 6). Výdaje celkem 109,4 / 113,5 / 119,1 mld. Kč, oblast Doprava 38,1 / 39,6 / 41,5 mld. Kč.
- Fakta o funkcích ověřena: 12. 11. 2026 (help.openai.com „ChatGPT capabilities overview“ – Data analysis; support.claude.com – artefakty)

## Tělo e-mailu

```html
<p>Dobré ráno. Ve složce s cvičnými daty vám od druhé lekce leží tři tabulky: rozpočty pražského Magistrátu na roky 2024, 2025 a 2026. Dohromady mají skoro šest tisíc řádků.</p>

<p>Dnes z nich vznikne <strong>graf výdajů podle oblastí za tři roky</strong> a tabulka v Excelu. A naučíte se nejdůležitější větu pro práci s daty: „Ukaž mi postup.“</p>

<h3><strong>1. Kdy AI počítá a kdy odhaduje</strong></h3>

<p>Jazykový model sám o sobě počítat neumí spolehlivě. Když mu dáte tisíc čísel a zeptáte se na součet, může ho odhadnout, a odhad bude vypadat stejně sebejistě jako správný výsledek.</p>

<p>Claude i ChatGPT proto umí něco lepšího: napíšou si krátký program, <strong>spustí ho nad vaším souborem</strong> a výsledek vám ukážou. Pak nejde o odhad, ale o výpočet. Poznáte to tak, že v průběhu práce vidíte kroky jako „analyzuji soubor“ a že vám AI na požádání ukáže postup. Když u výsledku žádný postup není, berte číslo jako odhad.</p>

<h3><strong>2. České CSV a jeho nástrahy</strong></h3>

<p>Soubor <strong>CSV</strong> je tabulka uložená jako prostý text. Naše soubory mají tři vlastnosti, které AI musí vědět:</p>

<ul>
  <li><p>sloupce odděluje <strong>středník</strong> a na konci každého řádku je jeden středník navíc (vznikne prázdný sloupec),</p></li>
  <li><p>částky jsou <strong>v tisících Kč</strong> a mají desetinnou <strong>tečku</strong>,</p></li>
  <li><p>ve sloupci <em>pol</em> je číslo položky: začíná-li 1 až 4, jde o <strong>příjem</strong>, 5 a 6 jsou <strong>výdaje</strong>, 8 je financování (půjčky a splátky).</p></li>
</ul>

<p>Kdybyste tohle neřekli, AI sečte příjmy s výdaji dohromady a vyjde nesmysl, který ale bude vypadat jako číslo. U dat platí víc než jinde: <strong>popište sloupce dřív, než se na cokoli zeptáte.</strong></p>

<h3><strong>Dnešní úkol, krok 1: nahrajte tabulky a nechte si je popsat</strong></h3>

<p>Otevřete <strong>nový chat v projektu Rozpočet Prahy</strong> (v ChatGPT zvolte režim Work) a přiložte k němu všechny tři soubory CSV. Tabulky patří k téhle úloze, do podkladů projektu je nedávejte. Pošlete:</p>

<p><strong>„Přikládám rozpočty Magistrátu hl. m. Prahy na roky 2024, 2025 a 2026. Soubory jsou CSV se středníkem, na konci řádku je středník navíc. Částky jsou v tisících Kč s desetinnou tečkou. Sloupec pol je položka: začíná-li 1 až 4, je to příjem, 5 a 6 výdaj, 8 financování. Načti všechny tři soubory programem, ne odhadem. Napiš mi, kolik má každý řádků, jaké má sloupce a jaké hodnoty jsou ve sloupci nazev_oblast. Zatím nic nepočítej.“</strong></p>

<p>Zkontrolujte, že AI našla zhruba 2 200, 2 000 a 1 600 řádků. Pokud píše, že soubor má jeden sloupec, nenačetla středníky. Řekněte jí to.</p>

<h3><strong>Krok 2: výpočet a graf</strong></h3>

<p><strong>„Spočítej výdaje (položky začínající 5 a 6) podle sloupce nazev_oblast ze sloupce rozpocet_schvaleny pro každý rok zvlášť. Výsledek převeď na miliardy Kč. Udělej tabulku: oblast, 2024, 2025, 2026, změna 2024 až 2026 v procentech, seřazenou podle roku 2026. Pak udělej sloupcový graf šesti největších oblastí za všechny tři roky. Osa začíná od nuly, popisky česky, pod grafem zdroj: Hl. m. Praha, otevřená data, rozpočet schválený.“</strong></p>

<p><strong>V Claude</strong> může graf vzniknout jako obrázek nebo jako interaktivní artefakt, ve kterém se po najetí myší ukazují hodnoty. <strong>V ChatGPT</strong> dostanete graf jako obrázek. V obou nástrojích pak požádejte: <strong>„Ulož tabulku i graf do souboru Excel (xlsx), ať si je můžu stáhnout.“</strong></p>

<h3><strong>Krok 3: „ukaž mi postup“</strong></h3>

<p>Pošlete:</p>

<p><strong>„Popiš krok za krokem, jak vzniklo číslo pro oblast Doprava v roce 2025: které řádky do něj patří, který sloupec se sčítal a kolik řádků to bylo. Vypiš tři největší z nich i s názvem položky a částkou.“</strong></p>

<p>Teď to ověřte sami:</p>

<ul>
  <li><p><strong>Součty.</strong> Doprava by měla vyjít zhruba <strong>38,1 – 39,6 – 41,5 mld. Kč</strong> a výdaje celkem <strong>109 – 114 – 119 mld. Kč</strong>. Pokud má AI čísla výrazně vyšší, nejspíš přičetla příjmy nebo financování.</p></li>
  <li><p><strong>Jeden řádek ručně.</strong> Otevřete soubor za rok 2025 v Poznámkovém bloku nebo TextEditu (v českém Excelu se kvůli desetinné tečce nenačte správně) a přes hledání najděte jeden ze tří řádků, které AI vypsala. Sedí částka?</p></li>
</ul>

<p>A ještě jedna věc k zamyšlení. Proč tu vychází 114 miliard, když ve zprávě z lekce 3 byly výdaje 124 miliard? Protože tabulky jsou <strong>schválený rozpočet Magistrátu</strong>, kdežto zpráva popisuje <strong>skutečnost za celou Prahu</strong> včetně městských částí. Dvě správná čísla o dvou různých věcech. V jednom dokumentu je nikdy nemíchejte bez vysvětlení.</p>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> export z účetního nebo objednávkového systému (bez osobních údajů) a graf vývoje po měsících.</p></li>
  <li><p><strong>Učitelé:</strong> stáhněte si sadu <a target="_blank" rel="noopener noreferrer nofollow" href="https://skola.aivefirmach.cz/soubory/statistiky.zip">Statistiky (ZIP)</a> a nechte si spočítat, jak se změnil počet obyvatel vaší obce. Hotová úloha do hodiny matematiky nebo zeměpisu. Zdroj: ČSÚ.</p></li>
  <li><p><strong>Živnostníci:</strong> tabulka vlastních příjmů a výdajů po měsících a graf, který ukáže slabé a silné měsíce.</p></li>
</ul>

<h3><strong>Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Postup:</strong> ukázala AI, které řádky a který sloupec použila?</p></li>
  <li><p><strong>Řád:</strong> jsou to miliardy, ne miliony ani biliony? Tisíce Kč se převádějí snadno špatně.</p></li>
  <li><p><strong>Graf:</strong> osa od nuly, popsané osy, uvedený zdroj a to, že jde o schválený rozpočet.</p></li>
  <li><p><strong>Soubor:</strong> otevřete stažený xlsx. Jsou v něm čísla jako čísla?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Chtějte výpočet programem, ne odhad, a nechte si ukázat postup.</p></li>
  <li><p>Než se zeptáte, popište sloupce, jednotky a oddělovač.</p></li>
  <li><p>Jeden součet a jeden řádek vždy ověřte sami.</p></li>
  <li><p>Dvě čísla se můžou lišit, protože měří různé věci. Řekněte vždy, co číslo znamená.</p></li>
</ul>

<p>Zítra z toho, co už o rozpočtu víte, uděláte <strong>výukový materiál s testem</strong>: pracovní list, pět otázek, klíč a interaktivní kvíz.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
