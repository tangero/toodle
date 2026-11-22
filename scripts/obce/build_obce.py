#!/usr/bin/env python3
"""
Sestaví číselník obcí pro statistiku obcí a našeptávač.

Zdroj počtu obyvatel: ČSÚ, Počet obyvatel v obcích České republiky k 1. 1. 2025
(https://csu.gov.cz/produkty/pocet-obyvatel-v-obcich-rlm0s92pwn, tabulka 1300722503.xlsx).
Klíčem je kód obce (RÚIAN/ČSÚ). IČO obce slouží jen k převodu obcí ze staré aplikace,
kde se obec ukládala podle IČO; páruje se podle názvu a okresu, nejednoznačné případy přes ARES.

Použití (potřebuje openpyxl):
  python3 scripts/obce/build_obce.py <1300722503.xlsx> <stara cities.json>

Výstupy:
  db/seed/obce-2025.csv      kod,nazev,okres,kraj,obyvatel,ico (veřejná data, v repu)
  db/migrations/0009_obce_2025.sql  INSERT do tabulky municipalities po dávkách (data jsou
                             součástí migrací, aby je měla každá databáze; nová data = nová migrace)
  public/data/obce.json      kompaktní seznam pro našeptávač [[kod, nazev, okres, obyvatel], ...]
"""
import csv, json, re, sys, time, urllib.request
from collections import defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]

KRAJE = {
    'CZ010': 'Hlavní město Praha', 'CZ020': 'Středočeský kraj', 'CZ031': 'Jihočeský kraj',
    'CZ032': 'Plzeňský kraj', 'CZ041': 'Karlovarský kraj', 'CZ042': 'Ústecký kraj',
    'CZ051': 'Liberecký kraj', 'CZ052': 'Královéhradecký kraj', 'CZ053': 'Pardubický kraj',
    'CZ063': 'Kraj Vysočina', 'CZ064': 'Jihomoravský kraj', 'CZ071': 'Olomoucký kraj',
    'CZ072': 'Zlínský kraj', 'CZ080': 'Moravskoslezský kraj',
}


def norm(s: str) -> str:
    s = re.sub(r'^obec\s+', '', s.strip(), flags=re.I)
    return re.sub(r'\s*-\s*', '-', s).lower()


def read_csu(path):
    ws = openpyxl.load_workbook(path, read_only=True).worksheets[0]
    okres = 'Hlavní město Praha'
    rows = []
    for r in ws.iter_rows(min_row=7, values_only=True):
        if r[0] and str(r[0]).startswith('Okres '):
            okres = r[0][6:].strip()
            continue
        if r[0] and r[1]:
            rows.append({
                'kod': int(r[1]), 'nazev': str(r[2]).strip(), 'okres': okres,
                'kraj': KRAJE[str(r[0])[:5]], 'obyvatel': int(r[3]), 'ico': '',
            })
    return rows


def ares_kod_obce(ico: str):
    url = f'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}'
    req = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': 'skola-ai-obce'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.load(resp)
            return data.get('sidlo', {}).get('kodObce')
        except Exception:
            time.sleep(1 + attempt)
    return None


def main():
    xlsx, cities_json = sys.argv[1], sys.argv[2]
    csu = read_csu(xlsx)
    by_kod = {o['kod']: o for o in csu}
    idx = defaultdict(list)
    for o in csu:
        idx[(norm(o['nazev']), norm(o['okres']))].append(o)

    cities = json.load(open(cities_json, encoding='utf-8'))
    unresolved = []
    for c in cities:
        m = idx.get((norm(c['name']), norm(c['district'])), [])
        if len(m) == 1 and not m[0]['ico']:
            m[0]['ico'] = c['ico']
        else:
            unresolved.append(c)

    # Nejednoznačné nebo poškozené názvy: kód obce podle IČO z ARES.
    for c in unresolved:
        kod = ares_kod_obce(c['ico'])
        if kod in by_kod and not by_kod[kod]['ico']:
            by_kod[kod]['ico'] = c['ico']
            print(f'ARES: {c["name"]} ({c["district"]}) -> {kod} {by_kod[kod]["nazev"]}', file=sys.stderr)
        else:
            print(f'NESPÁROVÁNO: {c["ico"]} {c["name"]} ({c["district"]}), ARES {kod}', file=sys.stderr)
        time.sleep(0.2)

    print(f'obcí ČSÚ {len(csu)}, s IČO {sum(1 for o in csu if o["ico"])}', file=sys.stderr)

    seed = ROOT / 'db' / 'seed'
    seed.mkdir(parents=True, exist_ok=True)
    with open(seed / 'obce-2025.csv', 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['kod', 'nazev', 'okres', 'kraj', 'obyvatel', 'ico'])
        w.writeheader()
        w.writerows(csu)

    q = lambda s: "'" + s.replace("'", "''") + "'"
    lines = ['-- Migration 0009: číselník obcí. Vygenerováno skriptem scripts/obce/build_obce.py,',
             '-- zdroj počtu obyvatel ČSÚ k 1. 1. 2025.']
    for i in range(0, len(csu), 400):
        chunk = csu[i:i + 400]
        values = ',\n'.join(
            f"({o['kod']}, {q(o['nazev'])}, {q(o['okres'])}, {q(o['kraj'])}, {o['obyvatel']}, {q(o['ico']) if o['ico'] else 'NULL'})"
            for o in chunk
        )
        lines.append(
            'INSERT INTO municipalities (code, name, district, region, population, ico) VALUES\n'
            + values
            + '\nON CONFLICT(code) DO UPDATE SET name = excluded.name, district = excluded.district,'
            + ' region = excluded.region, population = excluded.population, ico = excluded.ico;'
        )
    (ROOT / 'db' / 'migrations' / '0009_obce_2025.sql').write_text('\n'.join(lines) + '\n', encoding='utf-8')

    out = ROOT / 'public' / 'data'
    out.mkdir(parents=True, exist_ok=True)
    compact = [[o['kod'], o['nazev'], o['okres'], o['obyvatel']]
               for o in sorted(csu, key=lambda o: -o['obyvatel'])]
    (out / 'obce.json').write_text(json.dumps(compact, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


if __name__ == '__main__':
    main()
