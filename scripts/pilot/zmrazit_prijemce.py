#!/usr/bin/env python3
"""
Zmrazí příjemce pilotní pozvánky: 100 nejstarších ověřených účtů v D1.

Vynechá účty, které ve staré aplikaci nebyly aktivní nebo patřily adminům (import tyto
příznaky nepřenesl, proto se berou ze starých dat), dál adresu ADMIN_EMAIL, smazané účty
a účty s odhlášenými nabídkami. Výstup obsahuje e-maily vynechaných účtů, patří proto do
data-ze-stare/ (je v .gitignore), nikdy do repa. Seznam se vkládá jen jednou
(INSERT OR IGNORE), další spuštění nikoho nepřidá, dokud v kampani někdo je.

Použití:
  python3 scripts/pilot/zmrazit_prijemce.py data-ze-stare/users.json <ADMIN_EMAIL> > data-ze-stare/pilot-prijemci.sql
  npx wrangler d1 execute skola-ai-db --remote --file data-ze-stare/pilot-prijemci.sql
"""
import json, sys

CAMPAIGN = 'pilot-2026-11'
LIMIT = 100


def q(v: str) -> str:
    return "'" + v.replace("'", "''") + "'"


def main():
    users = json.load(open(sys.argv[1], encoding='utf-8'))
    admin_email = sys.argv[2].strip().lower()
    excluded = sorted({u['email'].strip().lower() for u in users if not u['is_active'] or u['is_admin']} | {admin_email})
    print('-- Zmrazení příjemců pilotní pozvánky. Obsahuje e-maily, nepatří do repa.')
    print(f"""INSERT OR IGNORE INTO campaign_recipients (campaign, user_id)
SELECT {q(CAMPAIGN)}, id FROM users
 WHERE verified_at IS NOT NULL AND deleted_at IS NULL AND promo_opt_out_at IS NULL
   AND LOWER(email) NOT IN ({', '.join(q(e) for e in excluded)})
   AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign = {q(CAMPAIGN)})
 ORDER BY created_at, id
 LIMIT {LIMIT};""")
    print(f'-- vynecháno adres: {len(excluded)}', file=sys.stderr)


if __name__ == '__main__':
    main()
