/** Escapování textu pro vložení do HTML (obsah i hodnoty atributů v uvozovkách). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Bezpečný interní cíl přesměrování: jen relativní cesta na stejném webu. */
export function safeRedirectPath(value: unknown, fallback = '/profil'): string {
  if (typeof value !== 'string') return fallback;
  const v = value.trim();
  if (!v.startsWith('/') || v.startsWith('//') || v.startsWith('/\\') || v.length > 300) return fallback;
  return v;
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

/**
 * Jméno zadané veřejně ve formuláři. Povolujeme jen písmena (vč. diakritiky),
 * mezery, tečku, apostrof a pomlčku – jméno se propisuje do e-mailů a certifikátu,
 * takže nesmí obsahovat odkazy ani HTML.
 */
export function normalizeName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < 1 || name.length > 80) return null;
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u.test(name)) return null;
  return name;
}
