import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@lib/markdown';

describe('renderMarkdown', () => {
  it('zachová číselný start číslovaného seznamu', () => {
    expect(renderMarkdown('<ol start="3"><li><p>Třetí krok</p></li></ol>')).toContain('<ol start="3">');
  });

  it('zahodí nečíselný start a ostatní atributy seznamu', () => {
    const html = renderMarkdown('<ol start="3 onclick=x" class="a" onclick="alert(1)"><li>Krok</li></ol>');
    expect(html).toContain('<ol>');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('class');
  });

  it('odstraní skripty a nepovolené značky, text ponechá', () => {
    const html = renderMarkdown('<p>Ahoj <script>alert(1)</script><img src=x onerror=alert(1)><span>světe</span></p>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('světe');
  });

  it('znak & v adrese odkazu nezakóduje dvakrát', () => {
    const expected = '<a href="https://example.com/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer nofollow">';
    // Zakódovaný zápis (takhle ukládá vizuální editor), holý zápis i odkaz psaný v Markdownu dají totéž.
    expect(renderMarkdown('<p><a href="https://example.com/?a=1&amp;b=2">x</a></p>')).toContain(expected);
    expect(renderMarkdown('<p><a href="https://example.com/?a=1&b=2">x</a></p>')).toContain(expected);
    expect(renderMarkdown('[x](https://example.com/?a=1&b=2)')).toContain(expected);
    expect(renderMarkdown('<a href="https://example.com/?q=&quot;x&quot;">x</a>')).toContain('href="https://example.com/?q=&quot;x&quot;"');
    expect(renderMarkdown('<a href="java&amp;#115;cript:alert(1)">x</a>')).toContain('<a>');
  });

  it('u odkazu nechá jen bezpečný href', () => {
    expect(renderMarkdown('<a href="javascript:alert(1)">x</a>')).toContain('<a>');
    expect(renderMarkdown('<a href="https://example.com/" onclick="x()">x</a>'))
      .toContain('<a href="https://example.com/" target="_blank" rel="noopener noreferrer nofollow">');
  });
});
