#!/usr/bin/env python3
"""
Převod uživatelů ze staré aplikace do tabulky users (jednorázově).

Přebírá jméno, e-mail, datum registrace, ověření e-mailu a obec. Hesla, tokeny, role ani
pozvánky nepřebírá. ID jsou nová (ULID s časem registrace). Duplicitní e-maily (lišící se jen
velikostí písmen) se slučují: přednost má ověřený účet, pak účet s obcí, pak dřívější registrace.
Existující účty v nové databázi se nepřepisují, jen se jim doplní obec, pokud ji nemají.

Výstup obsahuje osobní údaje: zapisuje se do data-ze-stare/ (je v .gitignore), nikdy do repa.

Použití:
  python3 scripts/obce/import_stari_uzivatele.py data-ze-stare/users.json db/seed/obce-2025.csv \\
      > data-ze-stare/import-uzivatelu.sql
  npx wrangler d1 execute skola-ai-db --local --persist-to .wrangler/state --file data-ze-stare/import-uzivatelu.sql
"""
import csv, json, os, re, sys
from datetime import datetime, timezone

EMAIL_RE = re.compile(r'^[^\s@<>()\[\]\\,;:"]+@[^\s@<>()\[\]\\,;:"]+\.[^\s@<>()\[\]\\,;:"]{2,}$')
CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'


def ulid(ms: int) -> str:
    t = ''.join(CROCKFORD[(ms >> (5 * i)) & 31] for i in reversed(range(10)))
    r = int.from_bytes(os.urandom(10), 'big')
    return t + ''.join(CROCKFORD[(r >> (5 * i)) & 31] for i in reversed(range(16)))


def sql_time(iso: str) -> tuple[str, int]:
    d = datetime.fromisoformat(iso.replace('Z', '+00:00')).astimezone(timezone.utc)
    return d.strftime('%Y-%m-%d %H:%M:%S'), int(d.timestamp() * 1000)


def q(v):
    return 'NULL' if v is None else str(v) if isinstance(v, int) else "'" + str(v).replace("'", "''") + "'"


def main():
    users = json.load(open(sys.argv[1], encoding='utf-8'))
    ico_to_code = {r['ico']: int(r['kod']) for r in csv.DictReader(open(sys.argv[2], encoding='utf-8')) if r['ico']}

    best: dict[str, dict] = {}
    skipped = []
    for u in users:
        email = u['email'].strip().lower()
        if len(email) > 254 or not EMAIL_RE.match(email):
            skipped.append(u['id'])
            continue
        rank = (not u['email_verified'], u['city_ico'] is None, u['registered_at'])
        if email not in best or rank < best[email]['_rank']:
            best[email] = {**u, '_rank': rank, '_email': email}

    rows = []
    unmapped = 0
    for email, u in best.items():
        created, ms = sql_time(u['registered_at'])
        name = re.sub(r'\s+', ' ', (u['name'] or '').strip())[:80] or email.split('@')[0]
        code = ico_to_code.get(u['city_ico']) if u['city_ico'] else None
        if u['city_ico'] and code is None:
            unmapped += 1
        rows.append((ulid(ms), email, name, created, created if u['email_verified'] else None, code))

    print('-- Import uživatelů ze staré aplikace. Obsahuje osobní údaje, nepatří do repa.')
    for i in range(0, len(rows), 200):
        values = ',\n'.join('(' + ', '.join(q(v) for v in r) + ')' for r in rows[i:i + 200])
        print('INSERT INTO users (id, email, name, created_at, verified_at, municipality_code) VALUES\n'
              + values
              + '\nON CONFLICT(email) DO UPDATE SET municipality_code = COALESCE(users.municipality_code, excluded.municipality_code);')

    print(f'-- záznamů {len(users)}, unikátních e-mailů {len(rows)}, neplatný e-mail {len(skipped)}, '
          f'ověřených {sum(1 for r in rows if r[4])}, s obcí {sum(1 for r in rows if r[5])}, nepřevedená obec {unmapped}',
          file=sys.stderr)


if __name__ == '__main__':
    main()
