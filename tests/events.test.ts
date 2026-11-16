import { describe, expect, it } from 'vitest';
import { parseEventTips } from '@lib/events';

describe('parseEventTips', () => {
  it('propustí platnou položku', () => {
    const tips = parseEventTips([
      { label: 'Webinář', title: ' AI First Company ', meta: 'středa 18. 11. 2026', url: 'https://www.vibecoding.cz/akce/x/' },
    ]);
    expect(tips).toEqual([
      { label: 'Webinář', title: 'AI First Company', meta: 'středa 18. 11. 2026', url: 'https://www.vibecoding.cz/akce/x/' },
    ]);
  });

  it('zahodí odkaz mimo vibecoding.cz a položku bez názvu', () => {
    expect(parseEventTips([
      { title: 'Cizí', url: 'https://example.com/' },
      { title: 'Skript', url: 'javascript:alert(1)' },
      { title: '', url: 'https://www.vibecoding.cz/akce/x/' },
      null,
      'text',
    ])).toEqual([]);
  });

  it('vrátí prázdný seznam, když zdroj nepošle pole', () => {
    expect(parseEventTips(undefined)).toEqual([]);
    expect(parseEventTips({ items: [] })).toEqual([]);
  });

  it('chybějící popisky nahradí prázdným textem', () => {
    expect(parseEventTips([{ title: 'Akce', url: 'https://www.vibecoding.cz/a/' }])).toEqual([
      { label: '', title: 'Akce', meta: '', url: 'https://www.vibecoding.cz/a/' },
    ]);
  });
});
