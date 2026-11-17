/**
 * Čisté funkce kolem vizuálního editoru lekcí. Tiptap se tu záměrně neimportuje:
 * seznam lekcí potřebuje jen `unsupportedTags` a editor (přes 100 kB) se stahuje až při úpravě.
 * Nastavení editoru je v `lesson-editor-extensions.ts`.
 */
import { renderMarkdown } from './markdown';

/**
 * Značky, které editor umí zobrazit i uložit. Všechny jsou ve whitelistu `renderMarkdown`.
 * Nadpis je jen <h3>: podle něj se lekce dělí na části pro zpětnou vazbu na srozumitelnost.
 * Blok kódu <pre> chybí záměrně: s prázdným řádkem uvnitř seznamu nebo citace ho Markdown při zobrazení rozbije.
 */
export const EDITOR_TAGS = new Set([
  'a', 'blockquote', 'br', 'code', 'em', 'h3', 'hr', 'li', 'ol', 'p', 'strong', 'ul',
]);

/** Odkaz, který filtr značek propustí (stejné pravidlo jako `isAllowedHref` v markdown.ts). */
export function isEditorHref(href: string): boolean {
  const value = href.trim().toLowerCase();
  return /^(https?:\/\/|mailto:)\S+$/.test(value) || /^\/\S*$/.test(value);
}

/** HTML, které se do editoru načte: tělo lekce (HTML i Markdown) po vyčištění filtrem značek. */
export function toEditorHtml(content: string): string {
  return renderMarkdown(content);
}

/**
 * Značky v těle lekce, které by vizuální režim zahodil nebo zploštil (tabulka, jiný nadpis než h3…).
 * Když nějaké jsou, lekce se smí upravovat jen ve zdrojovém kódu.
 */
export function unsupportedTags(content: string): string[] {
  const found = new Set<string>();
  for (const match of toEditorHtml(content).matchAll(/<([a-zA-Z][a-zA-Z0-9]*)/g)) {
    const name = match[1].toLowerCase();
    if (!EDITOR_TAGS.has(name)) found.add(name);
  }
  return [...found].sort();
}

/**
 * Výstup editoru (jeden řádek) rozepíše do tvaru, v jakém jsou lekce v `docs/course-content/`:
 * bloky oddělené prázdným řádkem, položky seznamu odsazené. Úprava z adminu se pak dá přenést do souboru.
 * Obsah <pre> nechává být, tam jsou konce řádků součástí textu.
 */
export function formatLessonHtml(html: string): string {
  const pres: string[] = [];
  let out = html.replace(/<pre[\s\S]*?<\/pre>/g, (pre) => {
    pres.push(pre);
    return `<pre data-slot="${pres.length - 1}"></pre>`;
  });

  // Prázdný dokument editoru je jeden prázdný odstavec.
  if (out.replace(/<p><\/p>/g, '').trim() === '') return '';

  const lines: string[] = [];
  /** Otevřené obaly (seznam, položka, citace); u položky i počet řádků při otevření. */
  const open: { tag: string; linesAtOpen: number }[] = [];
  const newLine = (text: string, blankBefore = false) => {
    if (blankBefore && open.length === 0 && lines.length > 0) lines.push('');
    lines.push('  '.repeat(open.length) + text);
  };
  const append = (text: string) => {
    if (lines.length === 0) lines.push('');
    lines[lines.length - 1] += text;
  };

  let last = 0;
  for (const match of out.matchAll(/<(\/?)(ul|ol|li|blockquote|p|h3|pre|hr)\b[^>]*>/g)) {
    const [tag, closing, name] = match;
    const between = out.slice(last, match.index);
    if (between.trim()) append(between);
    last = match.index + tag.length;
    const container = name === 'ul' || name === 'ol' || name === 'li' || name === 'blockquote';

    if (!closing && container) {
      newLine(tag, name !== 'li');
      open.push({ tag: name, linesAtOpen: lines.length });
    } else if (!closing) {
      // První blok položky seznamu zůstává na řádku s <li>, jak je to v souborech lekcí.
      const top = open[open.length - 1];
      if (top?.tag === 'li' && top.linesAtOpen === lines.length && lines[lines.length - 1].endsWith('<li>')) append(tag);
      else newLine(tag, true);
    } else if (container) {
      const top = open.pop();
      if (name === 'li' && top && top.linesAtOpen === lines.length) append(tag);
      else newLine(tag);
    } else {
      append(tag);
    }
  }
  const rest = out.slice(last);
  if (rest.trim()) append(rest);

  return lines.join('\n').replace(/<pre data-slot="(\d+)"><\/pre>/g, (_, i) => pres[Number(i)]);
}
