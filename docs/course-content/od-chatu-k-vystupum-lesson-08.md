# Od chatu k hotovým výstupům - Lekce 8

## Metadata

- Kurz: Od chatu k hotovým výstupům
- Lekce: 8
- Název: Hloubková rešerše se zdroji
- Předmět e-mailu: Lekce 8: Nechte AI přečíst padesát stránek za vás
- Preheader: Zadáte rešerši, která sama prohledá web, a zkontrolujete, jestli zdroje říkají to, co tvrdí.
- Délka čtení: 7 minut
- Fakta o funkcích ověřena: 12. 11. 2026 (support.claude.com „Use research on Claude“, help.openai.com „ChatGPT capabilities overview“ a poznámky k vydání). Číselné limity rešerší výrobci nezveřejňují nebo se mění, v lekci záměrně nejsou.

## Tělo e-mailu

```html
<p>Dobré ráno. Dosud jsme pracovali s podklady, které jste AI dali vy. Dnes ji pošlete hledat ven.</p>

<p>Zadáte <strong>hloubkovou rešerši</strong>: úlohu, při které AI sama projde desítky webových stránek a vrátí zprávu se zdroji. A hlavně se naučíte tu zprávu zkontrolovat, protože odkaz u věty ještě neznamená, že to ve zdroji opravdu stojí.</p>

<h3><strong>1. Tři způsoby, jak AI odpovídá na otázku</strong></h3>

<ul>
  <li><p><strong>Z hlavy.</strong> Odpoví z toho, co se naučila při tréninku. Rychlé, ale bez zdrojů a u čerstvých věcí zastaralé.</p></li>
  <li><p><strong>S vyhledáváním.</strong> Udělá pár dotazů na web a odpoví s odkazy. Vteřiny, dobré na jednu konkrétní informaci.</p></li>
  <li><p><strong>Hloubkovou rešerší.</strong> Hledá opakovaně, čte nalezené stránky, podle toho, co našla, se ptá dál, a nakonec sepíše strukturovanou zprávu. Trvá minuty, někdy i déle.</p></li>
</ul>

<p>Rešerše se vyplatí, když byste jinak sami otevřeli deset a víc záložek: srovnání možností, přehled vývoje, „co se o tom ví“. Na otázku „kdy má úřad otevřeno“ je to kanón na vrabce. A počítejte s tím, že rešerše čerpá limit vašeho tarifu rychleji než běžný chat.</p>

<h3><strong>2. Primární a sekundární zdroj</strong></h3>

<p><strong>Primární zdroj</strong> je ten, kdo informaci vytvořil: úřad, který vydal vyhlášku, statistický úřad, který čísla změřil, firma, která vydala ceník. <strong>Sekundární zdroj</strong> o tom píše: noviny, blogy, srovnávače.</p>

<p>Sekundární zdroje jsou čtivější, ale dělají chyby a stárnou. V zadání proto řekněte, čemu má AI dávat přednost. U českých témat to bývají weby úřadů, ČSÚ, ČNB, zákony a oficiální stránky měst.</p>

<h3><strong>3. Dobré zadání rešerše</strong></h3>

<p>Má pět částí: <strong>otázka</strong>, <strong>rozsah</strong> (období, území), <strong>zdroje</strong> (čemu dát přednost, co vynechat), <strong>výstup</strong> (délka, struktura) a <strong>nejistota</strong> (co dělat, když se zdroje neshodnou).</p>

<h3><strong>Dnešní úkol, krok 1: zadejte rešerši</strong></h3>

<p><strong>V Claude:</strong> v novém chatu klikněte vlevo dole na <em>+</em> a zapněte <em>Research</em>. Musíte mít zapnuté vyhledávání na webu. <a target="_blank" rel="noopener noreferrer nofollow" href="https://support.claude.com/en/articles/11088861-use-research-on-claude">Nápověda Claude k rešerši</a>.</p>

<p><strong>V ChatGPT:</strong> v režimu Chat otevřete nabídku nástrojů (<em>+</em>) u pole pro zprávu a zvolte <em>Deep research</em>. ChatGPT vám nejdřív ukáže plán rešerše, který můžete upravit, než začne. <a target="_blank" rel="noopener noreferrer nofollow" href="https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt">Nápověda OpenAI k hloubkové rešerši</a>.</p>

<p>Pošlete:</p>

<p><strong>„Otázka: Na co vydává hlavní město Praha nejvíc peněz a jak se to změnilo mezi roky 2021 a 2025?<br>
Rozsah: jen rozpočet hl. m. Prahy (město jako celek), ne státní rozpočet.<br>
Zdroje: dej přednost primárním zdrojům, tedy praha.eu, opendata.praha.eu, zprávám o plnění rozpočtu, závěrečným účtům a usnesením zastupitelstva. Novinové články použij jen na doplnění souvislostí a označ je jako sekundární.<br>
Výstup: zpráva do 600 slov. Nejdřív tři hlavní zjištění, potom tabulka výdajů podle oblastí po letech, potom co se nepodařilo zjistit. U každého čísla odkaz na konkrétní dokument a stranu.<br>
Nejistota: když se zdroje liší, uveď obě hodnoty a napiš, čím se rozdíl dá vysvětlit. Nic neodhaduj.“</strong></p>

<p>Než rešerše doběhne, můžete dělat něco jiného. Nemusíte mít okno otevřené.</p>

<h3><strong>Krok 2: ověřte tři tvrzení</strong></h3>

<p>Tohle je jádro dnešní lekce. Vyberte ve zprávě tři tvrzení s číslem a u každého:</p>

<ol>
  <li><p><strong>Otevřete odkaz.</strong> Funguje? Vede tam, kam zpráva tvrdí?</p></li>
  <li><p><strong>Najděte to číslo.</strong> Na stránce přes Ctrl+F (na Macu Cmd+F), v PDF na uvedené straně.</p></li>
  <li><p><strong>Porovnejte význam.</strong> Je to stejný rok, stejný celek (Praha, ne Magistrát), skutečnost, ne plán?</p></li>
</ol>

<p>Máte jednu výhodu: rok 2025 už znáte z lekce 3. Výdaje Prahy byly asi 124 mld. Kč a příjmy 148 mld. Kč. Sedí to s tím, co našla rešerše? Pokud ne, víte, kde začít pátrat.</p>

<p>Výsledek si zapište do malé tabulky: tvrzení, zdroj, sedí / nesedí / nelze ověřit. Co nesedí, pošlete zpátky: <strong>„Tvrzení X se zdrojem Y nesouhlasí, ve zdroji je Z. Oprav to a prověř ostatní čísla ze stejného dokumentu.“</strong></p>

<h3><strong>4. Tři typické vady rešerší</strong></h3>

<ul>
  <li><p><strong>Zdroj existuje, ale tvrzení v něm není.</strong> Nejzrádnější případ, protože odkaz vypadá důvěryhodně.</p></li>
  <li><p><strong>Správné číslo, špatný kontext.</strong> Plán místo skutečnosti, jiný rok, jiný celek. Znáte z lekcí 3 a 6.</p></li>
  <li><p><strong>Jeden zdroj opsaný pětkrát.</strong> Pět článků, které všechny vycházejí z jedné tiskové zprávy, je pořád jeden zdroj.</p></li>
</ul>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> „Jaké jsou možnosti řešení X, kolik stojí a co o nich říkají nezávislá srovnání?“ s tabulkou variant.</p></li>
  <li><p><strong>Učitelé:</strong> „Co říkají zprávy České školní inspekce o přijímacích zkouškách a jejich souvislosti s výsledky u maturity?“ Primární zdroj je csicr.cz.</p></li>
  <li><p><strong>Živnostníci:</strong> „Co se v roce 2026 mění pro OSVČ v zálohách, paušální dani a povinnostech?“ Primární zdroje: Finanční správa, ČSSZ, MPO. Výsledek berte jako přehled k rozhovoru s účetní, ne jako daňovou radu.</p></li>
</ul>

<h3><strong>Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Tři tvrzení ověřená</strong> otevřením zdroje.</p></li>
  <li><p><strong>Poměr zdrojů:</strong> kolik je primárních a kolik sekundárních? Stojí hlavní zjištění na primárních?</p></li>
  <li><p><strong>Datum:</strong> jak staré jsou zdroje? U pravidel a cen rozhoduje poslední verze.</p></li>
  <li><p><strong>Přiznané mezery:</strong> je ve zprávě část „co se nepodařilo zjistit“? Rešerše, která ví všechno, je podezřelá.</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Rešerše se hodí tam, kde byste jinak četli desítky stránek. Na jednu informaci stačí vyhledávání.</p></li>
  <li><p>Zadání: otázka, rozsah, zdroje, výstup, nejistota.</p></li>
  <li><p>Odkaz není důkaz. Tři tvrzení vždy ověřte otevřením zdroje.</p></li>
  <li><p>Dávejte přednost primárním zdrojům a ptejte se, co se zjistit nepodařilo.</p></li>
</ul>

<p>Zítra pustíte AI k vlastním datům: připojíte <strong>konektor</strong> ke kalendáři nebo disku. A vysvětlíme si, proč se při tom vyplatí být opatrnější než kdekoli jinde v kurzu.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
