# Začínáme s ChatGPT - Lekce 5

## Metadata

- Kurz: Začínáme s ChatGPT
- Lekce: 5
- Název: Bezpečnost, soukromí a halucinace
- Předmět e-mailu: Lekce 5: Co do ChatGPT nepsat a kdy ověřovat odpovědi
- Preheader: Dnes si nastavíme jednoduchá pravidla bezpečného používání ChatGPT bez zbytečného strašení.
- Délka čtení: 7 minut
- Fakta ověřena: 16. 11. 2026 (help.openai.com: Data controls in ChatGPT, anglická i česká verze; Temporary chat in ChatGPT; Searching the web with ChatGPT. Zásady pro osobní údaje, pracovní dokumenty a mlčenlivost: článek https://www.marigold.cz/item/smlouvy-ai-gdpr/, stav k 20. 10. 2026)
- Ověřit před publikací: české názvy „Nastavení → Ovládání dat → Zlepšovat model pro všechny“ pocházejí z české verze nápovědy, ne z rozhraní aplikace, kde se popisky mohou lišit. Lekce není právní rada a říká to; názvy „Dočasný“, „Personalizovaný“ a „Nepersonalizovaný“ jsou rovněž z české nápovědy; před vydáním ji dát přečíst právníkovi spolu s ostatními texty o osobních údajích.

## Tělo e-mailu

```html
<p>Dobré ráno z kurzu <strong>Začínáme s ChatGPT</strong>.</p>

<p>Už umíte napsat lepší prompt, navazovat v konverzaci a postupně zlepšovat odpovědi. Dnes přidáme důležitou brzdu: kdy ChatGPT používat opatrně, co do něj nepsat a jak poznat odpověď, kterou je potřeba ověřit.</p>

<p>Cílem není bát se AI. Cílem je používat ji rozumně.</p>

<h3><strong>1. ChatGPT není trezor ani úřední autorita</strong></h3>

<p>ChatGPT je užitečný pomocník pro psaní, vysvětlování, plánování a přemýšlení. Není to ale místo, kam patří všechno. Co do něj napíšete, odchází na servery provozovatele.</p>

<p>Do ChatGPT nepište:</p>

<ul>
  <li><p>hesla, přístupové kódy a obnovovací fráze,</p></li>
  <li><p>čísla platebních karet,</p></li>
  <li><p>rodná čísla, čísla dokladů a jiné citlivé identifikátory,</p></li>
  <li><p>pracovní dokumenty a firemní data. Do osobního účtu nepatří. V práci používejte jen nástroj a účet, který vám zaměstnavatel schválil,</p></li>
  <li><p>osobní údaje jiných lidí: jména, kontakty, adresy, údaje o zdraví nebo o penězích,</p></li>
  <li><p>důvěrné informace, které vám někdo svěřil nebo na které se vztahuje smlouva o mlčenlivosti (často se jí říká NDA). Ta je překážkou sama o sobě, i když v textu žádná jména nejsou.</p></li>
</ul>

<p>U vlastních zdravotních, právních nebo finančních podrobností rozhodujete vy. Zvažte, jestli by vám jejich únik mohl uškodit, a pište jen to, co je pro úkol nutné.</p>

<p><strong>Citlivé údaje</strong> jsou informace, které mohou člověka poškodit, když se dostanou k nesprávné osobě. Patří sem například údaje o zdraví, penězích, identitě nebo přístupech k účtům.</p>

<p>Jednoduché pravidlo zní: <strong>posílejte jen to, co úkol opravdu potřebuje</strong>. K otázce na výpovědní lhůtu nepotřebuje ChatGPT celou smlouvu, stačí jeden odstavec.</p>

<p>Tato lekce není právní rada. Zásady vycházejí z článku, který ověřil advokát: <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.marigold.cz/item/smlouvy-ai-gdpr/">Smlouvy, AI, GDPR</a>. Článek je psaný pro firmy a jejich placené nástroje, obecné zásady ale platí i pro vás. Pokud si nejste jistí, jestli smíte něco z práce do AI vložit, zeptejte se zaměstnavatele.</p>

<h3><strong>2. Co se děje s vašimi konverzacemi</strong></h3>

<p>Na osobních účtech může OpenAI vaše konverzace používat ke zlepšování svých modelů. Nastavení je ve výchozím stavu zapnuté a můžete ho vypnout:</p>

<ol>
  <li><p>Otevřete nabídku svého účtu a zvolte <strong>Settings</strong> (Nastavení).</p></li>
  <li><p>Zvolte <strong>Data controls</strong> (Ovládání dat).</p></li>
  <li><p>Vypněte přepínač <strong>Improve the model for everyone</strong> (Zlepšovat model pro všechny).</p></li>
</ol>

<p>Historie chatů vám po vypnutí zůstane. Počítejte ještě se dvěma věcmi:</p>

<ul>
  <li><p>Když odpověď ohodnotíte palcem nahoru nebo dolů, může se celá související konverzace použít k trénování, i když máte přepínač vypnutý.</p></li>
  <li><p>Vypnutí se týká jen trénování. Neznamená, že do ChatGPT můžete psát cokoli. Seznam z prvního oddílu platí dál.</p></li>
</ul>

<p>Pro jednorázovou konverzaci, kterou nechcete mít v historii, slouží <strong>dočasný chat</strong> (v nabídce <em>Temporary</em>, česky Dočasný). Neukládá se do historie a k trénování modelů se nepoužívá. OpenAI si jeho kopii může z bezpečnostních důvodů ponechat až 30 dní. Ani dočasný chat tedy není místo pro hesla nebo cizí osobní údaje.</p>

<h3><strong>3. Jak zadání anonymizovat</strong></h3>

<p><strong>Anonymizace</strong> znamená odstranění údajů, podle kterých lze poznat konkrétní osobu nebo firmu.</p>

<p>Místo skutečných údajů používejte zástupné názvy:</p>

<ul>
  <li><p>místo jména napište <strong>„zákazník“</strong>,</p></li>
  <li><p>místo názvu firmy napište <strong>„naše firma“</strong>,</p></li>
  <li><p>místo přesné částky napište <strong>„nižší desítky tisíc korun“</strong>, pokud přesná částka není nutná,</p></li>
  <li><p>místo konkrétní adresy napište <strong>„menší město u Brna“</strong>.</p></li>
</ul>

<p>Takhle můžete situaci popsat vlastními slovy. Neznamená to, že smíte vložit původní pracovní dokument nebo cizí e-mail, ve kterém jen přepíšete jména.</p>

<p>Dvě věci si přitom pohlídejte:</p>

<ul>
  <li><p><strong>Samotné přepsání jména nestačí.</strong> Člověka může prozradit i kombinace podrobností: částka, datum, místo a popis situace. Pokud by ho podle nich někdo poznal, text anonymní není.</p></li>
  <li><p><strong>Údaje odstraňte dřív, než text vložíte.</strong> Když do ChatGPT pošlete originál s prosbou „nejdřív to anonymizuj“, už jste ho odeslali.</p></li>
</ul>

<p>Více o pojmu najdete zde (anglicky): <a target="_blank" rel="noopener noreferrer nofollow" href="https://en.wikipedia.org/wiki/Data_anonymization">Data anonymization</a>.</p>

<h3><strong>4. Co jsou halucinace</strong></h3>

<p>ChatGPT může někdy odpovědět sebejistě, i když se plete. Tomu se v AI říká <strong>halucinace</strong>.</p>

<p>Halucinace je odpověď, která zní věrohodně, ale obsahuje vymyšlenou, nepřesnou nebo neověřenou informaci.</p>

<p>Typické příklady:</p>

<ul>
  <li><p>vymyšlený název knihy nebo článku,</p></li>
  <li><p>špatné datum události,</p></li>
  <li><p>neexistující citace,</p></li>
  <li><p>přehnaně jisté vysvětlení složité věci,</p></li>
  <li><p>odpověď na aktuální otázku bez aktuálních zdrojů.</p></li>
</ul>

<p>Více o pojmu najdete zde: <a target="_blank" rel="noopener noreferrer nofollow" href="https://cs.wikipedia.org/wiki/Halucinace_(um%C4%9Bl%C3%A1_inteligence)">Halucinace (umělá inteligence)</a>.</p>

<h3><strong>5. Kdy odpověď ověřovat</strong></h3>

<p>Odpověď si ověřte vždy, když podle ní chcete udělat důležité rozhodnutí.</p>

<p>Zvlášť opatrní buďte u těchto oblastí:</p>

<ul>
  <li><p><strong>zdraví:</strong> příznaky, léky, diagnózy, výživa,</p></li>
  <li><p><strong>právo:</strong> smlouvy, výpovědi, reklamace, úřední postupy,</p></li>
  <li><p><strong>finance:</strong> investice, daně, půjčky, pojištění,</p></li>
  <li><p><strong>aktuální zprávy:</strong> politika, ceny, zákony, výsledky,</p></li>
  <li><p><strong>práce:</strong> čísla, jména a termíny v textech, které posíláte dál.</p></li>
</ul>

<p>Když ChatGPT k odpovědi přidá odkazy na zdroje, otevřete si je. I citace může být neúplná, zastaralá nebo chybná.</p>

<p>ChatGPT může pomoct připravit otázky, shrnout text nebo vysvětlit pojmy. Nemá ale nahrazovat lékaře, právníka, účetního ani oficiální zdroj.</p>

<h3><strong>6. Užitečné prompty pro ověřování</strong></h3>

<p>Když si odpovědí nejste jistí, neberte ji jako hotovou. Nechte si ukázat slabá místa.</p>

<p>Zkuste třeba:</p>

<p><strong>„U této odpovědi označ, které části jsou jisté, které jsou odhad a které je potřeba ověřit z jiného zdroje.“</strong></p>

<p>Nebo:</p>

<p><strong>„Napiš mi seznam tvrzení z této odpovědi, která je potřeba ověřit před použitím.“</strong></p>

<p>Nebo:</p>

<p><strong>„Jaké informace bys potřeboval, aby byla odpověď přesnější? Nepředstírej jistotu, pokud ji nemáš.“</strong></p>

<p>Dobré pravidlo: u důležitých věcí chtějte, aby ChatGPT přiznal nejistotu. Jeho vlastní hodnocení ale ověření nenahrazuje. Jen vám ukáže, kde začít.</p>

<h3><strong>Dnešní úkol</strong></h3>

<ol>
  <li><p>Otevřete nastavení a podívejte se do části <strong>Data controls</strong>, jak máte nastavený přepínač <strong>Improve the model for everyone</strong>. Rozhodněte se, jestli ho necháte zapnutý.</p></li>
  <li><p>Otevřete nový chat.</p></li>
  <li><p>Zkopírujte a odešlete tento prompt:<br><strong>„Vysvětli mi jednoduše, na co si dát pozor při podepisování nájemní smlouvy. Piš pro člověka bez právního vzdělání. U každého bodu označ, jestli jde o obecnou radu, nebo věc, kterou je potřeba ověřit s odborníkem nebo v aktuálním zákoně.“</strong></p></li>
  <li><p>Podívejte se, jestli ChatGPT rozlišuje obecné rady a věci k ověření.</p></li>
  <li><p>Potom pošlete navazující prompt:<br><strong>„Vypiš z předchozí odpovědi jen tvrzení, která je potřeba ověřit, než se podle nich začnu řídit.“</strong></p></li>
  <li><p>Nakonec se zeptejte:<br><strong>„Jaké osobní údaje je lepší do této konverzace vůbec nepsat?“</strong></p></li>
</ol>

<p>Tím si procvičíte dvě věci najednou: ověřování odpovědí a opatrnost při sdílení údajů.</p>

<h3><strong>Častá chyba: ptát se na důležitou věc příliš obecně</strong></h3>

<p>Slabý prompt:</p>

<p><strong>„Je tahle smlouva v pořádku?“</strong></p>

<p>Lepší prompt:</p>

<p><strong>„Pomoz mi najít nejasná nebo riziková místa v těchto odstavcích smlouvy. Neříkej, že je právně v pořádku. Vypiš otázky, které mám položit právníkovi nebo pronajímateli.“</strong></p>

<p>Všimněte si dvou rozdílů. Nežádáte definitivní verdikt, žádáte pomoc s přípravou kontroly. A nevkládáte celou smlouvu, jen odstavce, kterým nerozumíte, bez jmen, rodných čísel, adres a čísel účtů.</p>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Do ChatGPT nepatří hesla, kódy, čísla karet, pracovní dokumenty ani osobní údaje jiných lidí.</p></li>
  <li><p>Posílejte jen to, co úkol potřebuje, a údaje odstraňte ještě před vložením.</p></li>
  <li><p>V nastavení můžete vypnout používání svých konverzací k trénování modelů.</p></li>
  <li><p>Halucinace je věrohodně znějící, ale nesprávná nebo vymyšlená odpověď.</p></li>
  <li><p>U zdraví, práva, financí a aktuálních informací odpovědi ověřujte.</p></li>
  <li><p>ChatGPT je dobrý pomocník pro přípravu otázek a přehledů, ne autorita pro konečné rozhodnutí.</p></li>
</ul>

<p>Zítra se podíváme na paměť a vlastní pokyny: tedy na to, co si ChatGPT může pamatovat mezi různými konverzacemi a co do paměti raději nedávat.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
