# Pravidla psaní lekcí Školy AI

Platí pro všechny kurzy od 16. 11. 2026. Tam, kde se liší od `zaciname-s-chatgpt-course-plan.md`, má přednost tento soubor.

## Značka a podpis

- Web a kurzy se jmenují **Škola AI**. Výraz „Letní škola AI“ se nepoužívá nikde.
- První kurz se jmenuje **Začínáme s ChatGPT**. Ostatní: Od chatu k hotovým výstupům, Claude jako pracovní agent, Bezpečně s AI v práci a ve škole.
- Podpis na konci každé lekce je přesně:

```html
<p>— <strong>Tým Školy AI</strong><br>Patrick a Andrea</p>
```

## Oslovení

- Čtenáři **vykáme**: „otevřete“, „vyzkoušejte si“, „váš dokument“, „vítejte“.
- V minulém čase používáme zdvořilé množné číslo bez lomítek: „zkontrolovali jste“, „vložili jste“, „rozhodněte sami“. Tvary jako „zkontroloval/a“ nebo „sám/sama“ v textu pro čtenáře nezůstávají.
- **Zadání pro AI (prompty) zůstávají v tykání**, protože je čtenář zadává nástroji: „Shrň…“, „Napiš mi…“. Uvnitř promptu se nic nepřepisuje, pokud v něm není lomítkový tvar o uživateli. Ten přepište neutrálně („jak ses k tomu dostal“ je v pořádku, mluví se k AI).
- Vzorové texty, které si čtenář kopíruje do vlastního dokumentu v první osobě („Do AI nevkládám…“), zůstávají v první osobě. Lomítkové tvary v nich nahraďte neutrální formulací.
- Vykání platí i pro metadata: Název, Předmět e-mailu, Preheader.

## Tón a forma

- Praktický a střízlivý. Krátké věty, konkrétní kroky, žádné superlativy.
- **Bez emoji.** Číslované nadpisy pište „1. Název“, ostatní nadpisy bez symbolu („Dnešní úkol“, „Pro vaši práci“, „Kontrola“, „Co si z dneška odnést“). Tlačítko ke stažení začíná slovem „Stáhnout“.
- Pomlčka je krátká s mezerami ( – ). V podpisu zůstává dlouhá, jak je ve vzoru výše.
- Kurzy doručované každý pracovní den začínají „Dobré ráno“ a končí můstkem „Zítra…“. Kurz doručovaný vlastním tempem (Claude jako pracovní agent) tyto obraty nepoužívá.
- Blok „Pro vaši práci“ má tři varianty: Kancelář, Učitelé, Živnostníci.

## Formát souboru (nesmí se změnit, čte ho importní skript)

- `# Název kurzu - Lekce N`
- `## Metadata` s odrážkami `- Kurz:`, `- Lekce:`, `- Název:`, `- Předmět e-mailu:`, `- Preheader:`, `- Délka čtení: N minut` a poznámkami o ověření faktů.
- `## Tělo e-mailu` a v něm jeden blok ```` ```html ````.
- V HTML jen značky `p`, `h3`, `strong`, `em`, `ul`, `ol`, `li`, `a`, `br`. Nadpisy jsou `<h3><strong>…</strong></h3>`. Odkazy mají `target="_blank" rel="noopener noreferrer nofollow"`.
- Test: soubor `<prefix>-test.md` s blokem ```` ```json ```` pod nadpisem `## questions_json`. Pole `id`, `type`, `options[].id`, `correct_option_id` a `max_points` se nemění.
- Karta kurzu: `<prefix>-course.md` se sekcemi Metadata, Popis, Uvítací e-mail, Závěrečný e-mail.

## Fakta

- Fakta, čísla, kontrolní hodnoty, odkazy a názvy tlačítek v nástrojích se při jazykové úpravě nemění.
- Tvrzení o funkcích a tarifech ChatGPT a Claude se opírají o stránky výrobce (help.openai.com, support.claude.com, privacy.claude.com). Číselné limity se neuvádějí. V metadatech lekce je datum ověření a zdroj.
- Co se nepodařilo ověřit u výrobce, do těla lekce nepatří jako jistota. Zapište to do metadat jako „Ověřit před publikací: …“.
- Právní tvrzení o osobních údajích, smlouvách a obchodním tajemství se opírají o článek https://www.marigold.cz/item/smlouvy-ai-gdpr/ (ověřený právníkem). Lekce nejsou právní rada a říkají to.

## Kontrola před odevzdáním

```bash
node scripts/import-courses.mjs <prefix> --out <cesta mimo repozitář>
```

Skript ověří formát lekcí, karty i testu. Do databáze nic nezapisuje.
