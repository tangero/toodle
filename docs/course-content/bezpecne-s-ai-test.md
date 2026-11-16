# Bezpečně s AI v práci a ve škole - závěrečný test

Šest otázek s výběrem odpovědi (po 2 bodech) a jedna otevřená (6 bodů). Celkem 18 bodů, k úspěchu je potřeba 70 %, tedy 13 bodů. Samotné otázky s výběrem (12 bodů) na certifikát nestačí, čtenář musí získat aspoň 1 bod z otevřené.

Poznámky k zadání testu v adminu:

- Hodnotitel (LLM) vidí u otevřené otázky jen text otázky a odpověď. Kritéria jsou proto přímo v zadání jako „V odpovědi uveďte“.
- Odpověď se před hodnocením ořízne na 2 000 znaků.
- Správné odpovědi jsou rozložené: b, d, a, c, b, d.
- JSON níže odpovídá typu `TestQuestion` (`src/lib/types.ts`). Do databáze se test dostává skriptem `scripts/import-courses.mjs`, který JSON před importem zkontroluje (id, možnosti, správná odpověď, body).

## Otázky a zdůvodnění

1. **Co platí o dočasném chatu?** Správně b). Lekce 1.
2. **Jak dát AI e-mail se jmény a adresou?** Správně d). Anonymizace musí proběhnout před vložením. Lekce 2.
3. **Jak ověřit paragraf a název zákona?** Správně a). Lekce 3.
4. **Kdy může prompt injection způsobit škodu?** Správně c). Lekce 4.
5. **Kterou činnost má udělat člověk?** Správně b). Pravidlo čtyř sloves. Lekce 4.
6. **Přepsaná kapitola z cizí učebnice.** Správně d). Lekce 5.

## questions_json

```json
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "Co platí o dočasném (inkognito) chatu?",
    "options": [
      {
        "id": "a",
        "text": "Zpráva vůbec neopustí můj počítač, zpracuje se jen v prohlížeči."
      },
      {
        "id": "b",
        "text": "Neuloží se do historie a nepoužije se k tréninku, ale výrobce ho po omezenou dobu uchovává."
      },
      {
        "id": "c",
        "text": "Je určený pro hesla a rodná čísla, protože se hned po odeslání maže."
      },
      {
        "id": "d",
        "text": "Funguje stejně jako běžný chat, jen má jinou barvu."
      }
    ],
    "correct_option_id": "b",
    "max_points": 2
  },
  {
    "id": "q2",
    "type": "multiple_choice",
    "question": "Chcete, aby vám AI pomohla s odpovědí na e-mail, ve kterém jsou jména a adresa zákazníka. Jak postupovat?",
    "options": [
      {
        "id": "a",
        "text": "Vložit e-mail celý a připsat, ať AI jména a adresu v odpovědi nepoužije."
      },
      {
        "id": "b",
        "text": "Požádat AI, aby e-mail nejdřív sama anonymizovala, a pak pokračovat."
      },
      {
        "id": "c",
        "text": "Použít dočasný chat, protože tam se údaje k tréninku nepoužijí."
      },
      {
        "id": "d",
        "text": "Před vložením nahradit údaje kódy a klíč si nechat u sebe."
      }
    ],
    "correct_option_id": "d",
    "max_points": 2
  },
  {
    "id": "q3",
    "type": "multiple_choice",
    "question": "AI vám odpověděla s číslem paragrafu a názvem zákona. Jak zjistíte, jestli je to správně?",
    "options": [
      {
        "id": "a",
        "text": "Vyhledám zákon v oficiálním zdroji a paragraf si přečtu."
      },
      {
        "id": "b",
        "text": "Zeptám se AI, jestli si je odpovědí jistá."
      },
      {
        "id": "c",
        "text": "Položím stejnou otázku znovu a porovnám, jestli odpoví stejně."
      },
      {
        "id": "d",
        "text": "Poznám to podle toho, že odpověď zní odborně a je bez chyb."
      }
    ],
    "correct_option_id": "a",
    "max_points": 2
  },
  {
    "id": "q4",
    "type": "multiple_choice",
    "question": "Kdy může prompt injection způsobit skutečnou škodu?",
    "options": [
      {
        "id": "a",
        "text": "Když napíšu příliš dlouhé zadání a AI část pokynů přehlédne."
      },
      {
        "id": "b",
        "text": "Když mám vypnuté trénování modelů na svých konverzacích."
      },
      {
        "id": "c",
        "text": "Když AI čte obsah od někoho cizího a zároveň smí sama jednat."
      },
      {
        "id": "d",
        "text": "Když používám AI v mobilní aplikaci místo v prohlížeči."
      }
    ],
    "correct_option_id": "c",
    "max_points": 2
  },
  {
    "id": "q5",
    "type": "multiple_choice",
    "question": "Kterou činnost má vždy udělat člověk, ne AI sama?",
    "options": [
      {
        "id": "a",
        "text": "Navrhnout znění odpovědi zákazníkovi."
      },
      {
        "id": "b",
        "text": "Odeslat e-mail zákazníkovi."
      },
      {
        "id": "c",
        "text": "Shrnout dlouhé e-mailové vlákno."
      },
      {
        "id": "d",
        "text": "Připravit srovnání cen tří dodavatelů."
      }
    ],
    "correct_option_id": "b",
    "max_points": 2
  },
  {
    "id": "q6",
    "type": "multiple_choice",
    "question": "AI vám přepsala kapitolu z cizí učebnice jinými slovy. Co platí?",
    "options": [
      {
        "id": "a",
        "text": "Je to nový text, takže ho můžu volně šířit."
      },
      {
        "id": "b",
        "text": "Můžu ho šířit, když uvedu, že ho napsala AI."
      },
      {
        "id": "c",
        "text": "Můžu ho šířit, pokud za AI platím."
      },
      {
        "id": "d",
        "text": "Pořád vychází z cizího díla a k šíření potřebuji oprávnění."
      }
    ],
    "correct_option_id": "d",
    "max_points": 2
  },
  {
    "id": "q7",
    "type": "open_ended",
    "question": "Kolega vám řekne, že si chce ušetřit práci: nahraje do svého osobního účtu AI tabulku se jmény zaměstnanců a jejich platy a nechá si z ní udělat přehled pro vedení. Co mu poradíte? V odpovědi uveďte: proč je to problém (osobní údaje a osobní účet), jak by šlo úkol udělat bezpečněji (anonymizace nebo firemní účet), na koho se má obrátit kvůli pravidlům organizace a co má zkontrolovat ve výsledném přehledu, než ho odevzdá. Rozsah odpovědi do 1 500 znaků.",
    "max_points": 6
  }
]
```
