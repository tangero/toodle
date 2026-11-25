import { describe, expect, it } from 'vitest';
import {
  DEFAULT_INVITATION_MD,
  INVITATION_BODY_MAX,
  INVITATION_PREHEADER_MAX,
  INVITATION_SUBJECT_MAX,
  invitationEmail,
  validateInvitationTemplateInput,
} from '@lib/email-templates/invitation';
import { feedbackReplyEmail, plainTextToParagraphs } from '@lib/email-templates/feedback-reply';
import { buildReplyPayload, cleanReplyDraft, REPLY_MAX_LENGTH, stripEmoji, type FeedbackReplyContext } from '@lib/feedback-reply';

const APP = 'https://skola.example';

describe('pozvánka', () => {
  const courses = [
    { slug: 'chatgpt', title: 'Začínáme s ChatGPT', lesson_count: 15 },
    { slug: 'b', title: 'A & B', lesson_count: 3 },
  ];
  const html = invitationEmail({
    courses,
    appUrl: APP,
    optOutUrl: `${APP}/odhlaseni-nabidek/tok`,
  });

  it('osloví bez jména, escapuje názvy, vypíše kurzy s počtem lekcí', () => {
    expect(html).toContain('>Dobrý den,</p>');
    expect(html).toContain('A &amp; B');
    expect(html).toContain('15 lekcí');
    expect(html).toContain('3 lekce');
    expect(html).toContain(`${APP}/kurz/chatgpt`);
    expect(html).not.toMatch(/<p[^>]*>\s*<ul/);
    expect(html).not.toMatch(/<p[^>]*>\s*<table/);
  });

  it('má odkaz na odhlášení nabídek a podpis', () => {
    expect(html).toContain(`${APP}/odhlaseni-nabidek/tok`);
    expect(html).toContain('Tým Školy AI, Patrick a Andrea');
  });

  it('renderuje vlastní Markdown, zástupné značky a relativní odkazy', () => {
    const custom = invitationEmail({
      courses,
      appUrl: `${APP}/`,
      optOutUrl: `${APP}/odhlaseni-nabidek/tok`,
      subject: 'Vlastní <předmět>',
      preheader: 'Krátký & náhled',
      bodyMd: [
        '## Novinky',
        '',
        'Podívejte se na **kurzy** na [webu](/obce) nebo na {{url}}/kurzy.',
        '',
        '{{kurzy}}',
        '',
        '{{tlacitko:Zapsat se & začít|https://skola.example/kurz/chatgpt?a=1&b=2}}',
        '',
        '{{tlacitko:Relativní|/prihlaseni}}',
      ].join('\n'),
    });
    expect(custom).toContain('<title>Vlastní &lt;předmět&gt;</title>');
    expect(custom).toContain('Krátký &amp; náhled');
    expect(custom).toMatch(/<h2 style="[^"]+">Novinky<\/h2>/);
    expect(custom).toContain('<strong>kurzy</strong>');
    expect(custom).toContain(`href="${APP}/obce"`);
    expect(custom).toContain(`${APP}/kurzy`);
    expect(custom).toContain('Zapsat se &amp; začít');
    expect(custom).toContain('href="https://skola.example/kurz/chatgpt?a=1&amp;b=2"');
    expect(custom).toContain(`href="${APP}/prihlaseni"`);
    expect(custom).toContain(`${APP}/odhlaseni-nabidek/tok`);
  });

  it('sanitizuje nebezpečný vstup a odmítne neplatnou adresu v tlačítku', () => {
    const unsafe = invitationEmail({
      courses,
      appUrl: APP,
      optOutUrl: `${APP}/odhlaseni-nabidek/tok`,
      bodyMd: '<script>alert(1)</script>\n\n[klik](javascript:alert(1))\n\n{{tlacitko:Pozor|javascript:alert(1)}}',
    });
    expect(unsafe).not.toContain('<script>');
    expect(unsafe).not.toContain('javascript:');
    expect(unsafe).toContain(`href="${APP}/#kurzy"`);
    expect(unsafe).toContain(`${APP}/odhlaseni-nabidek/tok`);
  });

  it('výchozí text má podpis s mezerou a drobnou poznámku', () => {
    expect(html).toMatch(/<p style="[^"]*margin-top:24px;">Tým Školy AI, Patrick a Andrea<\/p>/);
    expect(html).toMatch(/<p style="[^"]*font-size:14px[^"]*">Zápis zabere minutu/);
    expect(html).not.toContain('{{');
  });

  it('blokové značky mimo samostatný řádek nevloží do odstavce ani kódu', () => {
    const render = (bodyMd: string) =>
      invitationEmail({ courses, appUrl: APP, optOutUrl: `${APP}/odhlaseni-nabidek/tok`, bodyMd });
    for (const bodyMd of [
      'Kurzy:\n{{kurzy}}',
      'Klikněte {{tlacitko:Jít}} teď',
      'Seznam `{{kurzy}}` a dál',
      '    {{kurzy}}',
      '- bod\n- {{tlacitko:Jít}}',
      'Text {{podpis}}',
    ]) {
      const out = render(bodyMd);
      expect(out, bodyMd).not.toMatch(/<p[^>]*>(?:(?!<\/p>)[\s\S])*<(?:ul|table|p)[\s>]/);
      expect(out, bodyMd).not.toMatch(/<(?:code|pre)[^>]*>(?:(?!<\/(?:code|pre)>)[\s\S])*<(?:ul|table)/);
      expect(out, bodyMd).not.toContain('XINVBLK');
    }
    expect(render('Kurzy:\n{{kurzy}}')).toContain(`${APP}/kurz/chatgpt`);
    expect(render('Klikněte {{tlacitko:Jít}} teď')).toContain('>Jít<');
  });

  it('odkaz bez protokolu doplní na https', () => {
    const out = invitationEmail({
      courses, appUrl: APP, optOutUrl: `${APP}/odhlaseni-nabidek/tok`, bodyMd: '[x](//example.com/a)',
    });
    expect(out).toContain('href="https://example.com/a"');
    expect(out).not.toContain('href="//');
  });

  it('validuje vstup šablony pozvánky', () => {
    expect(validateInvitationTemplateInput({ subject: '  ', body_md: 'ok' })).toMatchObject({ ok: false });
    expect(validateInvitationTemplateInput({ subject: 'Předmět', body_md: '   ' })).toMatchObject({ ok: false });
    expect(validateInvitationTemplateInput({ subject: 'x'.repeat(INVITATION_SUBJECT_MAX + 1), body_md: 'ok' })).toMatchObject({ ok: false });
    expect(validateInvitationTemplateInput({ subject: 'ok', preheader: 'x'.repeat(INVITATION_PREHEADER_MAX + 1), body_md: 'ok' })).toMatchObject({ ok: false });
    expect(validateInvitationTemplateInput({ subject: 'ok', body_md: 'x'.repeat(INVITATION_BODY_MAX + 1) })).toMatchObject({ ok: false });
    expect(validateInvitationTemplateInput({
      subject: '  Předmět\nřádek  ',
      preheader: '  Náhled  ',
      body_md: `  ${DEFAULT_INVITATION_MD}\r\n`,
    })).toEqual({
      ok: true,
      value: {
        subject: 'Předmět řádek',
        preheader: 'Náhled',
        body_md: DEFAULT_INVITATION_MD,
      },
    });
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

