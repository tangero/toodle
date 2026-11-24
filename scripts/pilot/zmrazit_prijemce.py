#!/usr/bin/env python3
"""
Zmrazí příjemce jedné vlny pozvánky: N nejstarších ověřených účtů v D1, kteří ještě nejsou
v žádné kampani (pilot ani dřívější vlny je tedy znovu nedostanou).

Vynechá účty, které ve staré aplikaci nebyly aktivní nebo patřily adminům (import tyto
příznaky nepřenesl, proto se berou ze starých dat), adresy na doménách týmu (TEAM_DOMAINS),
smazané účty a účty s odhlášenými nabídkami. Adresu ADMIN_EMAIL vynechá i odesílání. Výstup
obsahuje e-maily vynechaných účtů, patří proto do data-ze-stare/ (je v .gitignore), nikdy do
repa. Seznam vlny se vkládá jen jednou (INSERT OR IGNORE + kontrola, že vlna je prázdná),
další spuštění nikoho nepřidá. Kampaň musí být v CAMPAIGNS v src/lib/campaign.ts.

Použití:
  python3 scripts/pilot/zmrazit_prijemce.py data-ze-stare/users.json --campaign vlna2-2026-11 --limit 500 \\
    > data-ze-stare/vlna2-prijemci.sql
  npx wrangler d1 execute skola-ai-db --remote --file data-ze-stare/vlna2-prijemci.sql
"""
import argparse, json, re, sys

# Testovací a osobní účty týmu.
TEAM_DOMAINS = ('zandl.cz', 'marigold.cz', 'aivefirmach.cz', 'vibecoding.cz')


def q(v: str) -> str:
    return "'" + v.replace("'", "''") + "'"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('users_json', help='export uživatelů ze staré aplikace (data-ze-stare/users.json)')
    ap.add_argument('--campaign', required=True, help='název vlny, např. vlna2-2026-11')
    ap.add_argument('--limit', type=int, required=True, help='kolik lidí vlna dostane')
    a = ap.parse_args()
    if not re.fullmatch(r'[a-z0-9-]+', a.campaign):
        sys.exit('Název kampaně smí obsahovat jen malá písmena, číslice a pomlčky.')
    if not 0 < a.limit <= 5000:
        sys.exit('Limit musí být mezi 1 a 5000.')

    users = json.load(open(a.users_json, encoding='utf-8'))
    excluded = sorted({u['email'].strip().lower() for u in users if not u['is_active'] or u['is_admin']})
    team = ' '.join(f"AND LOWER(u.email) NOT LIKE {q('%@' + d)} AND LOWER(u.email) NOT LIKE {q('%.' + d)}" for d in TEAM_DOMAINS)
    print(f'-- Zmrazení příjemců vlny {a.campaign} (limit {a.limit}). Obsahuje e-maily, nepatří do repa.')
    print(f"""INSERT OR IGNORE INTO campaign_recipients (campaign, user_id)
SELECT {q(a.campaign)}, u.id FROM users u
 WHERE u.verified_at IS NOT NULL AND u.deleted_at IS NULL AND u.promo_opt_out_at IS NULL
   AND LOWER(u.email) NOT IN ({', '.join(q(e) for e in excluded)})
   {team}
   AND NOT EXISTS (SELECT 1 FROM campaign_recipients r WHERE r.user_id = u.id)
   AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign = {q(a.campaign)})
 ORDER BY u.created_at, u.id
 LIMIT {a.limit};""")
    print(f'-- vynecháno adres: {len(excluded)}', file=sys.stderr)


if __name__ == '__main__':
    main()
