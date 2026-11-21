import { getAll, getOne } from './db';

/**
 * Obce a veřejná statistika obcí (/obce).
 *
 * Do statistiky se počítají jen účty s ověřeným e-mailem (verified_at) a nesmazané. Nepotvrzený
 * zápis založí uživatele ještě před ověřením, bez této podmínky by šlo obci přidávat „obyvatele“
 * cizími adresami. Obce a kraje s méně než MIN_PUBLIC_USERS uživateli se veřejně neukazují:
 * malá čísla jsou statistický šum a v malé obci by ukazovala na konkrétního člověka.
 */
export const MIN_PUBLIC_USERS = 5;

export interface Municipality {
  code: number;
  name: string;
  district: string;
  region: string;
  population: number;
}

export interface MunicipalityStat extends Municipality {
  users: number;
  /** Podíl obyvatel v procentech. */
  share: number;
}

export interface RegionStat {
  region: string;
  population: number;
  users: number;
  share: number;
}

const COUNTED = `u.verified_at IS NOT NULL AND u.deleted_at IS NULL`;

/** Kód obce z formuláře: kladné celé číslo, jinak null. */
export function parseMunicipalityCode(value: unknown): number | null {
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  if (!/^[1-9]\d{4,6}$/.test(text)) return null;
  return Number(text);
}

export async function getMunicipality(db: D1Database, code: number): Promise<Municipality | null> {
  return getOne<Municipality>(
    db, `SELECT code, name, district, region, population FROM municipalities WHERE code = ?`, code,
  );
}

/**
 * Text obce přesně tak, jak ho skládá našeptávač (MunicipalityField.astro), aby předvyplněná
 * hodnota odpovídala jeho možnosti. Kód se přidává jen u stejnojmenných obcí v jednom okrese.
 */
export function municipalityLabel(m: Pick<Municipality, 'code' | 'name' | 'district'>, ambiguous: boolean): string {
  return ambiguous ? `${m.name} (okres ${m.district}, kód ${m.code})` : `${m.name} (okres ${m.district})`;
}

/** Obec uživatele i s textem pro našeptávač, nebo null. */
export async function getUserMunicipality(
  db: D1Database, userId: string,
): Promise<(Municipality & { label: string }) | null> {
  const row = await getOne<Municipality & { same: number }>(
    db,
    `SELECT m.code, m.name, m.district, m.region, m.population,
            (SELECT COUNT(*) FROM municipalities x WHERE x.name = m.name AND x.district = m.district) AS same
       FROM users u JOIN municipalities m ON m.code = u.municipality_code
      WHERE u.id = ?`,
    userId,
  );
  if (!row) return null;
  const { same, ...m } = row;
  return { ...m, label: municipalityLabel(m, same > 1) };
}

export function sharePercent(users: number, population: number): number {
  return population > 0 ? (users / population) * 100 : 0;
}

export interface MunicipalityStats {
  byShare: MunicipalityStat[];
  byCount: MunicipalityStat[];
  regions: RegionStat[];
  /** Ověření uživatelé s vyplněnou obcí. */
  usersWithMunicipality: number;
  /** Obce, kde je aspoň jeden uživatel (jen číslo, bez jmen). */
  municipalitiesWithUsers: number;
}

export async function getMunicipalityStats(db: D1Database, limit = 30): Promise<MunicipalityStats> {
  const rows = await getAll<Municipality & { users: number }>(
    db,
    `SELECT m.code, m.name, m.district, m.region, m.population, COUNT(*) AS users
       FROM users u JOIN municipalities m ON m.code = u.municipality_code
      WHERE ${COUNTED}
      GROUP BY m.code`,
  );
  const regionPopulation = await getAll<{ region: string; population: number }>(
    db, `SELECT region, SUM(population) AS population FROM municipalities GROUP BY region`,
  );

  const withShare = rows.map((r) => ({ ...r, share: sharePercent(r.users, r.population) }));
  const visible = withShare.filter((r) => r.users >= MIN_PUBLIC_USERS);

  const regionUsers = new Map<string, number>();
  for (const r of rows) regionUsers.set(r.region, (regionUsers.get(r.region) ?? 0) + r.users);
  const regions = regionPopulation
    .map((r) => {
      const users = regionUsers.get(r.region) ?? 0;
      return { region: r.region, population: r.population, users, share: sharePercent(users, r.population) };
    })
    .filter((r) => r.users >= MIN_PUBLIC_USERS)
    .sort((a, b) => b.share - a.share);

  return {
    byShare: [...visible].sort((a, b) => b.share - a.share || b.users - a.users).slice(0, limit),
    byCount: [...visible].sort((a, b) => b.users - a.users || b.share - a.share).slice(0, limit),
    regions,
    usersWithMunicipality: rows.reduce((sum, r) => sum + r.users, 0),
    municipalitiesWithUsers: rows.length,
  };
}
