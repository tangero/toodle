/**
 * Zpětná vazba na srozumitelnost lekcí: čisté funkce bez přístupu k databázi a env,
 * aby šly testovat samostatně. Zápis do databáze je v `feedback-store.ts`.
 * Zadání: docs/zpetna-vazba-srozumitelnost.md.
 */
import type { DeliveryMode } from './types';

export type FeedbackAnswer = 1 | 2 | 3;

/** Odpovědi vždy v tomto pořadí. */
export const FEEDBACK_ANSWERS: readonly FeedbackAnswer[] = [1, 2, 3];

/** Znění odpovědí (e-mail, stránka /srozumitelnost, admin). */
export const FEEDBACK_LABELS: Record<FeedbackAnswer, string> = {
  1: 'Rozuměl jsem',
  2: 'Něco mi nesedělo',
  3: 'Nerozuměl jsem, potřebuji to vysvětlit lépe',
};

/** Tlačítka u kurzů na potvrzení: odpověď zároveň pošle další lekci. */
export const FEEDBACK_NEXT_LABELS: Record<FeedbackAnswer, string> = {
  1: 'Rozuměl jsem, pošlete další',
  2: 'Něco mi nesedělo, pošlete další',
  3: 'Nerozuměl jsem, potřebuji to vysvětlit lépe',
};

/** Připomínka je jedna věta. */
export const FEEDBACK_COMMENT_MAX = 500;

/** Nejdelší text části, který se vloží do zadání pro AI (delší se zkrátí). */
export const HELP_PROMPT_SECTION_MAX = 6000;

/**
 * Prahy pro označení lekce „k přepisu“: dost odpovědí a dost velký podíl odpovědi 3.
 * U kurzů na potvrzení odpovídá skoro každý, u denních jen ti, kdo se rozhodnou kliknout,
 * proto se vyhodnocují zvlášť. Výchozí návrh, upraví se podle skutečných čísel.
 */
export const REWRITE_THRESHOLDS: Record<DeliveryMode, { minAnswers: number; minShare: number }> = {
  on_click: { minAnswers: 20, minShare: 0.15 },
  next_workday: { minAnswers: 10, minShare: 0.30 },
};

export function needsRewrite(mode: DeliveryMode, totalAnswers: number, notUnderstood: number): boolean {
  const threshold = REWRITE_THRESHOLDS[mode];
  if (totalAnswers < threshold.minAnswers || totalAnswers <= 0) return false;
  return notUnderstood / totalAnswers >= threshold.minShare;
}

/** Doba čitelně pro přehled v adminu: minuty, od 90 minut hodiny, od 48 hodin dny. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '–';
  const minutes = seconds / 60;
  if (minutes < 90) return `${Math.max(1, Math.round(minutes))} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} d`;
}

/** Odpověď z formuláře, adresy nebo JSON těla: jen 1, 2 nebo 3 (číslo nebo text). */
export function parseFeedbackAnswer(raw: unknown): FeedbackAnswer | null {
  const text = typeof raw === 'number' ? String(raw) : raw;
  if (typeof text !== 'string' || !/^[123]$/.test(text.trim())) return null;
  return Number(text.trim()) as FeedbackAnswer;
}

/** Část lekce podle nadpisu `<h3>`. */
export interface LessonSection {
  /** Pořadí části v lekci, od 1. */
  n: number;
  /** Název části bez značek. */
  title: string;
  /** Čistý text části (bez nadpisu a bez značek). */
  text: string;
}

/** Označená část tak, jak se ukládá do `lesson_feedback.sections_json`. */
export interface SectionRef {
  n: number;
  title: string;
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>',
  ndash: '–', mdash: '—', hellip: '…', bdquo: '„', ldquo: '“', rdquo: '”',
  lsquo: '‘', rsquo: '’', sbquo: '‚', laquo: '«', raquo: '»', times: '×', rarr: '→', copy: '©',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d{1,7});/g, (whole, dec) => codePoint(Number(dec), whole))
    .replace(/&#x([0-9a-f]{1,6});/gi, (whole, hex) => codePoint(Number.parseInt(hex, 16), whole))
    .replace(/&([a-z]+);/gi, (whole, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? whole)
    // Ampersand až nakonec, aby z „&amp;lt;“ nevzniklo „<“.
    .replace(/&amp;/gi, '&');
}

function codePoint(code: number, fallback: string): string {
  if (!Number.isInteger(code) || code <= 0 || code > 0x10ffff) return fallback;
  return code === 0xa0 ? ' ' : String.fromCodePoint(code);
}

/** HTML na prostý text: odstavce a položky seznamu na samostatných řádcích, bez značek. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li\b[^>]*>/gi, '\n- ')
      .replace(/<\/(p|li|h[1-6]|tr|blockquote|pre|div|ul|ol|table)>/gi, '\n\n')
      .replace(/<\/(td|th)>/gi, ' ')
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Rozdělí HTML tělo lekce na části podle nadpisů `<h3>`. Text před prvním nadpisem
 * (úvod lekce) částí není. Lekce bez nadpisů a prázdné tělo vrací prázdný seznam.
 * Vstupem je HTML: tělo psané v Markdownu nejdřív převeď přes `renderMarkdown`.
 */
export function lessonSections(html: string): LessonSection[] {
  if (typeof html !== 'string' || !html.trim()) return [];
  const headingRe = /<h3\b[^>]*>([\s\S]*?)<\/h3\s*>/gi;
  const headings = [...html.matchAll(headingRe)];

  return headings.map((match, i) => {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = i + 1 < headings.length ? headings[i + 1].index ?? html.length : html.length;
    const title = htmlToText(match[1]).replace(/\s+/g, ' ').trim();
    return {
      n: i + 1,
      title: title || `Část ${i + 1}`,
      text: htmlToText(html.slice(bodyStart, bodyEnd)),
    };
  });
}

export interface FeedbackDetail {
  sections: SectionRef[];
  comment: string;
}

export type FeedbackDetailValidation =
  | { ok: true; value: FeedbackDetail }
  | { ok: false; error: 'comment' };

/**
 * Ověří dobrovolné upřesnění z formuláře.
 * - části: čísla zaškrtnutých částí; berou se jen ta, která v lekci opravdu jsou,
 *   a název se doplní ze serveru (z formuláře se nepřebírá),
 * - připomínka: nepovinná, nejvýš 500 znaků po oříznutí; konce řádků se sjednotí na \n.
 */
export function parseFeedbackDetail(
  raw: { sections?: unknown; comment?: unknown },
  available: LessonSection[],
): FeedbackDetailValidation {
  const wanted = new Set<number>();
  const list = Array.isArray(raw.sections) ? raw.sections : raw.sections === undefined || raw.sections === null ? [] : [raw.sections];
  for (const item of list) {
    const text = typeof item === 'number' ? String(item) : item;
    if (typeof text === 'string' && /^[1-9]\d{0,2}$/.test(text.trim())) wanted.add(Number(text.trim()));
  }
  const sections = available.filter((s) => wanted.has(s.n)).map((s) => ({ n: s.n, title: s.title }));

  let comment = '';
  if (raw.comment !== undefined && raw.comment !== null) {
    if (typeof raw.comment !== 'string') return { ok: false, error: 'comment' };
    comment = raw.comment.replace(/\r\n?/g, '\n').trim();
    if (comment.length > FEEDBACK_COMMENT_MAX) return { ok: false, error: 'comment' };
  }

  return { ok: true, value: { sections, comment } };
}

/** Bezpečně přečte `sections_json` z databáze. Poškozená hodnota = žádné části. */
export function parseSectionsJson(json: string | null | undefined): SectionRef[] {
  if (!json) return [];
  try {
    const data: unknown = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data.flatMap((item): SectionRef[] => {
      const n: unknown = (item as SectionRef | null)?.n;
      const title: unknown = (item as SectionRef | null)?.title;
      return typeof n === 'number' && Number.isInteger(n) && typeof title === 'string' ? [{ n, title }] : [];
    });
  } catch {
    return [];
  }
}

const HELP_PROMPT_INTRO =
  'Vysvětli mi jednodušeji tuto část lekce. Piš jako pro úplného začátečníka, použij jeden příklad '
  + 'z běžného života a na konci mi polož jednu otázku, kterou si ověřím, že tomu rozumím.';

/**
 * Zadání ke zkopírování do ChatGPT nebo Claude (okamžitá pomoc po odpovědi „nerozuměl jsem“).
 * S vybranou částí vloží její název a text, bez ní název lekce a výzvu, ať čtenář část vloží sám.
 * Vrací prostý text: do stránky ho vkládej jen escapovaně.
 */
export function buildHelpPrompt(lessonTitle: string, section?: Pick<LessonSection, 'title' | 'text'>): string {
  if (!section) {
    return `${HELP_PROMPT_INTRO} Jde o lekci „${lessonTitle}“. Část lekce: „sem vložte text části, které nerozumíte“`;
  }
  const text = section.text.length > HELP_PROMPT_SECTION_MAX
    ? `${section.text.slice(0, HELP_PROMPT_SECTION_MAX).trimEnd()}…`
    : section.text;
  return `${HELP_PROMPT_INTRO} Část lekce: „${section.title}\n\n${text}“`;
}
