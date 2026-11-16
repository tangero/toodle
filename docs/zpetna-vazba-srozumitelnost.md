# Zpětná vazba na srozumitelnost lekcí

Zadání k implementaci. Schválený směr z 16. 11. 2026 (Patrick): otázka na srozumitelnost u každé lekce, okamžitá pomoc formou zadání pro AI, přepis lekce až po schválení člověkem.

## Proč

Lekce vznikají s pomocí AI a nikdo zatím neví, kterým pasážím čtenáři nerozumějí. Potřebujeme to zjistit přímo od nich, s co nejmenší námahou, a výsledek automaticky vyhodnocovat.

## Co čtenář uvidí

Tři odpovědi, vždy ve stejném pořadí a stejně výrazné:

1. Rozuměl jsem
2. Něco mi nesedělo
3. Nerozuměl jsem, potřebuji to vysvětlit lépe

### Kurzy na potvrzení (`on_click`)

- Na stránce `/profil/kurz/[id]` nahradí tlačítko „Mám přečteno“ tři tlačítka: „Rozuměl jsem, pošlete další“, „Něco mi nesedělo, pošlete další“, „Nerozuměl jsem, potřebuji to vysvětlit lépe“.
- Jedno kliknutí zapíše odpověď a odešle další lekci. Odpověď postup nikdy neblokuje.
- U poslední lekce vedou stejná tlačítka na závěrečný test.

### Kurzy doručované každý pracovní den (`next_workday`)

- Pod lekcí v e-mailu je řádek „Jak srozumitelná byla dnešní lekce?“ se třemi odkazy.
- Odkaz otevře stránku `/srozumitelnost/[token]`. GET jen zobrazí volbu, zapíše až POST z tlačítka (skenery pošty odkazy otevírají samy).

### Po odpovědi 2 nebo 3

Stránka poděkuje a nabídne dobrovolné upřesnění:

- seznam částí lekce k zaškrtnutí (generuje se z nadpisů `<h3>` v těle lekce, víc voleb najednou),
- pole na jednu větu (nejvýš 500 znaků).

Po odpovědi 3 navíc **okamžitá pomoc**: zadání ke zkopírování do ChatGPT nebo Claude s tlačítkem „Zkopírovat“:

> Vysvětli mi jednodušeji tuto část lekce. Piš jako pro úplného začátečníka, použij jeden příklad z běžného života a na konci mi polož jednu otázku, kterou si ověřím, že tomu rozumím. Část lekce: „…“

Do zadání se vloží text vybrané části (bez značek). Dokud čtenář část nevybere, vloží se název lekce a výzva, ať část zkopíruje sám. Pod zadáním věta: „Když tuhle lekci přepíšeme, pošleme vám novou verzi.“

## Data

- `lessons.version INTEGER NOT NULL DEFAULT 1`. Importní skript číslo zvýší, když se změní tělo lekce.
- Tabulka `lesson_feedback`: `id`, `enrollment_id`, `lesson_id`, `lesson_version`, `answer` (1–3), `sections_json` (pořadová čísla a názvy označených částí), `comment`, `created_at`, `updated_at`, `resent_version` (verze, kterou jsme čtenáři poslali po přepisu, jinak NULL). UNIQUE (`enrollment_id`, `lesson_id`): nová odpověď starou přepíše.
- Mazání účtu a GDPR export tabulku zahrnou.
- Token do e-mailu: čtvrtý účel v `src/lib/unsubscribe.ts`, `feedback:<id zápisu>:<id lekce>`. Podepisuje se stálé id lekce, ne pozice: mazání lekce v adminu pozice přečísluje a starý odkaz by hodnotil jinou lekci.
- Odpověď patří verzi, kterou čtenář dostal: při odeslání lekce se verze zapíše do `email_log.lesson_version` a odpověď i upřesnění se ukládají k ní. Starší znění lekce se neuchovává, takže když se text od odeslání změnil, stránka nenabízí výběr částí ani zadání s textem části, jen připomínku.

## Vyhodnocení

- Admin stránka `/admin/srozumitelnost`: pro každý kurz a lekci počet odpovědí, podíl odpovědí 2 a 3, nejčastěji označené části a připomínky. Vedle toho dva signály, které už máme: na které lekci čtenáři kurz opouštějí a u `on_click` medián času mezi odesláním lekce a potvrzením.
- Kurzy `on_click` a `next_workday` se vyhodnocují zvlášť. U prvních odpovídá skoro každý, u druhých jen ti, kdo se rozhodnou kliknout.
- Lekce nebo část se označí „k přepisu“, když má dost odpovědí a podíl odpovědi 3 překročí práh. Výchozí návrh: aspoň 20 odpovědí a 15 % u `on_click`, aspoň 10 odpovědí a 30 % u `next_workday`. Prahy jsou konstanty na jednom místě a po prvních týdnech se upraví podle skutečných čísel.

## Přepis lekce

1. Týdenní cron sestaví pro označené pasáže podklad: text části, připomínky čtenářů (bez jména a e-mailu) a čísla.
2. Jazykový model (OpenRouter, stejně jako hodnocení testů) navrhne jednodušší znění. Fakta, čísla, názvy tlačítek a zadání pro AI nesmí změnit.
3. Návrh se uloží do adminu k posouzení. Nic se nenasazuje samo. Schválený text se zapíše do souboru lekce v `docs/course-content/` a jde běžným importem, čímž vznikne nová verze.
4. Čtenáři, kteří lekci označili odpovědí 3 u starší verze, dostanou jednou novou verzi s větou, co se změnilo (`resent_version`). Zámek, idempotentní klíč a logování jako u běžné lekce. Kdo má odhlášený kurz, nedostane nic.
5. U nové verze se srozumitelnost měří znovu a admin ukáže srovnání před a po.

## Soukromí

- Připomínky jsou volný text. Do modelu jde jen text připomínky, název a text části, nikdy jméno ani e-mail.
- Zásady zpracování osobních údajů (`src/pages/ochrana-osobnich-udaju.astro`) doplnit o zpětnou vazbu k lekcím a její zpracování jazykovým modelem.

## Mimo rozsah první verze

- Odpověď na lekci e-mailem zpracovaná z příchozí pošty v Resendu. Schránka existuje, třídění zpráv modelem přijde později.
- Automatické vysvětlení psané naším modelem a poslané čtenáři. Byl by to další neověřený text od AI.
- Podepsaný odkaz, který u `on_click` potvrdí přečtení bez přihlášení.

## Otevřená rozhodnutí

- Prahy pro označení lekce k přepisu (výchozí návrh výše).
- Jestli se má otázka ptát i u lekcí kurzu Začínáme s ChatGPT od prvního dne, nebo až od druhé lekce, aby první e-mail nebyl zahlcený.
