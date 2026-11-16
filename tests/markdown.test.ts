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

  it('u odkazu nechá jen bezpečný href', () => {
    expect(renderMarkdown('<a href="javascript:alert(1)">x</a>')).toContain('<a>');
    expect(renderMarkdown('<a href="https://example.com/" onclick="x()">x</a>'))
      .toContain('<a href="https://example.com/" target="_blank" rel="noopener noreferrer nofollow">');
  });
});
