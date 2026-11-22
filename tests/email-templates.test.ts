import { describe, expect, it } from 'vitest';
import { baseTemplate, promoBlock, styleProse } from '@lib/email-templates/base';
import { feedbackBlock, lessonEmail } from '@lib/email-templates/lesson';
import { welcomeEmail } from '@lib/email-templates/welcome';
import { completionEmail } from '@lib/email-templates/completion';
import { reminderEmail } from '@lib/email-templates/reminder';
import { magicLinkEmail } from '@lib/email-templates/magic-link';
import { verificationEmail } from '@lib/email-templates/verification';
import { certificateEmail } from '@lib/email-templates/certificate';
import { ratingRequestEmail } from '@lib/email-templates/rating-request';
import { adminDigestEmail } from '@lib/email-templates/admin-digest';
import { renderMarkdown } from '@lib/markdown';
import type { EventTip } from '@lib/events';

const APP = 'https://skola.example';
const OPT_OUT = `${APP}/odhlaseni-nabidek/tok`;
const HEADING = 'Další naše AI vzdělávání';

const tip = (n: number, extra: Partial<EventTip> = {}): EventTip => ({
  label: 'Webinář',
  title: `Akce ${n}`,
  meta: `středa ${n}. 12. 2026`,
  url: `https://www.vibecoding.cz/akce/${n}/`,
  ...extra,
});

describe('promoBlock', () => {
  it('bez akcí vrátí prázdný řetězec', () => {
    expect(promoBlock([], OPT_OUT)).toBe('');
  });

  it('vypíše nadpis, akce a odkaz na odhlášení nabídek', () => {
    const html = promoBlock([tip(1)], OPT_OUT);
    expect(html).toContain(HEADING);
    expect(html).toContain('Webinář · středa 1. 12. 2026');
    expect(html).toContain('<a href="https://www.vibecoding.cz/akce/1/"');
    expect(html).toContain('>Akce 1</a>');
    expect(html).toContain(`<a href="${OPT_OUT}"`);
    expect(html).toContain('Nechci dostávat nabídky');
  });

  it('vloží nejvýš dvě položky', () => {
    const html = promoBlock([tip(1), tip(2), tip(3)], OPT_OUT);
    expect(html).toContain('Akce 1');
    expect(html).toContain('Akce 2');
    expect(html).not.toContain('Akce 3');
    expect(html.match(/vibecoding\.cz\/akce\//g)).toHaveLength(2);
  });

  it('escapuje název, popisky i adresy', () => {
    const html = promoBlock([tip(1, {
      title: '<script>alert(1)</script> & "uvozovky"',
      label: '<b>Kurz</b>',
      meta: 'od 9:00 <img src=x>',
      url: 'https://www.vibecoding.cz/akce/?a=1&b="2"',
    })], `${OPT_OUT}"><script>`);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;uvozovky&quot;');
    expect(html).toContain('href="https://www.vibecoding.cz/akce/?a=1&amp;b=&quot;2&quot;"');
    expect(html).toContain('&lt;b&gt;Kurz&lt;/b&gt;');
  });

  it('vynechá položku bez názvu nebo s adresou mimo https', () => {
    expect(promoBlock([tip(1, { url: 'javascript:alert(1)' }), tip(2, { title: '  ' })], OPT_OUT)).toBe('');
  });

  it('položka bez popisků nemá prázdný řádek s oddělovačem', () => {
    const html = promoBlock([tip(1, { label: '', meta: '' })], OPT_OUT);
    expect(html).not.toContain(' · ');
    expect(html).toContain('Akce 1');
  });
});

describe('styleProse', () => {
  it('doplní inline styly a zachová atributy z renderMarkdown', () => {
    const html = styleProse(renderMarkdown('Text s [odkazem](https://example.com/a?b=1&c=2).\n\n5. pátý bod'));
    expect(html).toMatch(/<p style="[^"]+">Text s <a href="https:\/\/example\.com\/a\?b=1&amp;c=2" target="_blank" rel="noopener noreferrer nofollow" style="[^"]+">odkazem<\/a>/);
    expect(html).toMatch(/<ol start="5" style="[^"]+">/);
  });

  it('nezamění <pre> za <p> ani <thead> za <th>', () => {
    const html = styleProse('<pre><code>x</code></pre><table><thead><tr><th>a</th></tr></thead></table>');
    expect(html).toMatch(/^<pre style="[^"]*white-space:pre-wrap[^"]*"><code style=/);
    expect(html).toContain('<thead><tr><th style=');
  });
});

describe('šablony e-mailů', () => {
  const promo = { tips: [tip(1), tip(2)], optOutUrl: OPT_OUT };
  const lessonBase = {
    courseTitle: 'Kurz <b>X</b>', lessonTitle: 'Název', lessonPosition: 2, totalLessons: 5,
    contentMd: 'Obsah lekce.', readingMinutes: 5, enrollmentId: 'E1', appUrl: APP, unsubscribeToken: 'E1.sig',
  };

  it('základ nese název Škola AI, patičku s IČO a odkaz na zásady', () => {
    const html = baseTemplate('Titulek <x>', '<p>tělo</p>', { appUrl: APP });
    expect(html).toContain('<title>Titulek &lt;x&gt;</title>');
    expect(html).toContain(`&copy; ${new Date().getFullYear()} Škola AI · Patrick Zandl, IČO 43943420`);
    expect(html).toContain(`href="${APP}/ochrana-osobnich-udaju"`);
    expect(html).not.toContain('Letní');
  });

  it('blok nabídek je pod lekcí, v uvítacím a závěrečném e-mailu, jen když jsou podklady', () => {
    const withPromo = [
      lessonEmail({ ...lessonBase, deliveryMode: 'next_workday', promo }),
      welcomeEmail({ courseTitle: 'Kurz', welcomeMd: '', appUrl: APP, promo }),
      completionEmail({ courseTitle: 'Kurz', completionMd: '', enrollmentId: 'E1', appUrl: APP, promo }),
    ];
    for (const html of withPromo) {
      expect(html).toContain(HEADING);
      expect(html).toContain(OPT_OUT);
    }

    const withoutPromo = [
      lessonEmail({ ...lessonBase, deliveryMode: 'next_workday' }),
      welcomeEmail({ courseTitle: 'Kurz', welcomeMd: '', appUrl: APP }),
      completionEmail({ courseTitle: 'Kurz', completionMd: '', enrollmentId: 'E1', appUrl: APP }),
      lessonEmail({ ...lessonBase, deliveryMode: 'next_workday', promo: { tips: [], optOutUrl: OPT_OUT } }),
    ];
    for (const html of withoutPromo) {
      expect(html).not.toContain(HEADING);
      expect(html).not.toContain('odhlaseni-nabidek');
    }
  });

  it('ostatní e-maily blok nabídek nemají', () => {
    const others = [
      magicLinkEmail(`${APP}/prihlaseni/potvrzeni?token=t`, APP),
      verificationEmail(`${APP}/prihlaseni/potvrzeni?token=t`, 'Kurz', APP),
      reminderEmail('Kurz', 3, 'E1', APP, 'E1.sig'),
      certificateEmail('Kurz', 90, `${APP}/certifikat/abc`, APP),
      ratingRequestEmail({ courseTitle: 'Kurz', ratingUrl: `${APP}/hodnoceni/E1.sig`, appUrl: APP }),
    ];
    for (const html of others) expect(html).not.toContain(HEADING);
  });

  it('tlačítka lekce se řídí režimem doručování a poslední lekcí', () => {
    const onClick = lessonEmail({ ...lessonBase, deliveryMode: 'on_click' });
    expect(onClick).toContain('Hotovo, chci další lekci');
    expect(onClick).not.toContain('příští pracovní den');

    const workday = lessonEmail({ ...lessonBase, deliveryMode: 'next_workday' });
    expect(workday).toContain('příští pracovní den');
    expect(workday).not.toContain('Hotovo, chci další lekci');

    for (const deliveryMode of ['on_click', 'next_workday'] as const) {
      const last = lessonEmail({ ...lessonBase, lessonPosition: 5, deliveryMode });
      expect(last).toContain('Přejít na závěrečný test');
      expect(last).not.toContain('Hotovo, chci další lekci');
      expect(last).not.toContain('příští pracovní den');
    }
    expect(workday).toContain(`${APP}/odhlaseni/E1.sig`);
    expect(workday).toContain('Kurz &lt;b&gt;X&lt;/b&gt;');
  });

  it('texty šablon jsou bez emoji, vykřičníků, tykání a staré značky', () => {
    const all = [
      lessonEmail({ ...lessonBase, deliveryMode: 'on_click', promo }),
      lessonEmail({ ...lessonBase, lessonPosition: 5, deliveryMode: 'next_workday', feedbackUrl: `${APP}/srozumitelnost/E1.5.sig` }),
      welcomeEmail({ courseTitle: 'Kurz', welcomeMd: '', firstLessonInfo: 'První lekce přijde zítra.', appUrl: APP, promo }),
      completionEmail({ courseTitle: 'Kurz', completionMd: '', enrollmentId: 'E1', appUrl: APP, promo }),
      magicLinkEmail(`${APP}/x`, APP),
      verificationEmail(`${APP}/x`, 'Kurz', APP),
      reminderEmail('Kurz', 3, 'E1', APP, 'E1.sig'),
      certificateEmail('Kurz', 90, `${APP}/certifikat/abc`, APP),
      ratingRequestEmail({ courseTitle: 'Kurz', ratingUrl: `${APP}/hodnoceni/E1.sig`, appUrl: APP }),
      adminDigestEmail({
        newEnrollments: 1, completedEnrollments: 2, paidOrders: 0, revenue: 0,
        unmatchedPayments: 1, bouncedEmails: 1, date: '16. 11. 2026', appUrl: APP,
      }),
    ];
    for (const html of all) {
      // Viditelný text: bez značek, bloku <style> a deklarace <!DOCTYPE>.
      const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
      expect(text).not.toMatch(/!/);
      expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(text).not.toMatch(/Letní|Ahoj/);
      expect(html).toContain('Škola AI');
    }
  });

  it('otázka na srozumitelnost je jen u denních kurzů, pod lekcí a nad nabídkami', () => {
    const feedbackUrl = `${APP}/srozumitelnost/E1.2.sig`;
    const html = lessonEmail({ ...lessonBase, deliveryMode: 'next_workday', feedbackUrl, promo });
    expect(html).toContain('Jak srozumitelná byla dnešní lekce?');
    for (const answer of [1, 2, 3]) expect(html).toContain(`href="${feedbackUrl}?odpoved=${answer}"`);
    expect(html.indexOf('Obsah lekce.')).toBeLessThan(html.indexOf('Jak srozumitelná'));
    expect(html.indexOf('Jak srozumitelná')).toBeLessThan(html.indexOf(HEADING));
    expect(html.indexOf('?odpoved=1')).toBeLessThan(html.indexOf('?odpoved=2'));
    expect(html.indexOf('?odpoved=2')).toBeLessThan(html.indexOf('?odpoved=3'));

    expect(lessonEmail({ ...lessonBase, deliveryMode: 'on_click', feedbackUrl })).not.toContain('Jak srozumitelná');
    expect(lessonEmail({ ...lessonBase, deliveryMode: 'next_workday' })).not.toContain('Jak srozumitelná');
  });

  it('tři odpovědi na srozumitelnost mají stejný vzhled a adresa se escapuje', () => {
    const html = feedbackBlock(`${APP}/srozumitelnost/E1.2.sig"><script>`);
    expect(html).not.toContain('<script>');
    const styles = [...html.matchAll(/<a href="[^"]*\?odpoved=[123]" style="([^"]*)">([^<]+)<\/a>/g)];
    expect(styles.map((m) => m[2])).toEqual([
      'Rozuměl jsem', 'Něco mi nesedělo', 'Nerozuměl jsem, potřebuji to vysvětlit lépe',
    ]);
    expect(new Set(styles.map((m) => m[1])).size).toBe(1);
  });

  it('žádost o hodnocení vede na formulář s tokenem', () => {
    const html = ratingRequestEmail({
      courseTitle: '<Kurz>', ratingUrl: `${APP}/hodnoceni/E1.sig`, appUrl: APP,
    });
    expect(html).toContain(`href="${APP}/hodnoceni/E1.sig"`);
    expect(html).toContain('&lt;Kurz&gt;');
    expect(html).toContain('>Dobrý den,</p>');
    expect(html).toContain('Tým Školy AI, Patrick a Andrea');
  });
});
