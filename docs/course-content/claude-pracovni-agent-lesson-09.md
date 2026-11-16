# Claude jako pracovní agent - Lekce 9

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 9
- Název: Skill a plánovaná úloha: ať se to dělá samo
- Předmět e-mailu: Lekce 9: Naučte Claude svůj postup a pusťte ho každé pondělí
- Preheader: Z osvědčeného briefu uděláte skill a naplánujete první pravidelnou úlohu.
- Délka čtení: 7 minut + asi 25 minut práce
- Režim doručení: on_click
- Fakta o funkcích ověřena: 12. 11. 2026 (support.claude.com „Use skills in Claude“, „How to create a skill with Claude through conversation“, „Schedule recurring tasks in Claude Cowork“). Pozor: nové plánované úlohy běží v cloudu a pracují s konektory a se soubory uloženými v účtu Claude, ne s místní složkou.

## Tělo e-mailu

```html
<p>Dobrý den. Každou úlohu v kurzu jste zatím zadávali ručně a brief jste kopírovali ze šablony. Dnes uděláte dva kroky k tomu, aby se opakovaná práce dělala bez vás.</p>

<p>Vytvoříte <strong>skill</strong>, tedy postup, který Claude umí použít kdykoli, a <strong>plánovanou úlohu</strong>, která se spustí sama každý týden.</p>

<h3><strong>1. Skill: postup, který nemusíte opakovat</strong></h3>

<p><strong>Skill</strong> je uložený návod, jak chcete určitý typ práce dělat. Má název, krátký popis, kdy se má použít, a samotný postup. Když pak zadáte úkol, na který popis sedí, Claude skill použije sám, v jakékoli konverzaci.</p>

<p>Čím se liší od věcí, které už znáte:</p>

<ul>
  <li><p><strong>Brief</strong> říká, co chcete teď. Píšete ho pokaždé znovu.</p></li>
  <li><p><strong>Pokyny projektu</strong> platí jen uvnitř jednoho projektu.</p></li>
  <li><p><strong>Skill</strong> říká, jak se určitá věc dělá vždycky, a platí všude.</p></li>
</ul>

<p>Do skillu patří to, co se nemění: struktura výstupu, pravidla pro čísla a zdroje, kontroly na konci. Do briefu to, co je pokaždé jiné: podklady, čtenář, termín. Dobrý skill vám zkrátí brief z patnácti řádků na tři.</p>

<p>Skill se vyplatí, až když stejný postup použijete potřetí. Z jednorázové úlohy ho nedělejte.</p>

<h3><strong>Dnešní úkol, krok 1: skill z osvědčeného briefu</strong></h3>

<p>Použijeme brief na report z lekce 5. V nové konverzaci pošlete:</p>

<p><strong>„Chci vytvořit skill s názvem Report z podkladů. Má se použít, když chci napsat report nebo zprávu z dokumentů a tabulek ve složce. Postup: 1) Zeptej se na čtenáře, účel a osnovu, pokud je nezadám. 2) Sepiš, který podklad je zdrojem pro kterou část, a upozorni, když dva zdroje popisují různé celky nebo období. 3) Nejdřív ukaž plán a počkej na souhlas. 4) Částky uváděj v jednotkách vhodných pro čtenáře a u každého čísla uveď zdroj: soubor a strana nebo list. 5) Nic neodhaduj a nedoplňuj z vlastních znalostí. Co v podkladech není, napiš do kapitoly Co z podkladů zjistit nejde. 6) Existující soubory neměň, nic nemaž. 7) Na konci přidej tabulku: číslo v textu, zdroj, původní hodnota. 8) Napiš, co jsi nemohl udělat a čím si nejsi jistý.“</strong></p>

<p>Claude skill připraví a provede vás jeho uložením. Své skills pak najdete v části <em>Customize → Skills</em>, kde je můžete i vypnout. Musíte mít zapnuté vytváření souborů (<em>Create and edit files</em> v nastavení). Na firemních tarifech může tvorbu skills povolovat správce.</p>

<h3><strong>Krok 2: vyzkoušejte ho krátkým briefem</strong></h3>

<p>V nové konverzaci připojte složku Kurz AI a pošlete jen:</p>

<p><strong>„Napiš report o vývoji počtu obyvatel v obcích mého okresu [doplňte okres] mezi roky 2024 a 2025 z tabulek ve složce statistiky. Čtenář: zastupitelé obce. Dvě strany, Word, do složky Kurz AI.“</strong></p>

<p>Sledujte, jestli Claude skill použil: měl by ukázat plán, ptát se na osnovu, uvádět zdroje a přidat kontrolní tabulku, i když jste o to tentokrát nežádali. Pokud se skill nepoužil, zkontrolujte, že je zapnutý, a upřesněte jeho popis. Právě podle popisu Claude pozná, kdy po skillu sáhnout.</p>

<h3><strong>2. Plánovaná úloha: zadáte jednou, běží pravidelně</strong></h3>

<p><strong>Plánovaná úloha</strong> je brief s rozvrhem: každou hodinu, každý den, každý týden. Claude ji spustí sám a výsledek na vás čeká. Běží na serverech Anthropic, takže poběží, i když máte počítač vypnutý. Přehled najdete pod položkou <em>Scheduled</em> v levém panelu, i v mobilu. <a target="_blank" rel="noopener noreferrer nofollow" href="https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork">Nápověda Claude k plánovaným úlohám</a>.</p>

<p>Jedno důležité omezení: nově vytvořené úlohy na tarifech Pro, Max a Ultra běží v cloudu, a proto <strong>nepracují se složkou ve vašem počítači</strong>. Umí web, připojené služby (disk, pošta, kalendář) a soubory uložené v účtu Claude. Hodí se tedy na sledování a přehledy, ne na úklid místních souborů. Na firemních tarifech se to může lišit podle nastavení správce.</p>

<h3><strong>Krok 3: naplánujte první úlohu</strong></h3>

<p>V nové konverzaci pošlete:</p>

<p><strong>„Každé pondělí v 7:00 mi připrav přehled: co nového za poslední týden zveřejnilo hlavní město Praha o svém rozpočtu a hospodaření. Hledej jen na praha.eu a na webech městských organizací. Nejvýš pět bodů, u každého jedna věta, odkaz a datum zveřejnění. Když nic nového není, napiš jen ‚Tento týden nic nového‘. Na webu jen čti. Nic neodesílej a nikam se nepřihlašuj.“</strong></p>

<p>Claude se může doptat, pak ukáže název úlohy, rozvrh a pokyny. Přečtěte si je a klikněte na <em>Schedule</em>. Pokud ještě máte starší rozhraní s volbou Chat a Cowork, otevřete <em>Scheduled</em> v levém panelu a zvolte <em>New task</em>.</p>

<p>Místo Prahy si klidně dosaďte vlastní téma: novinky z oboru, weby úřadů, které sledujete, nabídky dodavatelů.</p>

<p>Úlohu si hned jednou spusťte ručně, ať nečekáte do pondělí, a výsledek zkontrolujte.</p>

<h3><strong>3. Co neplánovat</strong></h3>

<ul>
  <li><p><strong>Nic, co odesílá, platí, maže nebo zveřejňuje.</strong> Pravidlo čtyř sloves z minulé lekce platí dvojnásob, protože u naplánované úlohy nikdo nesedí.</p></li>
  <li><p><strong>Nic s citlivými daty.</strong> Úloha, která každý den prochází poštu se zákazníky nebo žáky, čte i to, co číst neměla.</p></li>
  <li><p><strong>Rozhodnutí.</strong> Agent může připravit podklad k rozhodnutí. Rozhodovat za vás podle rozvrhu nemá.</p></li>
  <li><p><strong>Úlohy, jejichž výsledek nečtete.</strong> Každá spotřebovává limit vašeho tarifu. Co po měsíci nečtete, zrušte.</p></li>
</ul>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> skill „Zápis z porady“ s firemní strukturou. Plánovaná úloha: pondělní přehled týdne z kalendáře.</p></li>
  <li><p><strong>Učitelé:</strong> skill „Pracovní list“ (ročník, struktura, úrovně obtížnosti). Plánovaná úloha: měsíční přehled novinek z webu ministerstva a ČŠI.</p></li>
  <li><p><strong>Živnostníci:</strong> skill „Cenová nabídka“ s vaší strukturou a pravidlem „ceny jen z ceníku“. Plánovaná úloha: týdenní přehled nových veřejných zakázek nebo dotačních výzev ve vašem oboru.</p></li>
</ul>

<h3><strong>Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Skill:</strong> použil se sám? Dodržel všech osm bodů, hlavně zdroje a kontrolní tabulku?</p></li>
  <li><p><strong>Report o obyvatelích:</strong> ověřte dvě obce proti tabulce ČSÚ. Nezapočítal agent řádek okresu jako obec?</p></li>
  <li><p><strong>Plánovaná úloha:</strong> vedou odkazy na oficiální weby? Sedí data zveřejnění s uplynulým týdnem?</p></li>
  <li><p><strong>Rozvrh:</strong> otevřete <em>Scheduled</em>. Je tam jedna úloha, správný den a čas? Víte, kde ji pozastavit?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Skill je postup, který platí vždy. Brief se díky němu zkrátí na to, co je pokaždé jiné.</p></li>
  <li><p>Claude po skillu sáhne podle jeho popisu. Popis proto pište konkrétně.</p></li>
  <li><p>Plánovaná úloha běží v cloudu i s vypnutým počítačem a na místní složku se nespoléhá.</p></li>
  <li><p>Neplánujte nic, co má následky, a rušte úlohy, které nečtete.</p></li>
</ul>

<p>V poslední lekci si sestavíte vlastní kontrolní seznam pro výstupy agenta, projdeme, co dělat, když se něco pokazí, a zadáte první úlohu ze své skutečné práce.</p>

<p>Až budete mít skill a naplánovanou úlohu, klikněte pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
