# Začínáme s ChatGPT - Lekce 3

## Metadata

- Kurz: Začínáme s ChatGPT
- Lekce: 3
- Název: Kontext konverzace: proč nemusíte všechno opakovat
- Předmět e-mailu: Lekce 3: Jak ChatGPT drží nit konverzace
- Preheader: Dnes si ukážeme kontextové okno, navazující prompty a kdy je lepší začít nový chat.
- Délka čtení: 6 minut
- Fakta ověřena: 16. 11. 2026 (help.openai.com: ChatGPT Free Tier FAQ, oddíly o hlášení „Context window full“ a „Chat memory full“; What is ChatGPT: FAQ)

## Tělo e-mailu

```html
<p>Dobré ráno z kurzu <strong>Začínáme s ChatGPT</strong>.</p>

<p>Dnes se podíváme na to, jak ChatGPT pracuje s předchozími zprávami v jednom chatu a jak toho můžete prakticky využít.</p>

<p>Dobrá zpráva: když v jedné konverzaci navazujete na předchozí odpověď, nemusíte pokaždé všechno vysvětlovat od začátku.</p>

<h3><strong>1. Co znamená kontext</strong></h3>

<p><strong>Kontext</strong> znamená souvislosti, které pomáhají pochopit další zprávu. V ChatGPT jsou to hlavně předchozí zprávy v aktuální konverzaci.</p>

<p>Když ChatGPT napíšete:</p>

<p><strong>„Zkrať to na polovinu.“</strong></p>

<p>většinou pochopí, že slovem „to“ myslíte předchozí odpověď.</p>

<p>Více o pojmu najdete zde: <a target="_blank" rel="noopener noreferrer nofollow" href="https://cs.wikipedia.org/wiki/Kontext">Kontext</a>.</p>

<h3><strong>2. Co je kontextové okno</strong></h3>

<p><strong>Kontextové okno</strong> je zjednodušeně množství textu, které má model v danou chvíli k dispozici při odpovídání. Patří do něj vaše zprávy, odpovědi ChatGPT a někdy i další instrukce systému.</p>

<p>Díky tomu může ChatGPT navázat na předchozí věty, držet zvolený tón a upravovat odpověď podle posledních pokynů.</p>

<p>Například když mu napíšete:</p>

<p><strong>„V této konverzaci mi prosím vykej a odpovídej stručně.“</strong></p>

<p>měl by se tím v daném chatu řídit, dokud nezačnete nový chat nebo mu nedáte jiný pokyn.</p>

<p>Kontextové okno ale není nekonečné. U velmi dlouhé konverzace se starší části mohou postupně ztrácet nebo být méně důležité. Pokud máte pocit, že ChatGPT na něco zapomněl, krátce mu to připomeňte.</p>

<h3><strong>3. Co je token-limit</strong></h3>

<p>U dlouhých konverzací se někdy mluví o <strong>tokenech</strong>. Token je malý kousek textu, se kterým model pracuje. Může to být celé krátké slovo, část delšího slova nebo třeba interpunkce.</p>

<p><strong>Token-limit</strong> znamená omezení, kolik takových kousků textu se do kontextového okna vejde. Nemusíte tokeny počítat. Stačí vědět, že příliš dlouhý chat může být pro model méně přehledný.</p>

<p>Když se konverzace zaplní úplně, ChatGPT to oznámí hlášením, že je chat plný (anglicky <em>Context window full</em> nebo <em>Chat memory full</em>). Nic se tím nepokazilo a nemusíte nic mazat. Začněte nový chat. Někdy vám ChatGPT nabídne nový chat se shrnutím toho starého. Shrnutí ale může některý dřívější pokyn vynechat, takže to důležité raději zopakujte.</p>

<p>Podrobnější vysvětlení najdete zde: <a target="_blank" rel="noopener noreferrer nofollow" href="https://en.wikipedia.org/wiki/Large_language_model#Tokenization">Tokenization</a>.</p>

<h3><strong>4. Kdy komunikaci shrnout a kdy začít znovu</strong></h3>

<ul>
  <li><p><strong>Dlouhá debata, kde nechcete ztratit pointu:</strong> nechte si udělat shrnutí nebo ho napište vlastními slovy. Připomeňte, co je důležité.</p></li>
  <li><p><strong>Úplná změna tématu:</strong> otevřete nový chat. Vyhnete se záměnám a staré téma se nebude plést do nového.</p></li>
  <li><p><strong>Jeden projekt s více detaily:</strong> zůstaňte ve stejném chatu, aby ChatGPT držel nit a nemusel začínat od nuly.</p></li>
</ul>

<p>Užitečný prompt pro shrnutí dlouhé konverzace:</p>

<p><strong>„Shrň prosím, na čem jsme se v této konverzaci dohodli, co je důležité zachovat a jaké otázky zůstávají otevřené.“</strong></p>

<h3><strong>5. Ukázkový postup: dva kroky plus shrnutí</strong></h3>

<ol>
  <li><p><strong>První krok – otázka</strong><br>„Vysvětli princip fotosyntézy pro dvanáctiletého žáka.“</p></li>
  <li><p><strong>Druhý krok – upřesnění</strong><br>„Přidej příklad z praxe a jednu kontrolní otázku.“</p></li>
  <li><p><strong>Shrnutí</strong><br>„Teď mi obě odpovědi shrň do jediného tweetu, maximálně 280 znaků.“</p></li>
</ol>

<p>Všimněte si, že ve třetím kroku nemusíte znovu kopírovat první dvě odpovědi. ChatGPT ví, na co navazuje, protože jste pořád ve stejné konverzaci.</p>

<p><strong>Tweet</strong> je krátký příspěvek ve stylu sociální sítě X, dříve Twitter. Tady nám slouží jen jako příklad krátkého formátu.</p>

<h3><strong>Dnešní úkol</strong></h3>

<ol>
  <li><p>Otevřete nový chat.</p></li>
  <li><p>Vytvořte dvoukrokový dialog podle ukázky výše. Téma si vyberte sami, třeba historii, sport, vaření, zahradu nebo cestování.</p></li>
  <li><p>Ve třetím promptu požádejte o shrnutí předchozích dvou odpovědí ve formátu haiku, limericku nebo tweetu.</p></li>
  <li><p>Zkontrolujte, jestli shrnutí opravdu vychází z obou původních odpovědí.</p></li>
  <li><p>Když něco chybí, doplňte detail a vyžádejte si nové shrnutí.</p></li>
</ol>

<p><strong>Haiku</strong> je krátká forma básně původem z Japonska. Pro náš účel stačí vědět, že jde o velmi stručné poetické shrnutí. <strong>Limerick</strong> je krátká hravá básnička s pointou.</p>

<p>Více najdete zde: <a target="_blank" rel="noopener noreferrer nofollow" href="https://cs.wikipedia.org/wiki/Haiku">Haiku</a> a <a target="_blank" rel="noopener noreferrer nofollow" href="https://cs.wikipedia.org/wiki/Limerik">Limerik</a>.</p>

<h3><strong>Častá chyba: čekat, že si model pamatuje všechno</strong></h3>

<p>ChatGPT umí držet souvislosti, ale není dobré spoléhat na to bez omezení. Když je výsledek mimo, nehádejte se s ním dlouho. Připomeňte mu důležitý bod nebo začněte nový chat s krátkým shrnutím.</p>

<p>Užitečná věta je například:</p>

<p><strong>„Připomínám důležitý kontext: odpověď má být pro úplného začátečníka, bez odborných výrazů a maximálně na 150 slov.“</strong></p>

<h3><strong>Tip na závěr</strong></h3>

<p>Pokud máte chuť jít víc do hloubky, můžete si přečíst Patrickův článek <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.marigold.cz/item/ai-kontext/">Proč je velikost kontextu u LLM tak důležitá</a>.</p>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>ChatGPT v jednom chatu navazuje na předchozí zprávy.</p></li>
  <li><p>Kontextové okno je množství textu, které má model při odpovědi k dispozici.</p></li>
  <li><p>U dlouhých chatů se starší části mohou ztrácet nebo být méně přesné.</p></li>
  <li><p>Když měníte téma, je lepší začít nový chat.</p></li>
  <li><p>Když pokračujete v jednom projektu, držte se stejného chatu a občas si nechte udělat shrnutí.</p></li>
</ul>

<p>Zítra si ukážeme, jak pomocí role, publika a omezení nastavit odpověď tak, aby lépe odpovídala vašemu cíli.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
