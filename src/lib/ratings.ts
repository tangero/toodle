/**
 * Hodnocení kurzu: čisté funkce pro validaci vstupu z formuláře (/hodnoceni/[token]).
 * Bez přístupu k databázi a env, aby šly testovat samostatně.
 */

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const RATING_COMMENT_MAX = 2000;

/** Slovní popis známek ve formuláři a v přehledu (5 = nejlepší). */
export const RATING_LABELS: Record<number, string> = {
  5: 'Výborný',
  4: 'Dobrý',
  3: 'Průměrný',
  2: 'Slabý',
  1: 'Špatný',
};

export interface RatingInput {
  score: number;
  comment: string;
  publishConsent: boolean;
}

export type RatingError = 'score' | 'comment';

export type RatingValidation =
  | { ok: true; value: RatingInput }
  | { ok: false; error: RatingError };

/**
 * Ověří hodnoty z formuláře (všechny přicházejí jako text, nebo chybí).
 * - známka: celé číslo 1 až 5, povinná,
 * - text: nepovinný, nejvýš 2 000 znaků po oříznutí; konce řádků se sjednotí na \n
 *   (prohlížeč posílá \r\n, ale do limitu textarea je počítá jako jeden znak),
 * - souhlas se zveřejněním: zaškrtnuté pole pošle hodnotu, nezaškrtnuté nepošle nic.
 */
export function parseRatingInput(raw: { score: unknown; comment?: unknown; publishConsent?: unknown }): RatingValidation {
  const scoreText = typeof raw.score === 'number' ? String(raw.score) : raw.score;
  if (typeof scoreText !== 'string' || !/^[1-5]$/.test(scoreText.trim())) return { ok: false, error: 'score' };

  let comment = '';
  if (raw.comment !== undefined && raw.comment !== null) {
    if (typeof raw.comment !== 'string') return { ok: false, error: 'comment' };
    comment = raw.comment.replace(/\r\n?/g, '\n').trim();
    if (comment.length > RATING_COMMENT_MAX) return { ok: false, error: 'comment' };
  }

  const consent = raw.publishConsent;
  const publishConsent = consent === true || consent === 'on' || consent === '1' || consent === 'true';

  return { ok: true, value: { score: Number(scoreText.trim()), comment, publishConsent } };
}

/** Křestní jméno pro zveřejnění hodnocení: první slovo jména, nic dalšího. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
