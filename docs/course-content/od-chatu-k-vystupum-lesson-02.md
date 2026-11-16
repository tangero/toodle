# Od chatu k hotovým výstupům - Lekce 2

## Metadata

- Kurz: Od chatu k hotovým výstupům
- Lekce: 2
- Název: Projekt: pracovní prostor s podklady a pokyny
- Předmět e-mailu: Lekce 2: Přestaň AI vysvětlovat pořád totéž
- Preheader: Založíš projekt, nahraješ do něj zprávu o rozpočtu Prahy a napíšeš pokyny, které platí pro každý chat.
- Délka čtení: 7 minut
- Fakta o funkcích ověřena: 12. 11. 2026 (support.claude.com „What are projects?“, help.openai.com „Projects in ChatGPT“)

## Tělo e-mailu

```html
<p>Dobré ráno. Včera sis vybral/a tři úkoly, které chceš z chatu dotáhnout do hotového výstupu. Dnes pro ně připravíš zázemí.</p>

<p>Založíš <strong>projekt</strong>, nahraješ do něj zprávu o rozpočtu Prahy a napíšeš pokyny, podle kterých se AI bude chovat v každém chatu uvnitř projektu.</p>

<h3><strong>1️⃣ Proč projekt a ne jeden dlouhý chat</strong></h3>

<p>Dlouhý chat má dvě slabiny. Když je moc dlouhý, AI zapomíná, co bylo na začátku. A když začneš nový chat, musíš všechno vysvětlovat znovu: pro koho píšeš, jaký styl chceš, co máš za podklady.</p>

<p><strong>Projekt</strong> je pracovní prostor pro jedno téma. Má tři části:</p>

<ul>
  <li><p><strong>Podklady</strong> (v Claude <em>Project knowledge</em>, v ChatGPT zdroje projektu): soubory, které AI zná v každém chatu projektu.</p></li>
  <li><p><strong>Pokyny projektu</strong>: trvalé zadání, třeba „piš pro občany bez ekonomického vzdělání“. Platí pro všechny chaty v projektu a v ChatGPT mají přednost před tvými obecnými vlastními pokyny.</p></li>
  <li><p><strong>Chaty</strong>: každý úkol v samostatném chatu, ale se stejným zázemím.</p></li>
</ul>

<p>Představ si to jako šanon na stole. Nemusíš ho pokaždé znovu skládat, jen ho otevřeš.</p>

<h3><strong>2️⃣ Stáhni cvičná data</strong></h3>

<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://skola.aivefirmach.cz/soubory/rozpocet-praha.zip"><strong>⬇️ Stáhnout sadu Rozpočet Prahy (ZIP, 2,3 MB)</strong></a></p>

<p>Soubor rozbal (na Windows pravým tlačítkem → <em>Extrahovat vše</em>, na Macu dvojklikem). Uvnitř najdeš:</p>

<ul>
  <li><p><strong>praha-zprava-o-plneni-rozpoctu-2025.pdf</strong>: zpráva města o tom, kolik v roce 2025 vybralo a utratilo (31 stran),</p></li>
  <li><p><strong>rozpocet-praha-mhmp-2024.csv</strong>, <strong>…-2025.csv</strong>, <strong>…-2026.csv</strong>: rozpočty Magistrátu po položkách za tři roky,</p></li>
  <li><p><strong>ZDROJE.txt</strong>: odkud data jsou a pod jakou licencí. Všechno jsou veřejná data hlavního města Prahy.</p></li>
</ul>

<p><strong>CSV</strong> je obyčejná tabulka uložená jako text, sloupce odděluje středník. Dnes tabulky jen stáhneš a necháš ve složce. Na řadu přijdou v 6. lekci.</p>

<h3><strong>3️⃣ Založ projekt</strong></h3>

<p><strong>V Claude:</strong> v levém panelu otevři <em>Projects</em> (Projekty) a založ nový projekt s názvem <strong>Rozpočet Prahy</strong>. V projektu najdeš místo pro podklady (project knowledge), kam nahraješ <strong>PDF a soubor ZDROJE.txt</strong>, a místo pro pokyny projektu (instructions). Anthropic teď postupně zavádí novou podobu projektů, takže přesné rozložení a názvy tlačítek se můžou lišit. V nové podobě je projekt jedna průběžná konverzace. Pokud ji máš, piš zadání z téhle lekce postupně do ní. <a target="_blank" rel="noopener noreferrer nofollow" href="https://support.claude.com/en/articles/9517075-what-are-projects">Nápověda Claude k projektům</a>.</p>

<p><strong>V ChatGPT:</strong> v levém panelu klikni na <em>New project</em>, zadej název <strong>Rozpočet Prahy</strong> a potvrď. V oblasti zdrojů projektu přidej <strong>PDF a soubor ZDROJE.txt</strong>. Pokyny najdeš přes tři tečky (•••) → <em>Project settings</em>. <a target="_blank" rel="noopener noreferrer nofollow" href="https://help.openai.com/en/articles/10169521-projects-in-chatgpt">Nápověda OpenAI k projektům</a>.</p>

<p><strong>Proč do projektu nedáváme i tabulky:</strong> podklady projektu jsou to, co má AI číst pořád. Tři tabulky s tisíci řádků jsou velké a AI by z nich četla jen vybrané části. Navíc popisují jen Magistrát, kdežto zpráva celou Prahu, a na obecnou otázku by AI mohla sáhnout po špatném zdroji. Velké tabulky je lepší přiložit až k úloze, ve které s nimi AI počítá.</p>

<h3><strong>4️⃣ Napiš pokyny projektu</strong></h3>

<p>Do pokynů zkopíruj tento text. Pak si ho klidně uprav:</p>

<p><strong>„Pracuješ se mnou na projektu Rozpočet Prahy srozumitelně. Cílem je vysvětlit hospodaření hlavního města Prahy lidem bez ekonomického vzdělání. Hlavní podklad je zpráva o plnění rozpočtu za rok 2025 (PDF, částky v tisících Kč). Později přidám tabulky s rozpočty Magistrátu na roky 2024 až 2026.<br>
Pravidla:<br>
1. Piš česky, srozumitelně, bez úřední hantýrky. Odborný pojem vždy jednou větou vysvětli.<br>
2. Částky převáděj na miliardy nebo miliony Kč a u každého čísla uveď, odkud je (název souboru, u PDF číslo strany).<br>
3. Když něco v podkladech není, napiš to. Nic si nedomýšlej.<br>
4. Zpráva popisuje Prahu jako celek včetně městských částí. Tabulky Magistrátu jsou jen její část. Tyhle dva celky nikdy nemíchej a vždy napiš, o kterém mluvíš.<br>
5. Než začneš dělat delší výstup, napiš mi krátký plán a počkej na souhlas.“</strong></p>

<p>Proč tyhle body: první dva určují čtenáře a styl. Třetí a čtvrtý brání nejčastějším chybám, tedy vymyšleným číslům a míchání dvou různých celků. Pátý ti šetří čas: když AI půjde špatným směrem, zjistíš to po třech řádcích plánu, ne po třech stranách textu.</p>

<h3><strong>✏️ Dnešní úkol: vyzkoušej, že projekt funguje</strong></h3>

<p>Otevři v projektu nový chat a pošli:</p>

<p><strong>„Projdi podklady projektu a popiš mi je: co obsahují, za jaké období, v jakých jednotkách a odkud pocházejí. Na konci napiš tři otázky o hospodaření Prahy, na které z těchto podkladů umíš odpovědět, a jednu, na kterou ne.“</strong></p>

<p>Otázka, na kterou AI odpovědět neumí, je stejně cenná jako ty tři ostatní. Víš díky ní, kde podklady končí.</p>

<p>Pak otevři <strong>druhý</strong> nový chat ve stejném projektu a zeptej se:</p>

<p><strong>„Kolik Praha celkem vybrala a kolik utratila v roce 2025?“</strong></p>

<p>Všimni si, že jsi nic nevysvětloval/a a nic nenahrával/a znovu. Odpověď by měla být v miliardách a s číslem strany, protože to chtějí pokyny projektu. Jestli to tak opravdu je, zkontroluješ na konci lekce.</p>

<h3><strong>⚠️ Co do projektu nenahrávat</strong></h3>

<ul>
  <li><p><strong>Osobní údaje</strong>: jména a kontakty klientů, žáků nebo pacientů, rodná čísla, známky, mzdy konkrétních lidí.</p></li>
  <li><p><strong>Interní dokumenty bez svolení</strong>: smlouvy, firemní čísla, nabídky konkurence. U pracovního účtu se drž pravidel organizace. Pokud žádná nejsou, zeptej se.</p></li>
  <li><p><strong>Hesla a přístupové údaje.</strong> Nikdy, ani „jen na chvilku“.</p></li>
</ul>

<p>Dobrá zkouška: kdyby se soubor omylem dostal ven, vadilo by to někomu? Pokud ano, nepatří do projektu na osobním účtu.</p>

<h3><strong>💼 Pro tvoji práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> projekt „Měsíční report“ se šablonou loňského reportu a pokyny, pro koho ho píšeš a jak dlouhý má být.</p></li>
  <li><p><strong>Učitelé:</strong> projekt pro jeden předmět a ročník se ŠVP, učebnicí v PDF (pokud ji smíš použít) a pokynem „piš pro žáky 8. třídy“.</p></li>
  <li><p><strong>Živnostníci:</strong> projekt „Nabídky“ s ceníkem, popisem služeb a dvěma staršími nabídkami jako vzorem.</p></li>
</ul>

<h3><strong>🔍 Kontrola výstupu</strong></h3>

<p>Podívej se na odpověď na otázku o příjmech a výdajích:</p>

<ul>
  <li><p><strong>Čísla:</strong> správně je zhruba <strong>148 mld. Kč příjmů a 124 mld. Kč výdajů</strong> (strana 4 zprávy, sloupec Skutečnost). Pokud vidíš 118 a 125 mld. nebo 128 a 145 mld., AI vzala plán místo skutečnosti. Proč se to stává a jak tomu předejít, je téma zítřejší lekce.</p></li>
  <li><p><strong>Zdroj:</strong> je u čísel strana? Pokud ne, pokyny projektu se neuplatnily. Zkontroluj, že jsou uložené.</p></li>
  <li><p><strong>Celek:</strong> píše AI, že jde o Prahu jako celek?</p></li>
</ul>

<p>Když něco nesedí, napiš to AI a doplň pravidlo do pokynů projektu. Pokyny se ladí za pochodu, první verze nikdy není konečná.</p>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Projekt = podklady + pokyny + chaty k jednomu tématu.</p></li>
  <li><p>Pokyny projektu platí v každém chatu projektu, nemusíš je opakovat.</p></li>
  <li><p>Dobré pokyny říkají, pro koho píšeš, jak uvádět zdroje a co dělat, když něco v podkladech chybí.</p></li>
  <li><p>Do projektu nepatří osobní údaje, interní dokumenty bez svolení a hesla.</p></li>
</ul>

<p>Zítra se pustíme do 31stránkové zprávy o rozpočtu. Uděláš z ní shrnutí na jednu stranu, ve kterém půjde každé číslo dohledat. A naučíš se tři čísla ověřit dřív, než shrnutí někomu pošleš.</p>

<p>— <strong>Tým Letní školy AI</strong><br>Patrick a Iva</p>
```
