# Cvičné soubory pro kurzy A a B

Veřejná data ke stažení pro cvičení v kurzech řady „Od promptu k práci s AI“. Soubory jsou v `public/soubory/` a Worker je vydává jako statické soubory na `https://<doména>/soubory/...`. V lekcích odkazuj přednostně na ZIP celé sady. Na jednotlivý soubor odkazuj jen tehdy, když lekce potřebuje jediný soubor.

Každá sada obsahuje `ZDROJE.txt` se zdroji a licencemi. Licence CC BY vyžaduje uvést autora, proto `ZDROJE.txt` nemazat a v lekci u dat ČSÚ napsat „Zdroj: ČSÚ“.

Stav: staženo 12. 11. 2026. Soubory jsou beze změn, jen přejmenované.

## Sady

| Sada (ZIP) | Obsah | Licence | Hlavní použití |
|---|---|---|---|
| `/soubory/rozpocet-praha.zip` (2,3 MB) | Rozpočet MHMP 2024, 2025, 2026 (CSV) + Zpráva o plnění rozpočtu 2025 (PDF, 31 stran) | CSV: CC0; PDF: veřejný dokument úřadu | Miniprojekt „Rozpočet Prahy srozumitelně“: shrnutí PDF, kontrola čísel proti CSV, sloučení tří let, graf, report, prezentace, výukový materiál |
| `/soubory/statistiky.zip` (1,5 MB) | Obyvatelé obcí 2024 a 2025 (XLSX), inflace podle skupin 1995–2025 (CSV), mzdy podle odvětví (XLSX) | CC BY 4.0, ČSÚ | Najdi svou obec a spočítej změnu, graf inflace, graf mezd |
| `/soubory/podnikani.zip` (3,0 MB) | Aktivní ekonomické subjekty 2000–2025 (XLSX), inflace (CSV), pokyny k daňovému přiznání FO 2025 (PDF), Zpráva ČNB o měnové politice léto 2026 (PDF) | ČSÚ: CC BY 4.0; MF: úřední tiskopis; ČNB: dle podmínek webu ČNB | Živnostníci: „vysvětli mi pokyny lidsky“, kontrolní seznam OSVČ, co znamená výhled ČNB pro ceny a úvěr |
| `/soubory/neuklizena-slozka.zip` (6,0 MB) | Výběr z ostatních sad pod nesourodými názvy, s duplicitami, podsložkami a souborem `poznamky.txt` | dle původních sad | Jen kurz B, lekce 3: úklid, přejmenování a soupis. V lekcích 4 a 5 pokračuje uklizená složka |

## Poznámky k datům (hodí se do lekcí jako „na co si dát pozor“)

- **Rozpočet Prahy (CSV):** UTF-8, oddělovač středník, na konci řádku středník navíc (prázdný sloupec). Částky jsou v tis. Kč. Položky 1xxx–4xxx jsou příjmy, 5xxx–6xxx výdaje a 8xxx financování. Jde jen o Magistrát, bez městských částí. Rok 2026 je průběžný stav.
- **Obyvatelé obcí:** třířádková česko-anglická hlavička, mezi obcemi jsou řádky krajů a okresů. To je dobré cvičení na „uklizení“ tabulky.
- **Inflace (CSV):** oddělovač čárka, takže se v českém Excelu po dvojkliku nerozdělí do sloupců. Data jsou v dlouhém formátu s kódy a typ indexu je potřeba vyfiltrovat. ČSÚ tento produkt od roku 2026 neaktualizuje (nástupce má 67 MB).
- **Mzdy podle odvětví:** velmi široká tabulka (roky ve sloupcích), dobré cvičení na otočení tabulky.
- **Ekonomické subjekty:** chybějící hodnoty jsou zapsané tečkou.
- **Pokyny MF:** 4 strany, ale hustý text (asi 7 000 slov).

## Sada pro učitele: jen odkazy

Data CERMAT a zprávy ČŠI nemají otevřenou licenci („všechna práva vyhrazena“), proto je nehostujeme. V lekcích na ně jen odkazuj, čtenář si je stáhne sám. Pokud je chceme dávat ke stažení, je potřeba si vyžádat souhlas.

- Výsledky společné části maturity po školách, jaro 2025 a 2026 (XLSX, 98 sloupců; sloučit lze podle REDIZO): https://data.cermat.gov.cz/maturitni-zkouska/agregovana-data.html
- ČŠI, tematická zpráva „Souvislost výsledků přijímací zkoušky a společné části maturitní zkoušky s vybranými znaky středních škol“ (PDF, 41 stran): https://csicr.cz/cz/Dokumenty/Tematicke-zpravy/Tematicka-zprava-Souvislost-vysledku-prijimaci-zko
- Alternativa: ČŠI „Kombinovaná výuka“ (PDF, 39 stran): https://csicr.cz/CSICR/media/Prilohy/2024_p%c5%99%c3%adlohy/Dokumenty/TZ_Kombinovana-vyuka_FINAL.pdf

Pro výukový materiál (lekce A7 a B7) stačí učitelům sada Rozpočet Prahy („Jak hospodaří Praha“ pro žáky) nebo vlastní učivo. Data CERMAT jsou volitelná varianta „porovnej svou školu s krajem“.

## Co chybí

- Data o živnostech po obcích nebo oborech a ceny energií pro podnikatele v rozumné velikosti.
- Rozpočet menšího města ve strojovém formátu. Brno má rozpočty jen v PDF, Ostrava má v NKOD datasety za roky 2016–2020.

## Aktualizace

Před spuštěním kurzu ověř, že novější verze nejsou výrazně lepší (rozpočet 2027, zpráva ČNB podzim 2026). Při výměně souboru zachovej název, aby fungovaly odkazy v lekcích, a uprav `ZDROJE.txt` i ZIP.
