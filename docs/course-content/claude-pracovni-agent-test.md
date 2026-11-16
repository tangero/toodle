# Claude jako pracovní agent - závěrečný test

Sedm otázek s výběrem odpovědi (po 2 bodech) a dvě otevřené (po 5 bodech). Celkem 24 bodů, k úspěchu je potřeba 70 %, tedy 17 bodů. Samotné otázky s výběrem (14 bodů) na certifikát nestačí.

Poznámky k zadání testu v adminu:

- Hodnotitel (LLM) vidí u otevřené otázky **jen text otázky a odpověď**. Kritéria jsou proto přímo v zadání jako „V odpovědi uveď“.
- Odpověď se před hodnocením ořízne na 2 000 znaků.
- Správné odpovědi jsou rozložené: c, a, d, b, a, d, b.
- JSON níže odpovídá typu `TestQuestion` (`src/lib/types.ts`). Do databáze se test dostává skriptem `scripts/import-courses.mjs`, který JSON před importem zkontroluje (id, možnosti, správná odpověď, body).

## Otázky a zdůvodnění

1. **Čím se úloha pro agenta liší od otázky v chatu?** Správně c). Lekce 1.
2. **Proč se soubory pracovat na kopii?** Správně a). Lekce 3.
3. **Co má agent udělat s duplicitními soubory?** Správně d). Lekce 3.
4. **Po sloučení tří tabulek má výsledek o 40 řádků méně než zdroje dohromady. Co uděláš?** Správně b). Lekce 4.
5. **Kdy může prompt injection způsobit škodu?** Správně a). Lekce 8.
6. **Co agent nemá dělat sám?** Správně d). Lekce 8.
7. **Kterou úlohu neplánovat k samostatnému spouštění?** Správně b), protože odesílá bez kontroly člověka. Lekce 8 a 9.

## questions_json

```json
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "Čím se úloha pro agenta liší od otázky v chatu?",
    "options": [
      {
        "id": "a",
        "text": "Úloha se zadává v desktopové aplikaci, otázka na webu."
      },
      {
        "id": "b",
        "text": "Na úlohu agent odpovídá delším textem než na otázku."
      },
      {
        "id": "c",
        "text": "Agent si práci sám rozplánuje, používá nástroje a vrací hotový výsledek."
      },
      {
        "id": "d",
        "text": "Úloha se na rozdíl od otázky v chatu vůbec nezapočítává do limitu tarifu."
      }
    ],
    "correct_option_id": "c",
    "max_points": 2
  },
  {
    "id": "q2",
    "type": "multiple_choice",
    "question": "Proč má agent se soubory pracovat na kopii složky, a ne na originálu?",
    "options": [
      {
        "id": "a",
        "text": "Aby šlo při chybě kopii smazat a začít znovu, aniž by se o něco přišlo."
      },
      {
        "id": "b",
        "text": "Protože kopii agent zpracuje rychleji než původní složku."
      },
      {
        "id": "c",
        "text": "Protože k originálním souborům agent nemá oprávnění."
      },
      {
        "id": "d",
        "text": "Aby měl agent data dvakrát a mohl je porovnat."
      }
    ],
    "correct_option_id": "a",
    "max_points": 2
  },
  {
    "id": "q3",
    "type": "multiple_choice",
    "question": "Agent při úklidu složky našel dva soubory se stejným obsahem. Co s nimi má podle dobrého briefu udělat?",
    "options": [
      {
        "id": "a",
        "text": "Starší z nich smazat a novější ponechat."
      },
      {
        "id": "b",
        "text": "Oba ponechat na místě a pokračovat v úklidu."
      },
      {
        "id": "c",
        "text": "Sloučit je do jednoho souboru s novým názvem a původní odstranit."
      },
      {
        "id": "d",
        "text": "Jeden přesunout stranou, nic nemazat a zapsat to do soupisu."
      }
    ],
    "correct_option_id": "d",
    "max_points": 2
  },
  {
    "id": "q4",
    "type": "multiple_choice",
    "question": "Po sloučení tří tabulek má výsledná tabulka o 40 řádků méně, než kolik měly zdroje dohromady. Co uděláš?",
    "options": [
      {
        "id": "a",
        "text": "Výsledek použiju, 40 řádků z několika tisíc závěry nezmění."
      },
      {
        "id": "b",
        "text": "Výsledek nepoužiju, dokud agent nenajde příčinu rozdílu."
      },
      {
        "id": "c",
        "text": "Požádám agenta, aby chybějící řádky dopočítal z ostatních."
      },
      {
        "id": "d",
        "text": "Sloučím tabulky znovu a vezmu tu verzi, která má víc řádků."
      }
    ],
    "correct_option_id": "b",
    "max_points": 2
  },
  {
    "id": "q5",
    "type": "multiple_choice",
    "question": "Kdy může prompt injection způsobit skutečnou škodu?",
    "options": [
      {
        "id": "a",
        "text": "Když agent čte obsah, kterému nelze věřit, a zároveň smí sám udělat něco s následky."
      },
      {
        "id": "b",
        "text": "Když agent pracuje s velkými tabulkami a nestihne je celé přečíst."
      },
      {
        "id": "c",
        "text": "Když je brief příliš dlouhý a agent část pokynů přehlédne."
      },
      {
        "id": "d",
        "text": "Když agent pracuje se soubory, ke kterým nemá povolené úpravy."
      }
    ],
    "correct_option_id": "a",
    "max_points": 2
  },
  {
    "id": "q6",
    "type": "multiple_choice",
    "question": "Kterou čtveřici činností nemá agent dělat sám, bez tvého potvrzení?",
    "options": [
      {
        "id": "a",
        "text": "Číst, počítat, shrnovat, překládat."
      },
      {
        "id": "b",
        "text": "Plánovat, ptát se, navrhovat, kontrolovat."
      },
      {
        "id": "c",
        "text": "Přejmenovávat, třídit, sepisovat, kopírovat."
      },
      {
        "id": "d",
        "text": "Odesílat, platit, mazat, zveřejňovat."
      }
    ],
    "correct_option_id": "d",
    "max_points": 2
  },
  {
    "id": "q7",
    "type": "multiple_choice",
    "question": "Kterou z těchto úloh bys NEMĚL/A naplánovat k pravidelnému samostatnému spouštění?",
    "options": [
      {
        "id": "a",
        "text": "Týdenní přehled novinek z webů, které sleduji."
      },
      {
        "id": "b",
        "text": "Odesílání odpovědí zákazníkům na nové e-maily."
      },
      {
        "id": "c",
        "text": "Pondělní souhrn mého kalendáře na další týden."
      },
      {
        "id": "d",
        "text": "Měsíční přehled nových dokumentů na webu úřadu."
      }
    ],
    "correct_option_id": "b",
    "max_points": 2
  },
  {
    "id": "q8",
    "type": "open_ended",
    "question": "Ve složce máš pět tabulek s rozpočtem obce za pět let (CSV). Napiš brief pro agenta, který z nich udělá jednu souhrnnou tabulku v Excelu s grafem. V odpovědi uveď všech pět částí briefu: cíl, podklady, výstup (formát a kam uložit), kritérium hotovo (které se dá zkontrolovat, například kontrolní součty) a omezení (například neměnit originály, nic nemazat). Rozsah odpovědi do 1 500 znaků.",
    "max_points": 5
  },
  {
    "id": "q9",
    "type": "open_ended",
    "question": "Agent ti z podkladů ve složce připravil report pro vedení. Popiš, jak ho zkontroluješ, než ho odešleš. V odpovědi uveď aspoň čtyři konkrétní kontroly a u každé napiš, jak ji provedeš. Měly by mezi nimi být: ověření čísel proti zdroji, stopa tvrzení ke zdrojům, osobní nebo citlivé údaje a nevyžádané změny souborů ve složce. Rozsah odpovědi do 1 500 znaků.",
    "max_points": 5
  }
]
```
