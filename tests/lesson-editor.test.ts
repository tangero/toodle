// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Editor } from '@tiptap/core';
import { renderMarkdown } from '@lib/markdown';
import {
  EDITOR_TAGS,
  formatLessonHtml,
  toEditorHtml,
  unsupportedTags,
} from '@lib/lesson-editor';
import { lessonEditorExtensions } from '@lib/lesson-editor-extensions';

const DIR = join(__dirname, '..', 'docs', 'course-content');

/** Tělo lekce ze souboru, stejným výrazem jako scripts/import-courses.mjs. */
function lessonBodies(): { file: string; html: string }[] {
  return readdirSync(DIR)
    .filter((f) => /-lesson-\d+\.md$/.test(f))
    .map((file) => {
      const body = readFileSync(join(DIR, file), 'utf8').match(/```html\n([\s\S]*?)\n```/);
      return { file, html: body ? body[1].trim() : '' };
    })
    .filter((l) => l.html);
}

/** Projde editorem tam a zpět, jako když admin lekci otevře, upraví a uloží. */
function roundTrip(content: string): string {
  const editor = new Editor({ extensions: lessonEditorExtensions(), content: toEditorHtml(content) });
  const out = formatLessonHtml(editor.getHTML());
  editor.destroy();
  return out;
}

/** Porovnává se to, co uvidí čtenář: vyčištěné HTML bez mezer mezi značkami. */
function rendered(content: string): string {
  return renderMarkdown(content)
    .replace(/&nbsp;/g, ' ')
    .replace(/>\s+</g, '><')
    // Konec řádku za <br> ve zdroji prohlížeč nezobrazí.
    .replace(/<br>\s+/g, '<br>')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('vizuální editor lekcí', () => {
  const lessons = lessonBodies();

  it('najde lekce k ověření', () => {
    expect(lessons.length).toBeGreaterThan(20);
  });

  it('žádná lekce neobsahuje značku, kterou by editor zahodil', () => {
    const blocked = lessons
      .map((l) => ({ file: l.file, tags: unsupportedTags(l.html) }))
      .filter((l) => l.tags.length > 0);
    expect(blocked).toEqual([]);
  });

  it('průchod editorem nezmění, co čtenář uvidí', () => {
    for (const lesson of lessons) {
      expect(rendered(roundTrip(lesson.html)), lesson.file).toBe(rendered(lesson.html));
    }
  });

  it('ukládá jen značky, které propustí filtr', () => {
    for (const lesson of lessons) {
      const out = roundTrip(lesson.html);
      for (const match of out.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)/g)) {
        expect(EDITOR_TAGS.has(match[1]), `${lesson.file}: <${match[1]}>`).toBe(true);
      }
      expect(out).not.toMatch(/\s(class|style)=/);
    }
  });

  it('pozná značky, které vizuální režim neumí', () => {
    expect(unsupportedTags('<p>Text</p><h3>Část</h3>')).toEqual([]);
    expect(unsupportedTags('<h2>Nadpis</h2><table><tr><td>a</td></tr></table>')).toEqual([
      'h2', 'table', 'td', 'tr',
    ]);
    expect(unsupportedTags('# Nadpis\n\nText ~~pryč~~')).toEqual(['del', 'h1']);
  });

  it('nevytvoří přeškrtnutí, podtržení ani jiný nadpis než h3', () => {
    const out = roundTrip('<p>a</p>');
    expect(out).toBe('<p>a</p>');
    const editor = new Editor({ extensions: lessonEditorExtensions(), content: '<p>a</p>' });
    const names = editor.extensionManager.extensions.map((e) => e.name);
    editor.destroy();
    expect(names).not.toContain('strike');
    expect(names).not.toContain('underline');
  });

  it('otevření lekce samo nic nezmění (verze lekce se nesmí zvednout bez úpravy)', () => {
    let updates = 0;
    for (const lesson of lessons) {
      const editor = new Editor({
        extensions: lessonEditorExtensions(),
        content: toEditorHtml(lesson.html),
        onUpdate: () => { updates += 1; },
      });
      editor.destroy();
    }
    const endsWithList = new Editor({
      extensions: lessonEditorExtensions(),
      content: '<p>a</p><ul><li><p>b</p></li></ul>',
      onUpdate: () => { updates += 1; },
    });
    expect(endsWithList.getHTML()).toBe('<p>a</p><ul><li><p>b</p></li></ul>');
    endsWithList.destroy();
    expect(updates).toBe(0);
  });

  it('rozepíše výstup do tvaru souborů s lekcemi', () => {
    expect(formatLessonHtml('<p>Jedna</p><h3>Část</h3><ul><li><p>a</p></li><li><p>b</p></li></ul><p>Dva</p>')).toBe(
      '<p>Jedna</p>\n\n<h3>Část</h3>\n\n<ul>\n  <li><p>a</p></li>\n  <li><p>b</p></li>\n</ul>\n\n<p>Dva</p>',
    );
    expect(formatLessonHtml('<p></p>')).toBe('');
    expect(formatLessonHtml('<pre><code>a\n\nb</code></pre><p>c</p>')).toBe('<pre><code>a\n\nb</code></pre>\n\n<p>c</p>');
  });

  it('zachová vnořený seznam a položku s více odstavci', () => {
    const nested = '<ul><li><p>a</p><ul><li><p>b</p></li></ul></li><li><p>c</p><p>d</p></li></ul>';
    expect(rendered(roundTrip(nested))).toBe(rendered(nested));
    expect(rendered(formatLessonHtml(nested))).toBe(rendered(nested));
  });
});
