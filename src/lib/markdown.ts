import { marked } from 'marked';

export function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return sanitizeMarkup(raw);
}

const ALLOWED_TAGS = new Set([
  'a', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'h4', 'h5',
  'h6', 'hr', 'li', 'ol', 'p', 'pre', 'strong', 'table', 'tbody', 'td', 'th',
  'thead', 'tr', 'ul',
]);

const VOID_TAGS = new Set(['br', 'hr']);

function sanitizeMarkup(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g, (tag, rawName, attrs) => {
      const name = String(rawName).toLowerCase();
      const closing = tag.startsWith('</');

      if (!ALLOWED_TAGS.has(name)) return '';
      if (closing) return VOID_TAGS.has(name) ? '' : `</${name}>`;
      if (VOID_TAGS.has(name)) return `<${name}>`;

      if (name === 'a') {
        const href = getAttribute(String(attrs), 'href');
        if (!href || !isAllowedHref(href)) {
          return '<a>';
        }
        return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer nofollow">`;
      }

      if (name === 'td' || name === 'th') {
        const align = getAttribute(String(attrs), 'align');
        if (align && ['left', 'center', 'right'].includes(align.toLowerCase())) {
          return `<${name} align="${align.toLowerCase()}">`;
        }
      }

      return `<${name}>`;
    });
}

function getAttribute(attrs: string, name: string): string | null {
  const match = attrs.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i'));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function isAllowedHref(href: string): boolean {
  const trimmed = href.trim().toLowerCase();
  return trimmed.startsWith('https://')
    || trimmed.startsWith('http://')
    || trimmed.startsWith('mailto:')
    || trimmed.startsWith('/');
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
