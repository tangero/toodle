# Od chatu k hotovým výstupům - Lekce 2

## Metadata

- Kurz: Od chatu k hotovým výstupům
- Lekce: 2
- Název: Projekt: pracovní prostor s podklady a pokyny
- Předmět e-mailu: Lekce 2: Přestaňte AI vysvětlovat pořád totéž
- Preheader: Založíte projekt, nahrajete do něj zprávu o rozpočtu Prahy a napíšete pokyny, které platí pro každý chat.
- Délka čtení: 7 minut
- Fakta o funkcích ověřena: 12. 11. 2026 (support.claude.com „What are projects?“, help.openai.com „Projects in ChatGPT“)

## Tělo e-mailu

```html
<p>Dobré ráno. Včera jste si vybrali tři úkoly, které chcete z chatu dotáhnout do hotového výstupu. Dnes pro ně připravíte zázemí.</p>

<p>Založíte <strong>projekt</strong>, nahrajete do něj zprávu o rozpočtu Prahy a napíšete pokyny, podle kterých se AI bude chovat v každém chatu uvnitř projektu.</p>

<h3><strong>1. Proč projekt a ne jeden dlouhý chat</strong></h3>

<p>Dlouhý chat má dvě slabiny. Když je moc dlouhý, AI zapomíná, co bylo na začátku. A když začnete nový chat, musíte všechno vysvětlovat znovu: pro koho píšete, jaký styl chcete, co máte za podklady.</p>

<p><strong>Projekt</strong> je pracovní prostor pro jedno téma. Má tři části:</p>

<ul>
  <li><p><strong>Podklady</strong> (v Claude <em>Project knowledge</em>, v ChatGPT zdroje projektu): soubory, které AI zná v každém chatu projektu.</p></li>
  <li><p><strong>Pokyny projektu</strong>: trvalé zadání, třeba „piš pro občany bez ekonomického vzdělání“. Platí pro všechny chaty v projektu a v ChatGPT mají přednost před vašimi obecnými vlastními pokyny.</p></li>
  <li><p><strong>Chaty</strong>: každý úkol v samostatném chatu, ale se stejným zázemím.</p></li>
</ul>

<p>Představte si to jako šanon na stole. Nemusíte ho pokaždé znovu skládat, jen ho otevřete.</p>

<h3><strong>2. Stáhněte cvičná data</strong></h3>

<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://skola.aivefirmach.cz/soubory/rozpocet-praha.zip"><strong>Stáhnout sadu Rozpočet Prahy (ZIP, 2,3 MB)</strong></a></p>

<p>Soubor rozbalte (na Windows pravým tlačítkem → <em>Extrahovat vše</em>, na Macu dvojklikem). Uvnitř najdete:</p>

<ul>
  <li><p><strong>praha-zprava-o-plneni-rozpoctu-2025.pdf</strong>: zpráva města o tom, kolik v roce 2025 vybralo a utratilo (31 stran),</p></li>
  <li><p><strong>rozpocet-praha-mhmp-2024.csv</strong>, <strong>…-2025.csv</strong>, <strong>…-2026.csv</strong>: rozpočty Magistrátu po položkách za tři roky,</p></li>
  <li><p><strong>ZDROJE.txt</strong>: odkud data jsou a pod jakou licencí. Všechno jsou veřejná data hlavního města Prahy.</p></li>
</ul>

<p><strong>CSV</strong> je obyčejná tabulka uložená jako text, sloupce odděluje středník. Dnes tabulky jen stáhnete a necháte ve složce. Na řadu přijdou v 6. lekci.</p>

<h3><strong>3. Založte projekt</strong></h3>

<p><strong>V Claude:</strong> v levém panelu otevřete <em>Projects</em> (Projekty) a založte nový projekt s názvem <strong>Rozpočet Prahy</strong>. V projektu najdete místo pro podklady (project knowledge), kam nahrajete <strong>PDF a soubor ZDROJE.txt</strong>, a místo pro pokyny projektu (instructions). Anthropic teď postupně zavádí novou podobu projektů, takže přesné rozložení a názvy tlačítek se můžou lišit. V nové podobě je projekt jedna průběžná konverzace. Pokud ji máte, pište zadání z téhle lekce postupně do ní. <a target="_blank" rel="noopener noreferrer nofollow" href="https://support.claude.com/en/articles/9517075-what-are-projects">Nápověda Claude k projektům</a>.</p>

<p><strong>V ChatGPT:</strong> v levém panelu klikněte na <em>New project</em>, zadejte název <strong>Rozpočet Prahy</strong> a potvrďte. V oblasti zdrojů projektu přidejte <strong>PDF a soubor ZDROJE.txt</strong>. Pokyny najdete přes tři tečky (•••) → <em>Project settings</em>. <a target="_blank" rel="noopener noreferrer nofollow" href="https://help.openai.com/en/articles/10169521-projects-in-chatgpt">Nápověda OpenAI k projektům</a>.</p>

<p><strong>Proč do projektu nedáváme i tabulky:</strong> podklady projektu jsou to, co má AI číst pořád. Tři tabulky s tisíci řádků jsou velké a AI by z nich četla jen vybrané části. Navíc popisují jen Magistrát, kdežto zpráva celou Prahu, a na obecnou otázku by AI mohla sáhnout po špatném zdroji. Velké tabulky je lepší přiložit až k úloze, ve které s nimi AI počítá.</p>

<h3><strong>4. Napište pokyny projektu</strong></h3>

<p>Do pokynů zkopírujte tento text. Pak si ho klidně upravte:</p>

<p><strong>„Pracuješ se mnou na projektu Rozpočet Prahy srozumitelně. Cílem je vysvětlit hospodaření hlavního města Prahy lidem bez ekonomického vzdělání. Hlavní podklad je zpráva o plnění rozpočtu za rok 2025 (PDF, částky v tisících Kč). Později přidám tabulky s rozpočty Magistrátu na roky 2024 až 2026.<br>
Pravidla:<br>
1. Piš česky, srozumitelně, bez úřední hantýrky. Odborný pojem vždy jednou větou vysvětli.<br>
2. Částky převáděj na miliardy nebo miliony Kč a u každého čísla uveď, odkud je (název souboru, u PDF číslo strany).<br>
3. Když něco v podkladech není, napiš to. Nic si nedomýšlej.<br>
4. Zpráva popisuje Prahu jako celek včetně městských částí. Tabulky Magistrátu jsou jen její část. Tyhle dva celky nikdy nemíchej a vždy napiš, o kterém mluvíš.<br>
5. Než začneš dělat delší výstup, napiš mi krátký plán a počkej na souhlas.“</strong></p>

<p>Proč tyhle body: první dva určují čtenáře a styl. Třetí a čtvrtý brání nejčastějším chybám, tedy vymyšleným číslům a míchání dvou různých celků. Pátý vám šetří čas: když AI půjde špatným směrem, zjistíte to po třech řádcích plánu, ne po třech stranách textu.</p>

<h3><strong>Dnešní úkol: vyzkoušejte, že projekt funguje</strong></h3>

<p>Otevřete v projektu nový chat a pošlete:</p>

<p><strong>„Projdi podklady projektu a popiš mi je: co obsahují, za jaké období, v jakých jednotkách a odkud pocházejí. Na konci napiš tři otázky o hospodaření Prahy, na které z těchto podkladů umíš odpovědět, a jednu, na kterou ne.“</strong></p>

<p>Otázka, na kterou AI odpovědět neumí, je stejně cenná jako ty tři ostatní. Víte díky ní, kde podklady končí.</p>

<p>Pak otevřete <strong>druhý</strong> nový chat ve stejném projektu a zeptejte se:</p>

<p><strong>„Kolik Praha celkem vybrala a kolik utratila v roce 2025?“</strong></p>

<p>Všimněte si, že jste nic nevysvětlovali a nic nenahrávali znovu. Odpověď by měla být v miliardách a s číslem strany, protože to chtějí pokyny projektu. Jestli to tak opravdu je, zkontrolujete na konci lekce.</p>

<h3><strong>Co do projektu nenahrávat</strong></h3>

<ul>
  <li><p><strong>Osobní údaje</strong>: jména a kontakty klientů, žáků nebo pacientů, rodná čísla, známky, mzdy konkrétních lidí.</p></li>
  <li><p><strong>Interní dokumenty bez svolení</strong>: smlouvy, firemní čísla, nabídky konkurence. U pracovního účtu se držte pravidel organizace. Pokud žádná nejsou, zeptejte se.</p></li>
  <li><p><strong>Hesla a přístupové údaje.</strong> Nikdy, ani „jen na chvilku“.</p></li>
</ul>

<p>Dobrá zkouška: kdyby se soubor omylem dostal ven, vadilo by to někomu? Pokud ano, nepatří do projektu na osobním účtu.</p>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> projekt „Měsíční report“ se šablonou loňského reportu a pokyny, pro koho ho píšete a jak dlouhý má být.</p></li>
  <li><p><strong>Učitelé:</strong> projekt pro jeden předmět a ročník se ŠVP, učebnicí v PDF (pokud ji smíte použít) a pokynem „piš pro žáky 8. třídy“.</p></li>
  <li><p><strong>Živnostníci:</strong> projekt „Nabídky“ s ceníkem, popisem služeb a dvěma staršími nabídkami jako vzorem.</p></li>
</ul>

<h3><strong>Kontrola výstupu</strong></h3>

<p>Podívejte se na odpověď na otázku o příjmech a výdajích:</p>

<ul>
  <li><p><strong>Čísla:</strong> správně je zhruba <strong>148 mld. Kč příjmů a 124 mld. Kč výdajů</strong> (strana 4 zprávy, sloupec Skutečnost). Pokud vidíte 118 a 125 mld. nebo 128 a 145 mld., AI vzala plán místo skutečnosti. Proč se to stává a jak tomu předejít, je téma zítřejší lekce.</p></li>
  <li><p><strong>Zdroj:</strong> je u čísel strana? Pokud ne, pokyny projektu se neuplatnily. Zkontrolujte, že jsou uložené.</p></li>
  <li><p><strong>Celek:</strong> píše AI, že jde o Prahu jako celek?</p></li>
</ul>

<p>Když něco nesedí, napište to AI a doplňte pravidlo do pokynů projektu. Pokyny se ladí za pochodu, první verze nikdy není konečná.</p>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Projekt = podklady + pokyny + chaty k jednomu tématu.</p></li>
  <li><p>Pokyny projektu platí v každém chatu projektu, nemusíte je opakovat.</p></li>
  <li><p>Dobré pokyny říkají, pro koho píšete, jak uvádět zdroje a co dělat, když něco v podkladech chybí.</p></li>
  <li><p>Do projektu nepatří osobní údaje, interní dokumenty bez svolení a hesla.</p></li>
</ul>

<p>Zítra se pustíme do 31stránkové zprávy o rozpočtu. Uděláte z ní shrnutí na jednu stranu, ve kterém půjde každé číslo dohledat. A naučíte se tři čísla ověřit dřív, než shrnutí někomu pošlete.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
