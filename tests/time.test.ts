import { describe, it, expect } from 'vitest';
import { nextDeliverySlot, toSqlDateTime, pragueWallTimeToUtc, fromDbDateTime } from '../src/lib/time';

const iso = (d: Date) => d.toISOString().slice(0, 16);

describe('toSqlDateTime', () => {
  it('vrací formát SQLite datetime(), který se dá textově porovnat', () => {
    expect(toSqlDateTime(new Date('2026-06-10T05:00:00.123Z'))).toBe('2026-06-10 05:00:00');
    // Regrese: ISO formát se s datetime('now') porovnával špatně ("T" > " ").
    expect(toSqlDateTime(new Date('2026-06-10T05:00:00Z')) <= '2026-06-10 05:00:00').toBe(true);
  });

  it('fromDbDateTime čte SQL i ISO formát jako UTC', () => {
    expect(fromDbDateTime('2026-06-10 05:00:00').toISOString()).toBe('2026-06-10T05:00:00.000Z');
    expect(fromDbDateTime('2026-06-10T05:00:00.000Z').toISOString()).toBe('2026-06-10T05:00:00.000Z');
  });
});

describe('pragueWallTimeToUtc', () => {
  it('zima (CET, UTC+1) a léto (CEST, UTC+2)', () => {
    expect(iso(pragueWallTimeToUtc(2026, 11, 12, 7))).toBe('2026-11-12T06:00');
    expect(iso(pragueWallTimeToUtc(2026, 6, 10, 7))).toBe('2026-06-10T05:00');
  });
  it('dny přechodu na letní/zimní čas', () => {
    expect(iso(pragueWallTimeToUtc(2026, 3, 29, 7))).toBe('2026-03-29T05:00'); // po přechodu na CEST
    expect(iso(pragueWallTimeToUtc(2026, 10, 25, 7))).toBe('2026-10-25T06:00'); // po přechodu na CET
  });
});

describe('nextDeliverySlot', () => {
  it('po odeslání v 7:00 (léto) plánuje další pracovní den, ne dnešek', () => {
    const sentAt = new Date('2026-06-10T05:00:00Z'); // středa 7:00 CEST
    expect(iso(nextDeliverySlot(sentAt, { afterToday: true }))).toBe('2026-06-11T05:00');
  });

  it('po odeslání v zimě (cron 06 UTC) plánuje zítřek 7:00 CET – ne dnešek', () => {
    const sentAt = new Date('2026-11-11T05:00:00Z'); // 6:00 CET – dřívější chyba plánovala na dnešních 7:00
    expect(iso(nextDeliverySlot(sentAt, { afterToday: true }))).toBe('2026-11-12T06:00');
  });

  it('v pátek plánuje pondělí', () => {
    const friday = new Date('2026-06-12T05:00:00Z');
    expect(iso(nextDeliverySlot(friday, { afterToday: true }))).toBe('2026-06-15T05:00');
  });

  it('aktivace před 7:00 → ještě dnes; po 7:00 → další pracovní den', () => {
    expect(iso(nextDeliverySlot(new Date('2026-06-10T03:30:00Z')))).toBe('2026-06-10T05:00');
    expect(iso(nextDeliverySlot(new Date('2026-06-10T10:00:00Z')))).toBe('2026-06-11T05:00');
    expect(iso(nextDeliverySlot(new Date('2026-06-13T10:00:00Z')))).toBe('2026-06-15T05:00'); // sobota
  });

  it('simulace 3 týdnů s cronem 05/06/07 UTC: každý pracovní den právě jedna lekce (léto i zima)', () => {
    for (const start of ['2026-06-08', '2026-11-09']) {
      let next = toSqlDateTime(nextDeliverySlot(new Date(`${start}T00:00:00Z`)));
      const sentDays: string[] = [];
      for (let day = 0; day < 21; day++) {
        for (const hour of [5, 6, 7]) {
          const now = new Date(Date.parse(`${start}T00:00:00Z`) + day * 86_400_000 + hour * 3_600_000);
          const dow = now.getUTCDay();
          if (dow === 0 || dow === 6) continue;
          if (next <= toSqlDateTime(now)) {
            sentDays.push(now.toISOString().slice(0, 10));
            next = toSqlDateTime(nextDeliverySlot(now, { afterToday: true }));
          }
        }
      }
      expect(sentDays.length).toBe(15); // 15 pracovních dní
      expect(new Set(sentDays).size).toBe(15); // nikdy dvě lekce za den
    }
  });
});
