# Záludnosti

Věci, které při práci na projektu stály čas. Každá s tím, jak se jí vyhnout.

## Wrangler a D1

- **`wrangler d1 execute --file` rozbije SQL s `CASE … END`.** Při dělení souboru na příkazy bere `CASE` jako začátek bloku, spojí zbytek souboru a import skončí chybou `SQLITE_TOOBIG`. V generovaném SQL (`scripts/import-courses.mjs`) proto podmínku zapiš aritmeticky, například `version = lessons.version + (lessons.content_md <> excluded.content_md)`. V kódu přes `prepare()` `CASE` nevadí.
- **Po nasazení vrací nové stránky pár sekund 404.** Nová verze Workeru se šíří postupně; před závěrem „nefunguje“ počkej a zkus znovu.
- **`npm run build` shodí běžící `wrangler dev`**, protože přepíše `dist`. Po každém buildu server restartuj. Dva procesy (nebo agenti) nesmí stavět do stejného `dist` současně.
- **Lokální příkazy D1 potřebují `--persist-to .wrangler/state`**, jinak sahají do jiné lokální databáze než `npm run dev:wrangler`.

## E-maily

- **Resend vrací 403, dokud není odesílací doména ověřená.** Zápis nepřihlášeného čtenáře pak končí chybou (502 s hláškou). Ověř skutečným odesláním, ne jen kontrolou DNS.
- **Limit tří přihlašovacích odkazů za hodinu na adresu** se počítá i za neúspěšné pokusy. Opakované testování zápisu na jednu adresu se rychle zablokuje (odpověď 429).
- **`/api/auth/magic-link` vrací vždy stejnou odpověď**, i když e-mail neodejde. Odeslání z ní nepoznáš.
- **Resend při stejném klíči proti dvojímu odeslání a jiném těle vrací 409.** U lekcí se to bere jako „už odesláno“ (`isAlreadySentConflict`), protože blok nabídek se mezi pokusy může změnit.

## Ověřování vzhledu

- **Headless Chrome má nejmenší šířku okna asi 500 px.** Snímek s `--window-size=390` je oříznutý, ne zúžený. Pro šířku telefonu použij `npx -y playwright@1.49.1 screenshot --channel chrome --viewport-size "390,800" --full-page <url> <soubor>`.
- **Stránky nejdou vložit do `iframe`** kvůli bezpečnostním hlavičkám; test v rámečku nefunguje.
- **Tailwind má utilitu `outline`.** Třída `.outline` ve vlastním CSS od ní dostala rámeček; v `site.css` je proto `outline: none`. Pozor na další jména tříd shodná s utilitami Tailwindu.

## Pracovní postup

- **Složky `.claude/autoharness` vznikají tam, kde zrovna stojí shell.** Uvnitř `public/` by se nasadily veřejně. Pracuj z kořene repozitáře s absolutními cestami a před commitem i nasazením spusť `find public docs src scripts -name .claude`.
- **`gh pr merge` do `main` blokuje klasifikátor oprávnění.** Sloučení dělá Patrick. Repozitář nemá automatické nasazování, sloučení samo nic nenasadí.
- **Nápověda OpenAI vrací pro `curl` 403.** Stránky `help.openai.com` čti přes nástroj pro načítání webu; stav odkazů v lekcích tak není ověřený přímým požadavkem.
- **Sanitizér lekcí** (`src/lib/markdown.ts`) propouští jen vyjmenované značky a atributy. Co lekce potřebuje navíc (dřív `ol start`), se musí přidat tam i do testu, jinak to z e-mailu tiše zmizí.
