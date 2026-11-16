# Claude jako pracovní agent - Lekce 5

## Metadata

- Kurz: Claude jako pracovní agent
- Lekce: 5
- Název: Report z podkladů ve složce
- Předmět e-mailu: Lekce 5: Report, u kterého jde každá věta dohledat
- Preheader: Claude napíše zprávu z PDF a tabulek najednou. Ty hlídáš, odkud která věta je.
- Délka čtení: 6 minut + asi 30 minut práce
- Režim doručení: on_click
- Poznámka pro autory: čísla skutečnosti 2025 ze zprávy o plnění rozpočtu, strana 4 souboru (příjmy 148,1, výdaje 124,0, přebytek 24,2 mld. Kč; kapitálové výdaje čerpány na 65,62 % upraveného rozpočtu).

## Tělo e-mailu

```html
<p>Ahoj. Máš uklizenou složku a sešit se třemi roky rozpočtu. Dnes z toho Claude napíše <strong>report „Hospodaření Prahy v číslech“</strong>: tři až čtyři strany s grafy, jako dokument Word ve tvé složce.</p>

<p>Je to první úloha, kde agent kombinuje více zdrojů různého druhu: zprávu v PDF a tabulky. A první, kde vznikne text, který bys mohl/a někomu poslat. Proto se dnes naučíš chtít po agentovi <strong>stopu</strong>: u každého tvrzení, odkud je.</p>

<h3><strong>1️⃣ Dva zdroje, dvě různé pravdy</strong></h3>

<p>Ve složce máš dva pohledy na pražské peníze a oba jsou správně:</p>

<ul>
  <li><p><strong>Zpráva o plnění rozpočtu (PDF):</strong> skutečnost za rok 2025, Praha jako celek včetně městských částí.</p></li>
  <li><p><strong>Tabulky (tvůj sešit):</strong> schválený rozpočet na roky 2024 až 2026, jen Magistrát.</p></li>
</ul>

<p>Výdaje za rok 2025 jsou podle zprávy 124 miliard, podle tabulek 113,5 miliardy. Agent, kterému to neřekneš, vezme jedno z čísel podle toho, na který soubor narazí dřív, nebo je porovná, jako by šlo o totéž. V reportu z více zdrojů je tohle chyba číslo jedna: <strong>správná čísla ve špatném sousedství.</strong></p>

<h3><strong>2️⃣ Co patří do briefu na report</strong></h3>

<ul>
  <li><p><strong>Čtenář a účel.</strong> Kdo to bude číst a co s tím udělá.</p></li>
  <li><p><strong>Osnova.</strong> Kapitoly napiš sám/sama. Agent je naplní, ale o stavbě rozhoduješ ty.</p></li>
  <li><p><strong>Který zdroj na co.</strong> Skutečnost ze zprávy, vývoj plánu z tabulek.</p></li>
  <li><p><strong>Stopa.</strong> U každého čísla zdroj: soubor a strana, nebo soubor a list.</p></li>
  <li><p><strong>Co s mezerami.</strong> Když něco v podkladech není, má to napsat, ne domyslet.</p></li>
</ul>

<h3><strong>✏️ Dnešní úkol: brief na report</strong></h3>

<p>V Claude Desktop připoj složku Kurz AI s povolenými úpravami a pošli:</p>

<p><strong>„CÍL: Report Hospodaření Prahy v číslech pro obyvatele Prahy, kteří rozpočtům nerozumí, ale chtějí vědět, jak město hospodaří a kam jeho rozpočet míří. Má jít přečíst za deset minut.<br>
PODKLADY: 1) zpráva o plnění rozpočtu za rok 2025 (PDF ve složce Uklid - pracovni/rozpocet): skutečnost, Praha jako celek, částky v tisících Kč; 2) sešit rozpocet-praha-2024-2026.xlsx: schválený rozpočet Magistrátu. Tyhle dva celky nikdy neporovnávej přímo a u každého čísla napiš, o kterém mluvíš. Web nepoužívej.<br>
VÝSTUP: dokument Word hospodareni-prahy-v-cislech.docx ve složce Kurz AI, tři až čtyři strany. Osnova: 1) Shrnutí v pěti větách; 2) Rok 2025 ve skutečnosti: příjmy, výdaje, výsledek, srovnání s rokem 2024; 3) Odkud město bere peníze; 4) Co se nepodařilo vyčerpat a proč to zpráva uvádí; 5) Kam míří rozpočet Magistrátu 2024 až 2026: největší oblasti a změny, s grafem ze sešitu; 6) Co z podkladů zjistit nejde. Částky v miliardách Kč na jedno desetinné místo. U každého čísla v závorce zdroj: zpráva a strana, nebo sešit a list.<br>
HOTOVO: každé číslo má zdroj. V dokumentu jsou dva grafy s popisky a zdrojem. Kapitola 6 obsahuje aspoň tři konkrétní věci. Na samostatné poslední straně je tabulka: číslo v textu, zdroj, původní hodnota ve zdroji.<br>
OMEZENÍ: žádné hodnocení ani doporučení politikům, jen popis. Nic neodhaduj a nedoplňuj z vlastních znalostí. Existující soubory neměň.<br>
Nejdřív mi napiš plán a počkej na souhlas. Na konci napiš, co jsi udělal, co jsi nemohl udělat a čím si nejsi jistý.“</strong></p>

<p>Tabulka na poslední straně je tvůj kontrolní list. Před odesláním reportu ji prostě odstraníš.</p>

<h3><strong>✏️ Revize: označ místa bez zdroje</strong></h3>

<p>Až bude report hotový, pošli ještě jednu úlohu:</p>

<p><strong>„Přečti report jako přísný oponent. Vypiš každou větu, která obsahuje číslo, srovnání nebo příčinu (‚protože‘, ‚díky‘, ‚kvůli‘) a nemá zdroj v podkladech. U každé napiš, jestli ji lze doložit, nebo je to tvoje domněnka. Nic zatím neopravuj.“</strong></p>

<p>Pozor hlavně na příčiny. Čísla agent většinou opíše správně, ale vysvětlení, proč se něco stalo, si rád domyslí. Co není ve zprávě, do reportu nepatří, nebo to má být označené jako tvůj názor.</p>

<p>Chceš report i jako sdílitelný dokument? Požádej: <strong>„Udělej z reportu také dokument Docs.“</strong> Ve Wordu ho máš ve složce, v Claude Docs ho můžeš poslat odkazem a nechat komentovat.</p>

<h3><strong>💼 Pro tvoji práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> čtvrtletní report z exportů a loňského reportu jako vzoru. Do briefu napiš, které číslo je z kterého systému.</p></li>
  <li><p><strong>Učitelé:</strong> zpráva pro vedení školy nebo předmětovou komisi z vlastních podkladů a anonymních výsledků. Jména žáků do složky nepatří.</p></li>
  <li><p><strong>Živnostníci:</strong> roční přehled podnikání pro sebe nebo pro banku: tržby, náklady, největší zakázky, výhled.</p></li>
</ul>

<h3><strong>🔍 Kontrola výstupu</strong></h3>

<ul>
  <li><p><strong>Tři čísla proti zdroji:</strong> ze zprávy (strana 4: příjmy 148,1, výdaje 124,0, přebytek 24,2 mld. Kč), jedno ze sešitu a jedno dle vlastního výběru.</p></li>
  <li><p><strong>Sousedství:</strong> stojí někde vedle sebe číslo za celou Prahu a číslo za Magistrát bez vysvětlení?</p></li>
  <li><p><strong>Příčiny:</strong> každé „protože“ má oporu ve zprávě?</p></li>
  <li><p><strong>Grafy:</strong> dvě hodnoty z každého grafu proti sešitu, osa od nuly.</p></li>
  <li><p><strong>Tón:</strong> popisuje, nebo hodnotí?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>U více zdrojů řekni, který je na co, a nedovol je míchat.</p></li>
  <li><p>Osnovu napiš sám/sama, agent ji plní.</p></li>
  <li><p>Chtěj stopu: u každého čísla soubor a místo.</p></li>
  <li><p>Druhou úlohou nech report oponovat. Hledej hlavně nepodložené příčiny.</p></li>
</ul>

<p>V další lekci z reportu vznikne prezentace a naučíš se ji dotáhnout pokyny po jednotlivých slajdech.</p>

<p>Až bude report zkontrolovaný, klikni pod e-mailem na <strong>Hotovo, chci další lekci</strong>.</p>

<p>— <strong>Tým Letní školy AI</strong><br>Patrick a Iva</p>
```
