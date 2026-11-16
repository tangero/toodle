# Claude jako pracovní agent - Lekce 4

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 4
- Název: Sloučit tabulky a spočítat to správně
- Předmět e-mailu: Lekce 4: Tři roky rozpočtu v jedné tabulce
- Preheader: Sloučení tabulek, kontrolní součty a list, na kterém agent přizná, co musel upravit.
- Délka čtení: 7 minut + asi 25 minut práce
- Režim doručení: on_click
- Poznámka pro autory: kontrolní hodnoty ze souborů `rozpocet-praha-mhmp-*.csv`, spočítáno 12. 11. 2026. Počty řádků 2 204 / 1 998 / 1 612 (celkem 5 814). Výdaje (položky 5 a 6), schválený rozpočet: 109,4 / 113,5 / 119,1 mld. Kč. Příjmy (položky 1 až 4): 105,8 / 110,9 / 116,4 mld. Kč. Doprava: 38,1 / 39,6 / 41,5 mld. Kč.

## Tělo e-mailu

```html
<p>Dobrý den. V uklizené složce máte tři tabulky rozpočtu pražského Magistrátu, každý rok zvlášť. Dnes z nich Claude udělá <strong>jeden sešit Excelu</strong> se sloučenými daty, přehledem, grafem a hlavně s listem kontrol.</p>

<p>Slučování tabulek je práce, kde agent ušetří nejvíc času a kde se zároveň nejsnáz ztratí pár řádků, aniž by si toho kdokoli všiml. Proto je dnešní lekce z poloviny o kontrole.</p>

<h3><strong>1. Co se při slučování kazí</strong></h3>

<ul>
  <li><p><strong>Ztracené nebo zdvojené řádky.</strong> Soubor se načte dvakrát, poslední řádek vypadne, prázdné řádky se započítají.</p></li>
  <li><p><strong>Posunuté sloupce.</strong> Naše soubory mají na konci řádku středník navíc. Kdo s tím nepočítá, má o sloupec víc.</p></li>
  <li><p><strong>Čísla jako text.</strong> Desetinná tečka místo čárky, mezery v číslech. Součet pak vyjde nula nebo nesmysl.</p></li>
  <li><p><strong>Míchání hrušek a jablek.</strong> Příjmy sečtené s výdaji, schválený rozpočet s upraveným.</p></li>
</ul>

<h3><strong>2. Kontrolní součet</strong></h3>

<p>Obrana je jednoduchá a stará jako účetnictví: <strong>spočítejte totéž před sloučením a po něm.</strong> Počet řádků v každém souboru a po sloučení. Součet sloupce v každém souboru a po sloučení. Když čísla sedí, nic se neztratilo ani nepřibylo. Když nesedí, víte to hned, ne za měsíc.</p>

<p>Agent umí kontrolní součty udělat sám. Musíte mu to ale napsat do bodu Hotovo. A dvě čísla si pak ověříte proti hodnotám v téhle lekci.</p>

<h3><strong>3. List „Poznámky k datům“</strong></h3>

<p>Při práci s daty musí agent dělat rozhodnutí: co s prázdným sloupcem, co s řádkem bez položky, jak zaokrouhlit. Chcete je mít sepsaná. Proto do každé datové úlohy patří list, kam agent zapíše, co musel upravit a co předpokládal. Je to nejlepší místo, kde začít s kontrolou.</p>

<h3><strong>Dnešní úkol: brief na sloučení</strong></h3>

<p>V Claude Desktop připojte složku Kurz AI s povolenými úpravami. Pošlete:</p>

<p><strong>„CÍL: Jeden sešit Excelu, ze kterého je vidět, jak se mění schválený rozpočet Magistrátu hl. m. Prahy v letech 2024 až 2026.<br>
PODKLADY: tři tabulky rozpočtu MHMP (roky 2024, 2025, 2026) ve složce Kurz AI, podsložka Uklid - pracovni/rozpocet. Jsou to CSV se středníkem a středníkem navíc na konci řádku. Částky jsou v tisících Kč s desetinnou tečkou. Sloupec pol je položka: začíná-li 1 až 4, je to příjem, 5 a 6 výdaj, 8 financování. Originály neměň.<br>
VÝSTUP: soubor rozpocet-praha-2024-2026.xlsx ve složce Kurz AI se čtyřmi listy:<br>
1) Data: všechny řádky ze tří souborů pod sebou, se sloupcem rok a novým sloupcem typ (příjem, výdaj, financování, neurčeno).<br>
2) Přehled: výdaje podle nazev_oblast a roku ze sloupce rozpocet_schvaleny v miliardách Kč, změna 2024 až 2026 v procentech, seřazeno podle roku 2026. Čísla počítej vzorci z listu Data, ať se dají dohledat.<br>
3) Graf: sloupcový graf šesti největších oblastí za tři roky, osa od nuly, české popisky, zdroj.<br>
4) Kontroly a poznámky: počet řádků v každém zdrojovém souboru a na listu Data; součet rozpocet_schvaleny za příjmy a za výdaje v každém souboru a na listu Data; seznam všeho, co jsi musel upravit nebo předpokládat.<br>
HOTOVO: počty řádků i součty na listu Kontroly sedí mezi zdroji a listem Data na korunu. Každé číslo na listu Přehled je vzorec, ne napsaná hodnota.<br>
OMEZENÍ: nic nemaž, zdrojové soubory neměň, web nepoužívej. Řádky, které neumíš zařadit, nevyhazuj, označ je jako neurčeno.<br>
Nejdřív mi napiš plán a počkej na souhlas. Na konci napiš, co jsi udělal, co jsi nemohl udělat a čím si nejsi jistý.“</strong></p>

<p>Všimněte si, kolik místa v briefu zabírá popis dat. Je to stejný popis jako v ZDROJE.txt. Agent by si ho mohl přečíst sám, ale u věcí, na kterých stojí správnost výpočtu, se nespoléhejte na to, že si je najde.</p>

<h3><strong>Ověřte dvě čísla sami</strong></h3>

<p>Otevřete hotový sešit a list Kontroly. Mělo by tam být:</p>

<ul>
  <li><p><strong>Řádky:</strong> 2 204, 1 998 a 1 612, dohromady <strong>5 814</strong>. (Pokud agent počítá i řádek se záhlavím, bude u každého souboru o jeden víc. Na listu Data ale záhlaví smí být jen jednou.)</p></li>
  <li><p><strong>Výdaje, schválený rozpočet:</strong> zhruba <strong>109,4 – 113,5 – 119,1 mld. Kč</strong>.</p></li>
  <li><p><strong>Doprava</strong> na listu Přehled: <strong>38,1 – 39,6 – 41,5 mld. Kč</strong>.</p></li>
</ul>

<p>Pak klikněte na jedno číslo na listu Přehled. Je v buňce vzorec, nebo jen hodnota? A nakonec si v listu Data zapněte filtr, vyberte rok 2025 a oblast Doprava a podívejte se dolů na součet označených buněk. Sedí s Přehledem?</p>

<p>Když něco nesedí, pošlete agentovi konkrétní rozdíl: <strong>„Na listu Kontroly máš za rok 2025 výdaje X, správně je zhruba 113,5 mld. Kč. Najdi příčinu, oprav ji a napiš, co bylo špatně.“</strong></p>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> měsíční exporty z jednoho systému do jedné roční tabulky. Kontrolní součet = součet obratu za každý měsíc.</p></li>
  <li><p><strong>Učitelé:</strong> ze sady Statistiky spojte počty obyvatel obcí za roky 2024 a 2025 a nechte spočítat změnu pro obce vašeho okresu. Pozor na řádky krajů a okresů mezi obcemi. Zdroj: ČSÚ.</p></li>
  <li><p><strong>Živnostníci:</strong> čtvrtletní přehledy příjmů a výdajů do jedné roční tabulky s grafem po měsících.</p></li>
</ul>

<h3><strong>Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>List Kontroly:</strong> sedí počty řádků a součty? Dvě čísla ověřená proti lekci.</p></li>
  <li><p><strong>Vzorce:</strong> jsou na Přehledu vzorce? Změňte na listu Data jedno číslo a sledujte, jestli se Přehled přepočítá. Pak změnu vraťte.</p></li>
  <li><p><strong>Poznámky:</strong> co agent upravoval a předpokládal? Souhlasíte s tím?</p></li>
  <li><p><strong>Zdroje:</strong> jsou původní CSV beze změny (stejné datum úpravy)?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Při slučování se ztrácejí řádky a mění typy. Kontrolní součet před a po to odhalí.</p></li>
  <li><p>Popis dat (oddělovač, jednotky, význam sloupců) patří do briefu.</p></li>
  <li><p>Chtějte vzorce místo hodnot a list s poznámkami k datům.</p></li>
  <li><p>Dvě čísla vždy ověřte proti něčemu, co agent nevyrobil.</p></li>
</ul>

<p>V další lekci ze sešitu a ze zprávy o plnění rozpočtu vznikne report: několikastránkový dokument s grafy, který Claude napíše z více souborů najednou.</p>

<p>Až budou kontroly sedět, klikněte pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
