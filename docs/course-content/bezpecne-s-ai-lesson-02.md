# Bezpečně s AI v práci a ve škole - Lekce 2

## Metadata

- Kurz: Bezpečně s AI v práci a ve škole
- Lekce: 2
- Název: Osobní a citlivé údaje: co nenahrávat a jak text anonymizovat
- Předmět e-mailu: Lekce 2: Jména pryč, práce zůstane
- Preheader: Semafor na data a pět minut ruční práce, po které můžete AI dát i citlivý text.
- Délka čtení: 7 minut
- Poznámka pro autory: cvičný e-mail v lekci je smyšlený, jména, adresa i číslo zakázky jsou vymyšlené.
- Právní tvrzení revidována 16. 11. 2026 podle článku https://www.marigold.cz/item/smlouvy-ai-gdpr/ (ověřený právníkem). Z článku pocházejí: právní titul a nezbytný rozsah, pseudonymizace jako stále osobní údaj, odstranění údajů před odesláním, obchodní tajemství a NDA jako samostatná překážka, kontrola PDF.
- Ověřit před publikací: zařazení rodných čísel a čísel dokladů do červené je praktické doporučení lekce, článek je výslovně neuvádí (v červené má hesla, zvláštní kategorie údajů a důvěrné informace, které se nesmějí předat).

## Tělo e-mailu

```html
<p>Dobré ráno. Včera jste zjistili, kam vaše zprávy putují. Dnes se podíváme na to, co v nich má být a co ne.</p>

<p>A naučíte se <strong>anonymizaci</strong>: pět minut ruční práce, díky které můžete AI dát text o skutečných lidech, aniž byste jí ty lidi prozradili.</p>

<h3><strong>1. Semafor na data</strong></h3>

<p>Než cokoli vložíte nebo nahrajete, zařaďte to do jedné ze tří barev.</p>

<p><strong>Červená: nikdy</strong></p>

<ul>
  <li><p>hesla, PINy, přístupové kódy, čísla karet,</p></li>
  <li><p>rodná čísla, čísla dokladů,</p></li>
  <li><p>zdravotní údaje konkrétních lidí,</p></li>
  <li><p>cokoli, co vám někdo svěřil jako důvěrné.</p></li>
</ul>

<p><strong>Oranžová: jen anonymizované, nebo ve firemním účtu podle pravidel</strong></p>

<ul>
  <li><p>jména a kontakty klientů, žáků, rodičů, kolegů,</p></li>
  <li><p>známky, hodnocení, platy, docházka,</p></li>
  <li><p>smlouvy, nabídky, interní čísla firmy,</p></li>
  <li><p>e-maily a zprávy od jiných lidí.</p></li>
</ul>

<p><strong>Zelená: bez obav</strong></p>

<ul>
  <li><p>veřejné informace, zákony, učebnicová látka,</p></li>
  <li><p>vaše vlastní texty bez údajů o jiných lidech,</p></li>
  <li><p>obecné otázky a nápady.</p></li>
</ul>

<p>Dobrá pomůcka pro oranžovou: <strong>vadilo by tomu člověku, kdyby věděl, že to do AI vkládám?</strong> Pokud ano, anonymizujte.</p>

<h3><strong>2. Proč na osobních údajích záleží</strong></h3>

<p>Údaje o lidech nejsou vaše, i když je máte v počítači. Patří těm lidem a vy nebo vaše organizace za ně odpovídáte. Evropské nařízení o ochraně osobních údajů (<strong>GDPR</strong>) říká zjednodušeně: osobní údaje smíte předat dál jen tehdy, když k tomu máte důvod, který zákon uznává, a jen tolik, kolik je nutné. Pohodlí takový důvod samo o sobě není. Vkládat osobní údaje do AI přitom právo plošně nezakazuje ani nepovoluje. Posuzuje se konkrétní případ: k čemu, v jakém rozsahu a komu data jdou. Tahle lekce není právní rada, ve sporných případech se zeptejte toho, kdo má u vás ochranu údajů na starosti.</p>

<p>Dobrá zpráva: většinu práce AI zvládne stejně dobře bez jmen. K tomu, aby vám pomohla napsat odpověď na stížnost, nepotřebuje vědět, jak se stěžovatel jmenuje a kde bydlí. Rozsah určuje úkol, ne to, kolik se toho do AI vejde.</p>

<p>Jména nejsou jediná překážka. Neveřejné ceny nebo technický návrh můžou být obchodním tajemstvím i v dokumentu, ze kterého všechna jména zmizela. A pokud vás váže dohoda o mlčenlivosti (NDA), rozhoduje její text. Když zakazuje předat obsah externí službě bez souhlasu, nepomůže anonymizace ani firemní účet.</p>

<h3><strong>3. Anonymizace: dřív, než text vložíte</strong></h3>

<p>Anonymizovat znamená odstranit nebo nahradit všechno, podle čeho se dá poznat konkrétní člověk. Přesně vzato: když jména nahradíte kódy a necháte si klíč, jde jen o <strong>pseudonymizaci</strong>. Dokud jde člověka znovu určit podle klíče nebo z kontextu, je text pořád osobní údaj. Kódy riziko snižují, pravidla organizace ale platí dál. Důležité je slovo <strong>dřív</strong>. Když vložíte text do AI a požádáte ji „anonymizuj to“, údaje už odešly. Anonymizace je ruční práce před vložením.</p>

<p>Postup:</p>

<ol>
  <li><p><strong>Najděte identifikátory:</strong> jména, adresy, telefony, e-maily, data narození, čísla smluv a zakázek, názvy firem, a také neobvyklé podrobnosti, podle kterých by se člověk dal poznat („jediná vozíčkářka ve třídě“).</p></li>
  <li><p><strong>Nahraďte je kódy:</strong> [ZÁKAZNÍK], [ŽÁK A], [FIRMA 1], [ADRESA]. Stejný člověk má všude stejný kód.</p></li>
  <li><p><strong>Zapište si klíč</strong> (kdo je kdo) na papír nebo do souboru u sebe. Klíč do AI nikdy nevkládejte.</p></li>
  <li><p><strong>Vložte anonymizovaný text</strong> a pracujte s AI.</p></li>
  <li><p><strong>Do výsledku vraťte skutečné údaje</strong> ručně podle klíče.</p></li>
</ol>

<p>Ve Wordu i v Google Dokumentech vám pomůže funkce Najít a nahradit (ve Windows Ctrl+H).</p>

<h3><strong>Dnešní úkol, krok 1: nácvik na cvičném e-mailu</strong></h3>

<p>Tady je smyšlený e-mail. Zkopírujte si ho do dokumentu a anonymizujte ho podle postupu výše. V AI zatím nic nedělejte.</p>

<p><em>„Dobrý den, paní Kratochvílová, píšu kvůli zakázce č. 2026-0417 (výměna oken, Lipová 12, Kolín). Řemeslníci přišli 3. října o dva dny později, než jsme se domluvili, a manželka kvůli tomu musela dvakrát zůstat doma z práce, přestože je po operaci kolene a měla mít klid. Jedno okno v dětském pokoji navíc nejde dovřít. Žádám slevu 15 % a opravu do konce týdne. Volejte mi na 601 234 567. S pozdravem Jaroslav Benda“</em></p>

<p>Kolik identifikátorů jste našli? Mělo by jich být aspoň sedm: dvě jména, číslo zakázky, adresa, telefon, datum, a také zmínka o operaci kolene. To je zdravotní údaj o třetí osobě a pro odpověď na reklamaci ho nepotřebujete vůbec, takže ho nenahrazujte kódem, ale vynechte.</p>

<h3><strong>Krok 2: práce s anonymizovaným textem</strong></h3>

<p>Teď anonymizovanou verzi vložte do AI s tímto zadáním:</p>

<p><strong>„Vedu malou firmu na výměnu oken. Přišla mi tahle reklamace, údaje jsou nahrazené kódy v hranatých závorkách, kódy ve své odpovědi zachovej. Napiš zdvořilou odpověď do 120 slov: omluva za zpoždění, oprava okna do [TERMÍN], a místo slevy 15 % nabídni slevu 10 % s krátkým zdůvodněním. Nic neslibuj nad rámec toho, co píšu.“</strong></p>

<p>Dostanete použitelnou odpověď. AI přitom neví, kdo si stěžoval, kde bydlí ani jaké má číslo.</p>

<h3><strong>Krok 3: váš vlastní dokument</strong></h3>

<p>Vezměte jeden skutečný text ze své práce, který patří do oranžové (e-mail, zápis, hodnocení), a udělejte totéž. Do dokumentu Moje pravidla pak přidejte druhý oddíl:</p>

<p><strong>2. Co do AI nedávám<br>
Nikdy: hesla, rodná čísla, zdravotní údaje, důvěrné věci.<br>
Jen anonymizované: [doplňte, co se týká vaší práce].<br>
Jak anonymizuji: nahrazuji kódy před vložením, klíč mám u sebe, do výsledku vracím údaje ručně.</strong></p>

<h3><strong>Pro vaši práci</strong></h3>

<ul>
  <li><p><strong>Kancelář:</strong> zápisy z porad a e-mailová vlákna. Jména kolegů a klientů nahraďte rolemi: [VEDOUCÍ OBCHODU], [KLIENT 1].</p></li>
  <li><p><strong>Učitelé:</strong> slovní hodnocení a žákovské práce. [ŽÁK A], [ŽÁK B], bez třídy a bez podrobností, podle kterých by se žák dal poznat. Rukopisy s podpisem nefoťte.</p></li>
  <li><p><strong>Živnostníci:</strong> poptávky a reklamace. Zákazníka nahraďte kódem, adresu a telefon vynechte úplně.</p></li>
</ul>

<h3><strong>Kontrola</strong></h3>

<ul>
  <li><p><strong>Přečtěte anonymizovaný text očima cizího člověka.</strong> Poznal by, o koho jde? Nejčastěji prozradí kombinace drobností, ne jméno.</p></li>
  <li><p><strong>Názvy souborů:</strong> soubor „hodnoceni_Novak_Petr.docx“ prozradí jméno, i když je uvnitř anonymizováno.</p></li>
  <li><p><strong>Vlastnosti dokumentu:</strong> Word ukládá autora. U souborů, které nahráváte, to zkontrolujte. U PDF i textovou vrstvu, komentáře a metadata.</p></li>
  <li><p><strong>Klíč:</strong> je uložený jen u vás?</p></li>
</ul>

<h3><strong>Co si z dneška odnést</strong></h3>

<ul>
  <li><p>Červená nikdy, oranžová jen anonymizovaně nebo ve firemním účtu, zelená bez obav.</p></li>
  <li><p>Anonymizujte před vložením. Požádat AI o anonymizaci je pozdě.</p></li>
  <li><p>Stejný člověk, stejný kód. Klíč zůstává u vás.</p></li>
  <li><p>Co pro úkol není potřeba, nenahrazujte, ale vynechte.</p></li>
  <li><p>Obchodní tajemství a NDA platí i pro text bez jmen.</p></li>
</ul>

<p>Zítra otočíme směr. Dosud šlo o to, co dáváte AI vy. Zítra o to, co dává AI vám, a jak poznat, kdy si vymýšlí.</p>

<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```
