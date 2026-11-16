import { describe, expect, it } from 'vitest';
import { RATING_COMMENT_MAX, firstName, parseRatingInput } from '@lib/ratings';

describe('parseRatingInput', () => {
  it('přijme známku 1 až 5 z formuláře', () => {
    for (const score of ['1', '2', '3', '4', '5']) {
      expect(parseRatingInput({ score })).toEqual({
        ok: true,
        value: { score: Number(score), comment: '', publishConsent: false },
      });
    }
  });

  it('odmítne chybějící známku a hodnoty mimo rozsah', () => {
    for (const score of [undefined, null, '', '0', '6', '-1', '3.5', '3,5', 'pět', '55', '1e0', {}, 0, 6]) {
      expect(parseRatingInput({ score })).toEqual({ ok: false, error: 'score' });
    }
  });

  it('text ořízne a sjednotí konce řádků', () => {
    const result = parseRatingInput({ score: '4', comment: '  První řádek\r\nDruhý řádek  ' });
    expect(result).toEqual({
      ok: true,
      value: { score: 4, comment: 'První řádek\nDruhý řádek', publishConsent: false },
    });
  });

  it('text na hranici limitu projde, delší ne', () => {
    const atLimit = parseRatingInput({ score: '5', comment: 'a'.repeat(RATING_COMMENT_MAX) });
    expect(atLimit.ok).toBe(true);
    expect(parseRatingInput({ score: '5', comment: 'a'.repeat(RATING_COMMENT_MAX + 1) }))
      .toEqual({ ok: false, error: 'comment' });
  });

  it('konce řádků z prohlížeče (\\r\\n) se do limitu počítají jako jeden znak', () => {
    const lines = Array.from({ length: RATING_COMMENT_MAX / 2 }, () => 'a').join('\r\n');
    expect(parseRatingInput({ score: '5', comment: lines }).ok).toBe(true);
  });

  it('odmítne text, který není řetězec (např. nahraný soubor)', () => {
    expect(parseRatingInput({ score: '5', comment: { name: 'soubor.txt' } }))
      .toEqual({ ok: false, error: 'comment' });
  });

  it('text ponechá beze změny, HTML se řeší až při výpisu', () => {
    const result = parseRatingInput({ score: '3', comment: '<script>alert(1)</script>' });
    expect(result.ok && result.value.comment).toBe('<script>alert(1)</script>');
  });

  it('souhlas se zveřejněním platí jen při zaškrtnutém poli', () => {
    const consent = (publishConsent: unknown) => {
      const result = parseRatingInput({ score: '5', publishConsent });
      return result.ok && result.value.publishConsent;
    };
    expect(consent('on')).toBe(true);
    expect(consent('1')).toBe(true);
    expect(consent(undefined)).toBe(false);
    expect(consent(null)).toBe(false);
    expect(consent('')).toBe(false);
    expect(consent('off')).toBe(false);
  });
});

describe('firstName', () => {
  it('vrátí první slovo jména', () => {
    expect(firstName('Jana Nováková')).toBe('Jana');
    expect(firstName('  Karel   Jaromír Erben ')).toBe('Karel');
    expect(firstName('Petr')).toBe('Petr');
    expect(firstName('')).toBe('');
  });
});
