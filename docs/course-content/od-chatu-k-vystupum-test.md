# Od chatu k hotovým výstupům - závěrečný test

Sedm otázek s výběrem odpovědi (po 2 bodech) a dvě otevřené (po 5 bodech). Celkem 24 bodů, k úspěchu je potřeba 70 %, tedy 17 bodů. Samotné otázky s výběrem (14 bodů) na certifikát nestačí, čtenář musí získat aspoň 3 body z otevřených.

Poznámky k zadání testu v adminu:

- Hodnotitel (LLM) vidí u otevřené otázky **jen text otázky a odpověď**. Kritéria proto musí být přímo v zadání otázky. Jsou tam jako „V odpovědi uveďte“.
- Odpověď se před hodnocením ořízne na 2 000 znaků. V zadání je proto doporučený rozsah.
- Správné odpovědi jsou rozložené: a, c, b, d, b, c, a.
- JSON níže odpovídá typu `TestQuestion` (`src/lib/types.ts`). Do databáze se test dostává skriptem `scripts/import-courses.mjs`, který JSON před importem zkontroluje (id, možnosti, správná odpověď, body).

## Otázky a zdůvodnění

1. **Kdy se vyplatí založit projekt místo dalšího chatu?** Správně a). Lekce 2.
2. **Shrnutí zprávy uvádí výdaje 145 mld. Kč, zpráva má ve sloupci Skutečnost 124 mld. Kč. Co se nejspíš stalo?** Správně c). Lekce 3.
3. **Proč je u dokumentu lepší upravit jeden odstavec než nechat přepsat celý text?** Správně b). Lekce 4.
4. **Jak poznáte, že AI součet z tabulky spočítala a neodhadla?** Správně d). Lekce 6.
5. **Rešerše u tvrzení uvádí odkaz. Co to znamená?** Správně b). Lekce 8.
6. **Co je prompt injection?** Správně c). Lekce 9.
7. **Která část v zadání úlohy pro agenta chybí nejčastěji a proč vadí?** Správně a). Lekce 10.

## questions_json

```json
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "Kdy se vyplatí založit projekt místo dalšího samostatného chatu?",
    "options": [
      {
        "id": "a",
        "text": "Když se k tématu budu vracet a nechci pokaždé znovu nahrávat podklady a vysvětlovat, pro koho píšu."
      },
      {
        "id": "b",
        "text": "Když chci, aby AI odpovídala rychleji, protože v projektu má podklady připravené předem."
      },
      {
        "id": "c",
        "text": "Když potřebuji, aby AI hledala informace na webu."
      },
      {
        "id": "d",
        "text": "Když mám jednu rychlou otázku a odpověď už dál nepoužiju."
      }
    ],
    "correct_option_id": "a",
    "max_points": 2
  },
  {
    "id": "q2",
    "type": "multiple_choice",
    "question": "Shrnutí zprávy o rozpočtu uvádí výdaje 145 mld. Kč. Ve zprávě je ve sloupci Skutečnost 124 mld. Kč a ve sloupci Rozpočet upravený 145 mld. Kč. Co se nejspíš stalo?",
    "options": [
      {
        "id": "a",
        "text": "AI při převodu z tisíců Kč na miliardy posunula desetinnou čárku."
      },
      {
        "id": "b",
        "text": "AI použila novější údaj z webu města místo údaje ze zprávy."
      },
      {
        "id": "c",
        "text": "AI vzala číslo ze sloupce plánu místo ze sloupce skutečnosti."
      },
      {
        "id": "d",
        "text": "AI sečetla výdaje Prahy a výdaje městských částí dvakrát."
      }
    ],
    "correct_option_id": "c",
    "max_points": 2
  },
  {
    "id": "q3",
    "type": "multiple_choice",
    "question": "Proč je u hotového dokumentu lepší nechat upravit jeden označený odstavec než přepsat celý text?",
    "options": [
      {
        "id": "a",
        "text": "Protože přepsání celého textu trvá déle a spotřebuje víc z limitu tarifu."
      },
      {
        "id": "b",
        "text": "Protože se při přepsání celku můžou nenápadně změnit i už ověřená čísla."
      },
      {
        "id": "c",
        "text": "Protože po přepsání celého textu se ztratí historie verzí a nejde se vrátit zpět."
      },
      {
        "id": "d",
        "text": "Protože přepsaný dokument už nejde sdílet stejným odkazem."
      }
    ],
    "correct_option_id": "b",
    "max_points": 2
  },
  {
    "id": "q4",
    "type": "multiple_choice",
    "question": "AI vám vrátila součet výdajů z tabulky s tisíci řádků. Jak nejlépe ověříte, že ho spočítala a neodhadla?",
    "options": [
      {
        "id": "a",
        "text": "Zeptám se jí, jestli si je výsledkem jistá."
      },
      {
        "id": "b",
        "text": "Zadám stejnou otázku znovu v novém chatu a porovnám obě čísla."
      },
      {
        "id": "c",
        "text": "Zkontroluji, že výsledek je v miliardách a má rozumný řád."
      },
      {
        "id": "d",
        "text": "Nechám si ukázat postup a jeden součet ověřím proti souboru."
      }
    ],
    "correct_option_id": "d",
    "max_points": 2
  },
  {
    "id": "q5",
    "type": "multiple_choice",
    "question": "Hloubková rešerše uvádí u tvrzení odkaz na zdroj. Co z toho plyne?",
    "options": [
      {
        "id": "a",
        "text": "Tvrzení je ověřené, protože rešerše zdroj při práci sama otevřela a přečetla."
      },
      {
        "id": "b",
        "text": "Zatím nic. Zdroj musím otevřít a tvrzení v něm najít ve stejném významu."
      },
      {
        "id": "c",
        "text": "Zdroj je primární, protože zadání primární zdroje požadovalo."
      },
      {
        "id": "d",
        "text": "Tvrzení stačí ověřit, jen když jde o číslo."
      }
    ],
    "correct_option_id": "b",
    "max_points": 2
  },
  {
    "id": "q6",
    "type": "multiple_choice",
    "question": "Co je prompt injection?",
    "options": [
      {
        "id": "a",
        "text": "Dlouhé zadání, kvůli kterému AI přehlédne část pokynů."
      },
      {
        "id": "b",
        "text": "Chyba, při které AI v dlouhém chatu zapomene pokyny ze začátku."
      },
      {
        "id": "c",
        "text": "Pokyny pro AI schované v obsahu, který čte, třeba v e-mailu nebo na webu."
      },
      {
        "id": "d",
        "text": "Pokus uživatele obejít pravidla AI šikovně napsaným zadáním."
      }
    ],
    "correct_option_id": "c",
    "max_points": 2
  },
  {
    "id": "q7",
    "type": "multiple_choice",
    "question": "Která část v zadání úlohy pro agenta chybí nejčastěji a proč to vadí?",
    "options": [
      {
        "id": "a",
        "text": "Kritérium „hotovo“. Bez něj agent neví, kdy je práce dokončená."
      },
      {
        "id": "b",
        "text": "Cíl. Bez něj agent odmítne úlohu začít."
      },
      {
        "id": "c",
        "text": "Podklady. Bez nich agent úlohu vůbec nepřijme a místo práce vrátí chybu."
      },
      {
        "id": "d",
        "text": "Formát výstupu. Bez něj agent nevytvoří žádný soubor."
      }
    ],
    "correct_option_id": "a",
    "max_points": 2
  },
  {
    "id": "q8",
    "type": "open_ended",
    "question": "Máte 40stránkovou výroční zprávu v PDF plnou tabulek. Napište zadání (prompt), kterým necháte AI udělat shrnutí tak, aby se dalo ověřit. V odpovědi uveďte: pro jakého čtenáře shrnutí je, jaký má mít rozsah a obsah, jak má AI uvádět zdroje čísel (strany), jedno pravidlo proti typické chybě v číslech (sloupec, jednotka nebo rok) a požadovaný formát. Rozsah odpovědi do 1 500 znaků.",
    "max_points": 5
  },
  {
    "id": "q9",
    "type": "open_ended",
    "question": "AI vám z dokumentu připravila prezentaci, kterou máte zítra ukázat vedení nebo rodičům. Popište, co zkontrolujete, než ji ukážete. V odpovědi uveďte aspoň čtyři konkrétní kontroly a u každé napište, jak ji provedete. Měly by mezi nimi být: čísla proti zdroji, zdroje tvrzení, jména nebo citlivé údaje a stažený soubor či tón. Rozsah odpovědi do 1 500 znaků.",
    "max_points": 5
  }
]
```
