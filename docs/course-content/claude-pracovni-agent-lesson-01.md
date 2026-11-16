# Claude jako pracovní agent - Lekce 1

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 1
- Název: Chat, nebo úloha? Jak Claude pracuje jako agent
- Předmět e-mailu: Lekce 1: Claude dnes nebude odpovídat, bude pracovat
- Preheader: Připravíte si pracovní složku, pustíte k ní Claude a dostanete první soupis souborů.
- Délka čtení: 6 minut + asi 15 minut práce
- Režim doručení: on_click (tlačítko v e-mailu vede na stránku kurzu, další lekce odejde po potvrzení „Mám přečteno – pošlete další lekci“)
- Fakta o funkcích ověřena: 12. 11. 2026 (support.claude.com „Claude Cowork and chat are one Claude“, „Use Claude Cowork safely“)

## Tělo e-mailu

```html
<p>Vítejte v kurzu <strong>Claude jako pracovní agent</strong>.</p>

<p>Tenhle kurz funguje jinak než ty předchozí. Lekce nechodí každý den. Další přijde, až kliknete na tlačítko <strong>Hotovo, chci další lekci</strong> pod e-mailem a na stránce kurzu potvrdíte <strong>Mám přečteno – pošlete další lekci</strong>. Některé úlohy budou trvat čtvrt hodiny, jiné víc, a tempo si určujete sami.</p>

<p>Dnes si připravíte prostředí: nainstalujete desktopovou aplikaci, založíte pracovní složku a necháte Claude, ať vám řekne, co v ní je. Zní to skromně, ale právě v tom je první velký rozdíl proti chatu: Claude nebude odpovídat z hlavy, bude se dívat do vašich souborů.</p>

<h3><strong>1. Co se děje, když Claude „pracuje“</strong></h3>

<p>V chatu napíšete otázku a Claude odpoví. Když mu ale dáte <strong>úlohu</strong> („projdi tyhle soubory a udělej z nich tabulku“), chová se jako <strong>agent</strong>:</p>

<ul>
  <li><p><strong>naplánuje si kroky</strong> (nejdřív zjistit, co ve složce je, pak otevřít tabulky, pak sloučit…),</p></li>
  <li><p><strong>používá nástroje</strong>: čte a vytváří soubory, spouští výpočty, hledá na webu, používá připojené aplikace,</p></li>
  <li><p><strong>průběžně ukazuje, co dělá</strong>, a když něco není jasné, zeptá se,</p></li>
  <li><p><strong>vrátí hotový výsledek</strong>: soubor, dokument, prezentaci.</p></li>
</ul>

<p>Od září 2026 to všechno zvládá běžný Claude. Dřív na to byl samostatný režim <strong>Cowork</strong>. Teď už režim nevybíráte: Claude sám pozná, jestli jde o rychlou otázku, nebo o práci na delší dobu. <a target="_blank" rel="noopener noreferrer nofollow" href="https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude">Nápověda Claude ke sloučení chatu a Cowork</a>.</p>

<p>Pokud v poli pro zprávu ještě vidíte volbu <em>Chat</em> a <em>Cowork</em>, váš účet novinku zatím nedostal. Nic se neděje: pro celý kurz si vždy zvolte <strong>Cowork</strong> a postupy budou fungovat stejně.</p>

<h3><strong>2. Co budete potřebovat</strong></h3>

<ul>
  <li><p><strong>Placený tarif Claude</strong> (Pro nebo vyšší). Na tarifu Team je spojený Claude zatím v betaverzi a správce ho musí mít zapnutý. Když si nevíte rady, zeptejte se ho.</p></li>
  <li><p><strong>Desktopovou aplikaci Claude</strong> pro macOS nebo Windows ze stránky <a target="_blank" rel="noopener noreferrer nofollow" href="https://claude.com/download">claude.com/download</a>. K souborům na vašem počítači se Claude dostane jen přes ni a jen když je spuštěná. Webová verze stačí na dokumenty a prezentace, ale ne na práci s vašimi složkami.</p></li>
  <li><p><strong>Zapnuté vytváření souborů</strong>: <em>Nastavení → Capabilities</em>, položka <em>Create and edit files</em>.</p></li>
</ul>

<h3><strong>3. Pracovní složka jen pro kurz</strong></h3>

<p>Tohle je nejdůležitější bezpečnostní pravidlo celého kurzu: <strong>Claude dostane přístup jen ke složce, kterou mu dáte, a ve které nic nemůže pokazit.</strong> Ne k celým Dokumentům, ne k celé Ploše, ne ke složce se smlouvami.</p>

<p>Proč: v připojené složce Claude může soubory číst, vytvářet, měnit i mazat. Před trvalým smazáním se ve výchozím nastavení zeptá, ale nejlepší pojistka je, když v dosahu nic cenného není. A ještě jedna věc: úlohy běží na serverech Anthropic. Složka zůstává u vás, ale když Claude nějaký soubor potřebuje, stáhne si jeho kopii a zpracuje ji tam. <a target="_blank" rel="noopener noreferrer nofollow" href="https://support.claude.com/en/articles/13364135-use-claude-cowork-safely">Nápověda Claude k bezpečnému používání</a>.</p>

<p>Postup:</p>

<ol>
  <li><p>Vytvořte na ploše nebo v Dokumentech složku <strong>Kurz AI</strong>.</p></li>
  <li><p>Stáhněte do ní dvě cvičné sady a obě rozbalte:<br>
  <a target="_blank" rel="noopener noreferrer nofollow" href="https://skola.aivefirmach.cz/soubory/rozpocet-praha.zip"><strong>Stáhnout sadu Rozpočet Prahy (ZIP, 2,3 MB)</strong></a><br>
  <a target="_blank" rel="noopener noreferrer nofollow" href="https://skola.aivefirmach.cz/soubory/statistiky.zip"><strong>Stáhnout sadu Statistiky ČSÚ (ZIP, 1,5 MB)</strong></a></p></li>
  <li><p>Soubory ZIP pak můžete smazat. Ve složce Kurz AI vám zůstanou dvě podsložky s PDF, tabulkami a soubory <em>ZDROJE.txt</em>.</p></li>
</ol>

<h3><strong>4. Připojte složku a nastavte, jak moc se má Claude ptát</strong></h3>

<p>Otevřete desktopovou aplikaci a začněte novou konverzaci. Pod polem pro zprávu přidejte složku (ikona složky nebo <em>+</em> → přidat složku) a vyberte <strong>Kurz AI</strong>. Aplikace se vás zeptá na povolení, aby Claude mohl soubory ve složce upravovat. Dnes žádné úpravy nepotřebujeme, a proto to v zadání výslovně zakážeme. Se soubory začneme hýbat až ve 3. lekci, a to na kopii.</p>

<p>Ve výchozím nastavení se Claude <strong>zeptá, než udělá nějakou akci</strong>. Tak to v kurzu nechte. Uvidíte, co přesně chce udělat, a naučíte se, jak agent přemýšlí. Až budete mít jistotu, můžete mu povolit samostatnější práci. Když se vás Claude během úlohy zeptá na svolení, přečtěte si, co přesně chce udělat. Dnes má jen číst.</p>

<h3><strong>Dnešní úkol: první úloha</strong></h3>

<p>Do konverzace s připojenou složkou pošlete:</p>

<p><strong>„Projdi složku Kurz AI včetně podsložek. Nic neměň a nic nevytvářej. Napiš mi soupis: název souboru, typ, velikost, o čem soubor je (podle obsahu, ne podle názvu), za jaké období jsou data a odkud pocházejí (podle ZDROJE.txt). Na konci mi napiš tři úlohy, které bys s těmito daty mohl udělat pro člověka, který chce rozumět hospodaření Prahy.“</strong></p>

<p>Sledujte, co se děje. Claude vám ukáže jednotlivé kroky: které soubory otevírá a co z nich čte. To je dobré: vidíte, z čeho vychází, a když něco přeskočí, víte to hned.</p>

<p>Až soupis dostanete, pošlete navazující prompt:</p>

<p><strong>„Která data se ti špatně četla nebo jsou v nich nejasnosti (jednotky, hlavičky, oddělovače, chybějící hodnoty)? Napiš to jako seznam, ať vím, na co si dát pozor.“</strong></p>

<p>Zeptejte se tak pokaždé, když agent pracuje s daty, která neznáte. Claude obvykle ví, kde měl potíže. Jen to sám neřekne, dokud se nezeptáte.</p>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> vytvořte si druhou pracovní složku s kopiemi podkladů k jednomu opakovanému reportu. Originály nechte, kde jsou.</p></li>
  <li><p><strong>Učitelé:</strong> pracovní složka s materiály k jednomu tématu: vaše přípravy, pracovní listy, zadání. Bez známek a jmen žáků.</p></li>
  <li><p><strong>Živnostníci:</strong> pracovní složka s ceníkem, popisem služeb a pár staršími nabídkami. Faktury a výpisy z účtu do ní nedávejte.</p></li>
</ul>

<h3><strong>Kontrola výstupu</strong></h3>

<ul>
  <li><p>Otevřete složku Kurz AI. Je všechno tak, jak bylo? Nemá tam nic přibýt ani se změnit.</p></li>
  <li><p>Sedí počet souborů v soupisu s počtem ve složce? Agent občas soubor přehlédne, hlavně v podsložkách.</p></li>
  <li><p>Vyberte si jeden soubor a porovnejte, co o něm Claude napsal, s tím, co v něm opravdu je. Souhlasí období a zdroj?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Agent si úlohu rozplánuje, pracuje s nástroji a vrací hotový výsledek.</p></li>
  <li><p>K souborům na počítači se Claude dostane jen přes desktopovou aplikaci a jen do složek, které mu dáte.</p></li>
  <li><p>Pracovní složka jen pro kurz je nejlevnější bezpečnostní pojistka.</p></li>
  <li><p>Po každé práci s daty se zeptejte, co bylo nejasné.</p></li>
</ul>

<p>V další lekci se naučíte psát <strong>zadání úlohy</strong> (brief) tak, aby agent nebloudil: cíl, podklady, výstup, kdy je hotovo a co nesmí. Na téhle dovednosti stojí celý kurz.</p>

<p>Až budete mít soupis a projdete kontrolu, klikněte pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
