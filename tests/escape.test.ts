import { describe, it, expect } from 'vitest';
import { escapeHtml, normalizeName, normalizeEmail, safeRedirectPath } from '../src/lib/escape';
import { verificationEmail } from '../src/lib/email-templates/verification';
import { welcomeEmail } from '../src/lib/email-templates/welcome';
import { lessonEmail } from '../src/lib/email-templates/lesson';

describe('escapeHtml', () => {
  it('escapuje HTML znaky', () => {
    expect(escapeHtml('<a href="x">\'&')).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
  });
});

describe('e-mailové šablony neposílají HTML ze vstupu', () => {
  const evil = '<a href="https://phish.example">Klikněte</a>';
  it('potvrzovací e-mail', () => {
    const html = verificationEmail('https://skola.example/x', evil, 'Kurz', 'https://skola.example');
    expect(html).not.toContain('<a href="https://phish.example">');
    expect(html).toContain('&lt;a href=&quot;https://phish.example&quot;&gt;');
  });
  it('uvítací e-mail a lekce', () => {
    const welcome = welcomeEmail({
      name: evil, courseTitle: evil, welcomeMd: '', firstLessonInfo: evil, appUrl: 'https://skola.example',
    });
    expect(welcome).not.toContain('<a href="https://phish');
    expect(welcome).toContain('&lt;a href=&quot;https://phish.example&quot;&gt;');
    const lesson = lessonEmail({
      courseTitle: evil, lessonTitle: evil, lessonPosition: 1, totalLessons: 2,
      contentMd: 'Obsah', readingMinutes: 5, deliveryMode: 'next_workday', enrollmentId: 'e1',
      appUrl: 'https://skola.example', unsubscribeToken: 't',
    });
    expect(lesson).not.toContain('<a href="https://phish');
  });
});

describe('validace vstupů', () => {
  it('jméno: česká jména projdou, odkazy a HTML ne', () => {
    expect(normalizeName('  Jiří   Kočvara ')).toBe('Jiří Kočvara');
    expect(normalizeName("Anne-Marie O'Neil")).toBe("Anne-Marie O'Neil");
    expect(normalizeName('<b>x</b>')).toBeNull();
    expect(normalizeName('Navštivte www.phish.cz/login')).toBeNull();
    expect(normalizeName('https://phish.cz')).toBeNull();
    expect(normalizeName('a'.repeat(81))).toBeNull();
  });
  it('e-mail', () => {
    expect(normalizeEmail(' Jan@Example.CZ ')).toBe('jan@example.cz');
    expect(normalizeEmail('bez-zavinace')).toBeNull();
    expect(normalizeEmail('a@b')).toBeNull();
  });
  it('redirect: jen interní cesty', () => {
    expect(safeRedirectPath('/profil/kurz/1')).toBe('/profil/kurz/1');
    expect(safeRedirectPath('//evil.example')).toBe('/profil');
    expect(safeRedirectPath('https://evil.example')).toBe('/profil');
    expect(safeRedirectPath('/\\evil.example')).toBe('/profil');
  });
});
