import { describe, expect, it } from 'vitest';
import {
  FEEDBACK_COMMENT_MAX, HELP_PROMPT_SECTION_MAX, REWRITE_THRESHOLDS,
  buildHelpPrompt, htmlToText, lessonSections, needsRewrite,
  parseFeedbackAnswer, parseFeedbackDetail, parseSectionsJson,
} from '@lib/feedback';
import { renderMarkdown } from '@lib/markdown';

describe('lessonSections', () => {
  it('prázdné tělo a lekce bez nadpisů nemají žádné části', () => {
    expect(lessonSections('')).toEqual([]);
    expect(lessonSections('   \n ')).toEqual([]);
    expect(lessonSections('<p>Dobré ráno.</p><h2>Velký nadpis</h2><p>Text.</p>')).toEqual([]);
    expect(lessonSections(undefined as unknown as string)).toEqual([]);
  });

  it('rozdělí tělo podle <h3> a zachová pořadí', () => {
    const html = `<p>Úvod, který částí není.</p>
<h3>První část</h3>
<p>Text první části.</p>
<ul><li>Bod A</li><li>Bod B</li></ul>
<h3>Druhá část</h3>
<p>Text druhé části.</p>`;
    expect(lessonSections(html)).toEqual([
      { n: 1, title: 'První část', text: 'Text první části.\n\n- Bod A\n\n- Bod B' },
      { n: 2, title: 'Druhá část', text: 'Text druhé části.' },
    ]);
  });

  it('název je bez vnořených značek a s dekódovanými entitami', () => {
    const html = '<h3 class="x"><strong>1. Co se děje, když <em>Claude</em> &bdquo;pracuje&ldquo; &amp; proč</strong></h3>'
      + '<p>A &lt;b&gt; není značka, 5&nbsp;%&#33; &#x161;</p>';
    const [section] = lessonSections(html);
    expect(section.title).toBe('1. Co se děje, když Claude „pracuje“ & proč');
    expect(section.text).toBe('A <b> není značka, 5 %! š');
    expect(section.title).not.toMatch(/[<>]/);
  });

  it('dvojitě escapovaný text nerozbalí na značku', () => {
    expect(htmlToText('<p>&amp;lt;script&amp;gt;</p>')).toBe('&lt;script&gt;');
  });

  it('nadpis bez textu dostane náhradní název a text části neobsahuje značky', () => {
    const html = '<h3><strong></strong></h3><p>Text <a href="https://example.com">s odkazem</a>.</p><pre><code>kód</code></pre>';
    expect(lessonSections(html)).toEqual([{ n: 1, title: 'Část 1', text: 'Text s odkazem.\n\nkód' }]);
  });

  it('funguje i na lekci psané v Markdownu po převodu na HTML', () => {
    const sections = lessonSections(renderMarkdown('Úvod.\n\n### Jak na to\n\nPrvní krok.\n\n### Shrnutí\n\nHotovo.'));
    expect(sections.map((s) => s.title)).toEqual(['Jak na to', 'Shrnutí']);
    expect(sections[0].text).toBe('První krok.');
  });
});

describe('parseFeedbackAnswer', () => {
  it('přijme jen 1, 2 a 3', () => {
    expect(parseFeedbackAnswer('1')).toBe(1);
    expect(parseFeedbackAnswer(' 3 ')).toBe(3);
    expect(parseFeedbackAnswer(2)).toBe(2);
    for (const bad of ['0', '4', '1.5', '', 'x', '11', null, undefined, true, {}, 2.5]) {
      expect(parseFeedbackAnswer(bad)).toBeNull();
    }
  });
});

describe('parseFeedbackDetail', () => {
  const available = [
    { n: 1, title: 'První', text: 'a' },
    { n: 2, title: 'Druhá', text: 'b' },
    { n: 3, title: 'Třetí', text: 'c' },
  ];

  it('vezme jen existující části, bez opakování, v pořadí lekce a s názvem ze serveru', () => {
    const result = parseFeedbackDetail({ sections: ['3', '1', '3', '9', 'x', '<b>'], comment: '  Příklad mi nedával smysl. ' }, available);
    expect(result).toEqual({
      ok: true,
      value: { sections: [{ n: 1, title: 'První' }, { n: 3, title: 'Třetí' }], comment: 'Příklad mi nedával smysl.' },
    });
  });

  it('prázdné upřesnění je v pořádku', () => {
    expect(parseFeedbackDetail({}, available)).toEqual({ ok: true, value: { sections: [], comment: '' } });
    expect(parseFeedbackDetail({ sections: '2', comment: null }, available)).toEqual({
      ok: true, value: { sections: [{ n: 2, title: 'Druhá' }], comment: '' },
    });
  });

  it('hlídá délku připomínky a konce řádků počítá jako jeden znak', () => {
    const max = 'a'.repeat(FEEDBACK_COMMENT_MAX);
    expect(parseFeedbackDetail({ comment: max }, available).ok).toBe(true);
    expect(parseFeedbackDetail({ comment: `${max}b` }, available)).toEqual({ ok: false, error: 'comment' });
    const withBreaks = `${'a'.repeat(FEEDBACK_COMMENT_MAX - 2)}\r\nb`;
    expect(parseFeedbackDetail({ comment: withBreaks }, available).ok).toBe(true);
    expect(parseFeedbackDetail({ comment: 5 }, available)).toEqual({ ok: false, error: 'comment' });
  });
});

describe('parseSectionsJson', () => {
  it('přečte uložené části a poškozenou hodnotu bere jako prázdnou', () => {
    expect(parseSectionsJson('[{"n":2,"title":"Druhá"}]')).toEqual([{ n: 2, title: 'Druhá' }]);
    expect(parseSectionsJson('[{"n":"2","title":"x"},{"title":"y"},null,{"n":1,"title":"ok"}]')).toEqual([{ n: 1, title: 'ok' }]);
    for (const bad of ['', null, undefined, '{', '{"n":1}', '"text"']) expect(parseSectionsJson(bad)).toEqual([]);
  });
});

describe('buildHelpPrompt', () => {
  it('bez vybrané části vloží název lekce a výzvu', () => {
    const prompt = buildHelpPrompt('Jak psát zadání');
    expect(prompt).toContain('Vysvětli mi jednodušeji tuto část lekce.');
    expect(prompt).toContain('lekci „Jak psát zadání“');
    expect(prompt).toContain('Část lekce: „sem vložte text části, které nerozumíte“');
  });

  it('s vybranou částí vloží její název a text', () => {
    const prompt = buildHelpPrompt('Lekce', { title: '2. Recept', text: 'Řekněte, kdo jste.\n\n- Bod' });
    expect(prompt.endsWith('Část lekce: „2. Recept\n\nŘekněte, kdo jste.\n\n- Bod“')).toBe(true);
    expect(prompt).toContain('na konci mi polož jednu otázku');
  });

  it('dlouhou část zkrátí', () => {
    const prompt = buildHelpPrompt('Lekce', { title: 'Dlouhá', text: 'x'.repeat(HELP_PROMPT_SECTION_MAX + 50) });
    expect(prompt).toContain(`${'x'.repeat(HELP_PROMPT_SECTION_MAX)}…“`);
    expect(prompt).not.toContain('x'.repeat(HELP_PROMPT_SECTION_MAX + 1));
  });
});

describe('needsRewrite', () => {
  it('prahy jsou podle zadání', () => {
    expect(REWRITE_THRESHOLDS).toEqual({
      on_click: { minAnswers: 20, minShare: 0.15 },
      next_workday: { minAnswers: 10, minShare: 0.30 },
    });
  });

  it('chce dost odpovědí i dost velký podíl odpovědi 3', () => {
    expect(needsRewrite('on_click', 19, 19)).toBe(false);
    expect(needsRewrite('on_click', 20, 2)).toBe(false);
    expect(needsRewrite('on_click', 20, 3)).toBe(true);
    expect(needsRewrite('next_workday', 9, 9)).toBe(false);
    expect(needsRewrite('next_workday', 10, 2)).toBe(false);
    expect(needsRewrite('next_workday', 10, 3)).toBe(true);
    expect(needsRewrite('next_workday', 0, 0)).toBe(false);
  });
});

describe('formatDuration', () => {
  it('volí jednotku podle délky', async () => {
    const { formatDuration } = await import('@lib/feedback');
    expect(formatDuration(20)).toBe('1 min');
    expect(formatDuration(45 * 60)).toBe('45 min');
    expect(formatDuration(3 * 3600)).toBe('3 h');
    expect(formatDuration(47 * 3600)).toBe('47 h');
    expect(formatDuration(5 * 86400)).toBe('5 d');
    expect(formatDuration(-1)).toBe('–');
    expect(formatDuration(Number.NaN)).toBe('–');
  });
});
