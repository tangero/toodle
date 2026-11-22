import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { municipalityLabel, parseMunicipalityCode, sharePercent } from '@lib/municipalities';

describe('parseMunicipalityCode', () => {
  it('přijme kód obce jako text i číslo', () => {
    expect(parseMunicipalityCode('544256')).toBe(544256);
    expect(parseMunicipalityCode(554782)).toBe(554782);
    expect(parseMunicipalityCode(' 544256 ')).toBe(544256);
  });

  it('odmítne prázdné a nesmyslné hodnoty', () => {
    for (const v of ['', '0', '12', '01234', 'abc', '544256; DROP', null, undefined, {}, 1.5]) {
      expect(parseMunicipalityCode(v)).toBeNull();
    }
  });
});

describe('sharePercent', () => {
  it('počítá procenta a nedělí nulou', () => {
    expect(sharePercent(57, 16367)).toBeCloseTo(0.348, 3);
    expect(sharePercent(3, 0)).toBe(0);
  });
});

describe('municipalityLabel', () => {
  it('přidá kód jen u stejnojmenných obcí v jednom okrese', () => {
    const m = { code: 581429, name: 'Březina', district: 'Brno-venkov' };
    expect(municipalityLabel(m, false)).toBe('Březina (okres Brno-venkov)');
    expect(municipalityLabel(m, true)).toBe('Březina (okres Brno-venkov, kód 581429)');
  });
});

describe('seznam obcí pro našeptávač', () => {
  const rows = JSON.parse(readFileSync('public/data/obce.json', 'utf8')) as [number, string, string, number][];

  it('obsahuje všechny obce (vojenské újezdy mají 0 obyvatel), větší první', () => {
    expect(rows.length).toBeGreaterThan(6200);
    expect(rows[0][1]).toBe('Praha');
    expect(rows.every(([code, , , pop]) => parseMunicipalityCode(code) === code && pop >= 0)).toBe(true);
    expect(rows.every((r, i) => i === 0 || rows[i - 1][3] >= r[3])).toBe(true);
  });

  it('stejnojmenné obce mají vlastní počty obyvatel (chyba staré tabulky)', () => {
    const kladno = rows.filter(([, name, district]) => name === 'Kladno' && district === 'Kladno');
    expect(kladno).toHaveLength(1);
    expect(kladno[0][3]).toBeGreaterThan(60000);
  });
});
