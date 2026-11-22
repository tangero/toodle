import { describe, expect, it } from 'vitest';
import { invitationEmail } from '@lib/email-templates/invitation';
import { feedbackReplyEmail, plainTextToParagraphs } from '@lib/email-templates/feedback-reply';
import { buildReplyPayload, cleanReplyDraft, REPLY_MAX_LENGTH, stripEmoji, type FeedbackReplyContext } from '@lib/feedback-reply';

const APP = 'https://skola.example';

describe('pozvánka', () => {
  const html = invitationEmail({
    courses: [{ slug: 'chatgpt', title: 'Začínáme s ChatGPT', lesson_count: 15 }, { slug: 'b', title: 'A & B', lesson_count: 3 }],
    appUrl: APP,
    optOutUrl: `${APP}/odhlaseni-nabidek/tok`,
  });

  it('osloví bez jména, escapuje názvy, vypíše kurzy s počtem lekcí', () => {
    expect(html).toContain('>Dobrý den,</p>');
    expect(html).toContain('A &amp; B');
    expect(html).toContain('15 lekcí');
    expect(html).toContain('3 lekce');
    expect(html).toContain(`${APP}/kurz/chatgpt`);
  });

  it('má odkaz na odhlášení nabídek a podpis', () => {
    expect(html).toContain(`${APP}/odhlaseni-nabidek/tok`);
    expect(html).toContain('Tým Školy AI, Patrick a Andrea');
  });
});

describe('odpověď na připomínku', () => {
  it('escapuje text a zachová odstavce', () => {
    expect(plainTextToParagraphs('První <i>odstavec</i>\nřádek\n\nDruhý')).toContain('První &lt;i&gt;odstavec&lt;/i&gt;<br>řádek');
    expect(plainTextToParagraphs('a\n\n\n b').match(/<p /g)).toHaveLength(2);
  });

  it('cituje připomínku, jinak jmenuje označené části', () => {
    const base = { name: 'Jana', courseTitle: 'Kurz', lessonTitle: 'Lekce', body: 'Vysvětlení.', appUrl: APP };
    expect(feedbackReplyEmail({ ...base, comment: 'Co je <prompt>?', sections: [] })).toContain('Co je &lt;prompt&gt;?');
    const noComment = feedbackReplyEmail({ ...base, comment: '', sections: ['Kontext'] });
    expect(noComment).toContain('„Kontext“');
  });
});

describe('úprava návrhu od modelu', () => {
  it('odstraní emoji, oslovení, podpis a Markdown', () => {
    const raw = 'Dobrý den,\n\n**Kontext** je to, co modelu řeknete předem. 🙂\n\n## Příklad\nTřeba zadání.\n\nS pozdravem\nTým';
    expect(cleanReplyDraft(raw)).toBe('Kontext je to, co modelu řeknete předem. \n\nPříklad\nTřeba zadání.');
    expect(stripEmoji('ok ✅👍🏽 ❤️')).toBe('ok  ');
  });

  it('omezí délku', () => {
    expect(cleanReplyDraft('x'.repeat(REPLY_MAX_LENGTH + 50)).length).toBe(REPLY_MAX_LENGTH + 1);
  });
});

describe('podklady pro model', () => {
  it('posílá jen označené části, které v lekci opravdu jsou', () => {
    const ctx = {
      answer: 3,
      comment: 'Nerozumím kontextu',
      sections_json: JSON.stringify([{ n: 1, title: 'Kontext' }, { n: 9, title: 'Neexistuje' }]),
      course_title: 'Kurz',
      lesson_title: 'Lekce',
      lesson_body: '<p>Úvod</p><h3>Kontext</h3><p>Text o kontextu.</p><h3>Další</h3><p>Jiný text.</p>',
    } as FeedbackReplyContext;
    const payload = buildReplyPayload(ctx);
    expect(payload.oznacene_casti).toEqual([{ nazev: 'Kontext', text: 'Text o kontextu.' }]);
    expect(payload.odpoved_ctenare).toBe('nerozuměl jsem');
    expect(payload.text_lekce).toContain('Jiný text.');
  });
});

