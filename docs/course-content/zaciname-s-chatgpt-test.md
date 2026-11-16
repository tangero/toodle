# Začínáme s ChatGPT - závěrečný test

Sedm otázek s výběrem odpovědi (po 2 bodech) a dvě otevřené (po 5 bodech). Celkem 24 bodů, k úspěchu je potřeba 70 %, tedy 17 bodů. Samotné otázky s výběrem (14 bodů) na certifikát nestačí, čtenář musí získat aspoň 3 body z otevřených otázek.

Poznámky k zadání testu v adminu:

- Hodnotitel (LLM) vidí u otevřených otázek jen text otázky a odpověď. Kritéria jsou proto přímo v zadání jako „V odpovědi uveďte“.
- Odpověď se před hodnocením ořízne na 2 000 znaků, zadání proto žádají rozsah do 1 500 znaků.
- Správné odpovědi jsou rozložené: b, d, a, c, d, a, c.
- Otázky k lekcím 7 až 11 se ptají na zásady z osnovy kurzu, ne na konkrétní formulace lekcí. Po dopsání lekcí 7 a 10 je vhodné otázky 4 a 5 s textem lekcí porovnat.
- JSON níže odpovídá typu `TestQuestion` (`src/lib/types.ts`). Do databáze se test dostává skriptem `scripts/import-courses.mjs`, který JSON před importem zkontroluje (id, možnosti, správná odpověď, body).

## Otázky a zdůvodnění

1. **Co nejvíc pomůže, aby první odpověď byla použitelná?** Správně b). Úkol, příjemce a podoba výstupu. Lekce 2 a 4.
2. **Jak postupovat při úplné změně tématu?** Správně d). Nový chat. Lekce 3.
3. **Kterou informaci do ChatGPT nevkládat?** Správně a). Přihlašovací údaje. Lekce 5 (a 6).
4. **Jak zadat větší úkol?** Správně c). Rozdělit na kroky. Lekce 7.
5. **Jak ověřit důležité tvrzení se zdrojem?** Správně d). Otevřít zdroj a přečíst. Lekce 10 (a 5).
6. **Jak rozumně zkontrolovat výpočty z tabulky?** Správně a). Přepočítat aspoň jedno číslo z původních dat. Lekce 12.
7. **Které zadání obrázku odpovídá pravidlům kurzu?** Správně c). Lekce 14 a 15.
8. **Otevřená: prompt pro e-mail a navazující prompt.** Lekce 2, 3, 4 a 9. Body: úkol a příjemce (1), tón a formát nebo délka (1), prompt bez skutečných osobních údajů (1), smysluplný navazující prompt (1), co zkontrolovat před odesláním (1).
9. **Otevřená: vlastní pracovní postup.** Lekce 5, 10, 12, 13 a 15. Body: konkrétní opakovaný úkol (1), co do ChatGPT nevkládat (1), postup zadání se šablonou nebo navazujícím promptem (1), konkrétní způsob kontroly (1), případ, kdy výstup nepoužít bez dalšího ověření nebo bez odborníka (1).

## questions_json

```json
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "Chcete, aby vám ChatGPT napsal text, který půjde rovnou použít. Co do zadání doplnit, aby se to nejspíš povedlo napoprvé?",
    "options": [
      {
        "id": "a",
        "text": "Zdvořilé oslovení a poděkování, protože na slušné zadání odpovídá přesněji."
      },
      {
        "id": "b",
        "text": "Co přesně má udělat, pro koho text je a jak má výsledek vypadat."
      },
      {
        "id": "c",
        "text": "Co nejvíc odborných výrazů, aby poznal, že tématu rozumíte."
      },
      {
        "id": "d",
        "text": "Stejnou otázku dvakrát za sebou, aby jí věnoval větší pozornost."
      }
    ],
    "correct_option_id": "b",
    "max_points": 2
  },
  {
    "id": "q2",
    "type": "multiple_choice",
    "question": "Hodinu jste s ChatGPT ladili jídelníček na příští týden. Teď potřebujete pomoci s reklamací pračky. Jak je nejlepší postupovat?",
    "options": [
      {
        "id": "a",
        "text": "Pokračovat ve stejném chatu, aby ChatGPT věděl co nejvíc o mé domácnosti."
      },
      {
        "id": "b",
        "text": "Smazat celou historii konverzací, jinak se témata budou plést."
      },
      {
        "id": "c",
        "text": "Napsat do stejného chatu, ať všechno předchozí zapomene, a pokračovat."
      },
      {
        "id": "d",
        "text": "Otevřít nový chat, protože jde o jiné téma."
      }
    ],
    "correct_option_id": "d",
    "max_points": 2
  },
  {
    "id": "q3",
    "type": "multiple_choice",
    "question": "Kterou z těchto informací do ChatGPT nevkládat?",
    "options": [
      {
        "id": "a",
        "text": "Přihlašovací jméno a heslo k internetovému bankovnictví."
      },
      {
        "id": "b",
        "text": "Recept na bábovku, který chci přepočítat na menší formu."
      },
      {
        "id": "c",
        "text": "Vlastní koncept příspěvku na sociální sítě."
      },
      {
        "id": "d",
        "text": "Otázku, jak se liší nájemní a podnájemní smlouva."
      }
    ],
    "correct_option_id": "a",
    "max_points": 2
  },
  {
    "id": "q4",
    "type": "multiple_choice",
    "question": "Potřebujete s ChatGPT připravit větší věc, například program třídenní firemní akce. Jaký postup dává nejlepší výsledky?",
    "options": [
      {
        "id": "a",
        "text": "Napsat jedno co nejdelší zadání se všemi požadavky a první odpověď použít."
      },
      {
        "id": "b",
        "text": "Poslat totéž zadání do pěti různých chatů a vybrat nejdelší odpověď."
      },
      {
        "id": "c",
        "text": "Rozdělit práci na kroky: nejdřív plán, potom návrh, úpravy a nakonec kontrola."
      },
      {
        "id": "d",
        "text": "Nechat ChatGPT, ať si požadavky domyslí, a výsledek neupravovat."
      }
    ],
    "correct_option_id": "c",
    "max_points": 2
  },
  {
    "id": "q5",
    "type": "multiple_choice",
    "question": "ChatGPT vám odpověděl s konkrétním údajem a přidal odkaz na zdroj. Údaj chcete použít v pracovní zprávě. Co udělat?",
    "options": [
      {
        "id": "a",
        "text": "Použít ho, odpověď s odkazem je ověřená."
      },
      {
        "id": "b",
        "text": "Zeptat se ChatGPT, jestli si je údajem jistý, a když potvrdí, použít ho."
      },
      {
        "id": "c",
        "text": "Položit stejnou otázku znovu a použít údaj, pokud vyjde stejně."
      },
      {
        "id": "d",
        "text": "Otevřít uvedený zdroj a přečíst si, jestli v něm údaj opravdu je."
      }
    ],
    "correct_option_id": "d",
    "max_points": 2
  },
  {
    "id": "q6",
    "type": "multiple_choice",
    "question": "ChatGPT vám z tabulky tržeb spočítal součet, průměr a rozdíl mezi dvěma měsíci. Jaká kontrola je rozumné minimum?",
    "options": [
      {
        "id": "a",
        "text": "Aspoň jedno z čísel si přepočítat z původní tabulky, třeba na kalkulačce."
      },
      {
        "id": "b",
        "text": "Požádat ho, ať výpočty zopakuje, a porovnat obě jeho odpovědi."
      },
      {
        "id": "c",
        "text": "Zkontrolovat, že u výpočtů ukázal postup. Když ano, čísla sedí."
      },
      {
        "id": "d",
        "text": "Nechat si vytvořit graf a zkontrolovat, že vypadá věrohodně."
      }
    ],
    "correct_option_id": "a",
    "max_points": 2
  },
  {
    "id": "q7",
    "type": "multiple_choice",
    "question": "Které zadání obrázku odpovídá pravidlům, která jste se v kurzu naučili?",
    "options": [
      {
        "id": "a",
        "text": "Realistická fotografie našeho starosty, jak přestřihává pásku na novém hřišti."
      },
      {
        "id": "b",
        "text": "Plakát přesně ve stylu známé současné ilustrátorky, kterou v zadání jmenuji."
      },
      {
        "id": "c",
        "text": "Akvarelová ilustrace stolu pod stromem na pozvánku, bez lidí a bez log."
      },
      {
        "id": "d",
        "text": "Fotografie zaplavené ulice v naší obci k příspěvku o počasí, bez poznámky, že ji vytvořila AI."
      }
    ],
    "correct_option_id": "c",
    "max_points": 2
  },
  {
    "id": "q8",
    "type": "open_ended",
    "question": "Potřebujete napsat e-mail, ve kterém slušně odmítnete pozvání na akci a navrhnete jiný termín setkání. Napište prompt, který byste zadali ChatGPT, a jeden navazující prompt, kterým byste první návrh upravili. V odpovědi uveďte: prompt, ze kterého je jasné, co má ChatGPT udělat a komu je e-mail určen; požadovaný tón a délku nebo formát; prompt bez skutečných jmen a dalších osobních údajů; jeden navazující prompt, který výsledek smysluplně upraví; a co si v hotovém e-mailu zkontrolujete, než ho odešlete. Rozsah odpovědi do 1 500 znaků.",
    "max_points": 5
  },
  {
    "id": "q9",
    "type": "open_ended",
    "question": "Popište svůj vlastní krátký postup pro jeden úkol, se kterým vám může ChatGPT opakovaně pomáhat (například odpovědi na e-maily, shrnutí dlouhých textů nebo plánování). V odpovědi uveďte: o jaký úkol jde; které informace do ChatGPT při tomto úkolu nevložíte; jak zadání stavíte (šablona, navazující prompty nebo uložené instrukce); jak konkrétně výsledek zkontrolujete, než ho použijete; a jeden příklad situace, kdy byste výstup bez dalšího ověření nebo bez porady s odborníkem nepoužili. Rozsah odpovědi do 1 500 znaků.",
    "max_points": 5
  }
]
```
