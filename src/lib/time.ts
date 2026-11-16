/**
 * Práce s časem.
 *
 * Všechny časy, které se v SQL porovnávají s `datetime('now')`, ukládej ve formátu
 * SQLite `YYYY-MM-DD HH:MM:SS` (UTC) – viz `toSqlDateTime`. ISO formát s "T" se
 * textově porovnává špatně (znak "T" je větší než mezera).
 */

const TZ = 'Europe/Prague';

/** Hodina (pražského času), kdy chodí lekce v režimu next_workday. */
export const DELIVERY_HOUR = 7;

/** Date → `YYYY-MM-DD HH:MM:SS` v UTC (stejný formát jako SQLite `datetime('now')`). */
export function toSqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Převede SQL/ISO čas z DB na Date. Řetězec bez zóny (SQLite formát) je UTC.
 */
export function fromDbDateTime(value: string): Date {
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  return new Date(normalized);
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function pragueParts(date: Date): ZonedParts {
  const parts: Record<string, number> = {};
  for (const p of formatter.formatToParts(date)) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour === 24 ? 0 : parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** Posun pražského času vůči UTC v milisekundách (3 600 000 v zimě, 7 200 000 v létě). */
function pragueOffsetMs(date: Date): number {
  const p = pragueParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Pražský „nástěnný“ čas → okamžik v UTC. */
export function pragueWallTimeToUtc(year: number, month: number, day: number, hour: number, minute = 0): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const offset = pragueOffsetMs(new Date(guess));
  let result = guess - offset;
  const offsetAtResult = pragueOffsetMs(new Date(result));
  if (offsetAtResult !== offset) result = guess - offsetAtResult;
  return new Date(result);
}

/**
 * Nejbližší termín doručení lekce: pracovní den v 7:00 pražského času.
 * - `afterToday: false` – může to být i dnešek, pokud 7:00 ještě nenastala.
 * - `afterToday: true`  – nejdřív následující pracovní den (po odeslání dnešní lekce).
 * Státní svátky se neřeší.
 */
export function nextDeliverySlot(now: Date = new Date(), opts: { afterToday?: boolean } = {}): Date {
  const today = pragueParts(now);
  for (let i = opts.afterToday ? 1 : 0; i < 14; i++) {
    const day = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const slot = pragueWallTimeToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), DELIVERY_HOUR);
    if (slot.getTime() > now.getTime()) return slot;
  }
  throw new Error('nextDeliverySlot: nenalezen termín');
}

/** Lidsky čitelné datum a čas v češtině (pražský čas). */
export function formatPragueDateTime(date: Date): string {
  return date.toLocaleString('cs-CZ', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
