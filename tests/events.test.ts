import { describe, expect, it } from 'vitest';
import { asWebReferral, eventTipsUrl, parseEventTips } from '@lib/events';

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

describe('eventTipsUrl', () => {
  it('web i e-maily čtou stejný zdroj skola-ai', () => {
    expect(eventTipsUrl()).toBe('https://www.vibecoding.cz/api/event-tips?source=skola-ai');
  });
});

describe('asWebReferral', () => {
  it('přepíše medium na referral a zahodí údaje o vydání e-mailu', () => {
    const url = asWebReferral('https://www.vibecoding.cz/akce/x/2026-11-18/?utm_source=skola-ai&utm_medium=email&utm_campaign=termin_20261118_abc123&utm_content=20261116&utm_term=vsuvka');
    expect(url).toBe('https://www.vibecoding.cz/akce/x/2026-11-18/?utm_source=skola-ai&utm_medium=referral&utm_campaign=termin_20261118_abc123');
  });

  it('doplní zdroj i odkazu se starou značkou', () => {
    expect(asWebReferral('https://www.vibecoding.cz/akce/x/?utm_source=email&utm_medium=aviza&utm_campaign=vsuvka-email'))
      .toBe('https://www.vibecoding.cz/akce/x/?utm_source=skola-ai&utm_medium=referral&utm_campaign=vsuvka-email');
  });

  it('neplatnou adresu vrátí beze změny', () => {
    expect(asWebReferral('nesmysl')).toBe('nesmysl');
  });
});
