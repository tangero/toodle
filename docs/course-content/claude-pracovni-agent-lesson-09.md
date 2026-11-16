# Claude jako pracovní agent - Lekce 9

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 9
- Název: Skill a plánovaná úloha: ať se to dělá samo
- Předmět e-mailu: Lekce 9: Nauč Claude svůj postup a pusť ho každé pondělí
- Preheader: Z osvědčeného briefu uděláš skill a naplánuješ první pravidelnou úlohu.
- Délka čtení: 7 minut + asi 25 minut práce
- Režim doručení: on_click
- Fakta o funkcích ověřena: 12. 11. 2026 (support.claude.com „Use skills in Claude“, „How to create a skill with Claude through conversation“, „Schedule recurring tasks in Claude Cowork“). Pozor: nové plánované úlohy běží v cloudu a pracují s konektory a se soubory uloženými v účtu Claude, ne s místní složkou.

## Tělo e-mailu

```html
<p>Ahoj. Každou úlohu v kurzu jsi zatím zadával/a ručně a brief jsi kopíroval/a ze šablony. Dnes uděláš dva kroky k tomu, aby se opakovaná práce dělala bez tebe.</p>

<p>Vytvoříš <strong>skill</strong>, tedy postup, který Claude umí použít kdykoli, a <strong>plánovanou úlohu</strong>, která se spustí sama každý týden.</p>

<h3><strong>1️⃣ Skill: postup, který nemusíš opakovat</strong></h3>

<p><strong>Skill</strong> je uložený návod, jak chceš určitý typ práce dělat. Má název, krátký popis, kdy se má použít, a samotný postup. Když pak zadáš úkol, na který popis sedí, Claude skill použije sám, v jakékoli konverzaci.</p>

<p>Čím se liší od věcí, které už znáš:</p>

<ul>
  <li><p><strong>Brief</strong> říká, co chceš teď. Píšeš ho pokaždé znovu.</p></li>
  <li><p><strong>Pokyny projektu</strong> platí jen uvnitř jednoho projektu.</p></li>
  <li><p><strong>Skill</strong> říká, jak se určitá věc dělá vždycky, a platí všude.</p></li>
</ul>

<p>Do skillu patří to, co se nemění: struktura výstupu, pravidla pro čísla a zdroje, kontroly na konci. Do briefu to, co je pokaždé jiné: podklady, čtenář, termín. Dobrý skill ti zkrátí brief z patnácti řádků na tři.</p>

<p>Skill se vyplatí, až když stejný postup použiješ potřetí. Z jednorázové úlohy ho nedělej.</p>

<h3><strong>✏️ Dnešní úkol, krok 1: skill z osvědčeného briefu</strong></h3>

<p>Použijeme brief na report z lekce 5. V nové konverzaci pošli:</p>

<p><strong>„Chci vytvořit skill s názvem Report z podkladů. Má se použít, když chci napsat report nebo zprávu z dokumentů a tabulek ve složce. Postup: 1) Zeptej se na čtenáře, účel a osnovu, pokud je nezadám. 2) Sepiš, který podklad je zdrojem pro kterou část, a upozorni, když dva zdroje popisují různé celky nebo období. 3) Nejdřív ukaž plán a počkej na souhlas. 4) Částky uváděj v jednotkách vhodných pro čtenáře a u každého čísla uveď zdroj: soubor a strana nebo list. 5) Nic neodhaduj a nedoplňuj z vlastních znalostí. Co v podkladech není, napiš do kapitoly Co z podkladů zjistit nejde. 6) Existující soubory neměň, nic nemaž. 7) Na konci přidej tabulku: číslo v textu, zdroj, původní hodnota. 8) Napiš, co jsi nemohl udělat a čím si nejsi jistý.“</strong></p>

<p>Claude skill připraví a provede tě jeho uložením. Své skills pak najdeš v části <em>Customize → Skills</em>, kde je můžeš i vypnout. Musíš mít zapnuté vytváření souborů (<em>Create and edit files</em> v nastavení). Na firemních tarifech může tvorbu skills povolovat správce.</p>

<h3><strong>✏️ Krok 2: vyzkoušej ho krátkým briefem</strong></h3>

<p>V nové konverzaci připoj složku Kurz AI a pošli jen:</p>

<p><strong>„Napiš report o vývoji počtu obyvatel v obcích mého okresu [doplň okres] mezi roky 2024 a 2025 z tabulek ve složce statistiky. Čtenář: zastupitelé obce. Dvě strany, Word, do složky Kurz AI.“</strong></p>

<p>Sleduj, jestli Claude skill použil: měl by ukázat plán, ptát se na osnovu, uvádět zdroje a přidat kontrolní tabulku, i když jsi o to tentokrát nežádal/a. Pokud se skill nepoužil, zkontroluj, že je zapnutý, a upřesni jeho popis. Právě podle popisu Claude pozná, kdy po skillu sáhnout.</p>

<h3><strong>2️⃣ Plánovaná úloha: zadáš jednou, běží pravidelně</strong></h3>

<p><strong>Plánovaná úloha</strong> je brief s rozvrhem: každou hodinu, každý den, každý týden. Claude ji spustí sám a výsledek na tebe čeká. Běží na serverech Anthropic, takže poběží, i když máš počítač vypnutý. Přehled najdeš pod položkou <em>Scheduled</em> v levém panelu, i v mobilu. <a target="_blank" rel="noopener noreferrer nofollow" href="https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork">Nápověda Claude k plánovaným úlohám</a>.</p>

<p>Jedno důležité omezení: nově vytvořené úlohy na tarifech Pro, Max a Ultra běží v cloudu, a proto <strong>nepracují se složkou ve tvém počítači</strong>. Umí web, připojené služby (disk, pošta, kalendář) a soubory uložené v účtu Claude. Hodí se tedy na sledování a přehledy, ne na úklid místních souborů. Na firemních tarifech se to může lišit podle nastavení správce.</p>

<h3><strong>✏️ Krok 3: naplánuj první úlohu</strong></h3>

<p>V nové konverzaci pošli:</p>

<p><strong>„Každé pondělí v 7:00 mi připrav přehled: co nového za poslední týden zveřejnilo hlavní město Praha o svém rozpočtu a hospodaření. Hledej jen na praha.eu a na webech městských organizací. Nejvýš pět bodů, u každého jedna věta, odkaz a datum zveřejnění. Když nic nového není, napiš jen ‚Tento týden nic nového‘. Na webu jen čti. Nic neodesílej a nikam se nepřihlašuj.“</strong></p>

<p>Claude se může doptat, pak ukáže název úlohy, rozvrh a pokyny. Přečti si je a klikni na <em>Schedule</em>. Pokud ještě máš starší rozhraní s volbou Chat a Cowork, otevři <em>Scheduled</em> v levém panelu a zvol <em>New task</em>.</p>

<p>Místo Prahy si klidně dosaď vlastní téma: novinky z oboru, weby úřadů, které sleduješ, nabídky dodavatelů.</p>

<p>Úlohu si hned jednou spusť ručně, ať nečekáš do pondělí, a výsledek zkontroluj.</p>

<h3><strong>3️⃣ Co neplánovat</strong></h3>

<ul>
  <li><p><strong>Nic, co odesílá, platí, maže nebo zveřejňuje.</strong> Pravidlo čtyř sloves z minulé lekce platí dvojnásob, protože u naplánované úlohy nikdo nesedí.</p></li>
  <li><p><strong>Nic s citlivými daty.</strong> Úloha, která každý den prochází poštu se zákazníky nebo žáky, čte i to, co číst neměla.</p></li>
  <li><p><strong>Rozhodnutí.</strong> Agent může připravit podklad k rozhodnutí. Rozhodovat za tebe podle rozvrhu nemá.</p></li>
  <li><p><strong>Úlohy, jejichž výsledek nečteš.</strong> Každá spotřebovává limit tvého tarifu. Co po měsíci nečteš, zruš.</p></li>
</ul>

<h3><strong>💼 Pro tvoji práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> skill „Zápis z porady“ s firemní strukturou. Plánovaná úloha: pondělní přehled týdne z kalendáře.</p></li>
  <li><p><strong>Učitelé:</strong> skill „Pracovní list“ (ročník, struktura, úrovně obtížnosti). Plánovaná úloha: měsíční přehled novinek z webu ministerstva a ČŠI.</p></li>
  <li><p><strong>Živnostníci:</strong> skill „Cenová nabídka“ s tvou strukturou a pravidlem „ceny jen z ceníku“. Plánovaná úloha: týdenní přehled nových veřejných zakázek nebo dotačních výzev ve tvém oboru.</p></li>
</ul>

<h3><strong>🔍 Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Skill:</strong> použil se sám? Dodržel všech osm bodů, hlavně zdroje a kontrolní tabulku?</p></li>
  <li><p><strong>Report o obyvatelích:</strong> ověř dvě obce proti tabulce ČSÚ. Nezapočítal agent řádek okresu jako obec?</p></li>
  <li><p><strong>Plánovaná úloha:</strong> vedou odkazy na oficiální weby? Sedí data zveřejnění s uplynulým týdnem?</p></li>
  <li><p><strong>Rozvrh:</strong> otevři <em>Scheduled</em>. Je tam jedna úloha, správný den a čas? Víš, kde ji pozastavit?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Skill je postup, který platí vždy. Brief se díky němu zkrátí na to, co je pokaždé jiné.</p></li>
  <li><p>Claude po skillu sáhne podle jeho popisu. Popis proto piš konkrétně.</p></li>
  <li><p>Plánovaná úloha běží v cloudu i s vypnutým počítačem a na místní složku se nespoléhá.</p></li>
  <li><p>Neplánuj nic, co má následky, a ruš úlohy, které nečteš.</p></li>
</ul>

<p>V poslední lekci si sestavíš vlastní kontrolní seznam pro výstupy agenta, projdeme, co dělat, když se něco pokazí, a zadáš první úlohu ze své skutečné práce.</p>

<p>Až budeš mít skill a naplánovanou úlohu, klikni pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Letní školy AI</strong><br>Patrick a Iva</p>
```
