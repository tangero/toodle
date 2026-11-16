/**
 * Podepsané odkazy z e-mailů (HMAC-SHA256), které fungují bez přihlášení.
 *
 * Token má tvar `<id>.<podpis hex>`. Každý účel podepisuje jinou zprávu, takže token
 * vydaný pro jeden účel neprojde ověřením pro jiný:
 * - `course`: odhlášení z kurzu, id = zápis. Podepisuje se holé id – tak vznikaly tokeny
 *   od začátku a odkazy v už odeslaných e-mailech musí dál platit.
 * - `promo`:  odhlášení nabídek dalšího vzdělávání, id = uživatel. Zpráva `promo:<id>`.
 * - `rating`: hodnocení kurzu, id = zápis. Zpráva `rating:<id>`.
 */
export type TokenPurpose = 'course' | 'promo' | 'rating';

/** ID jsou ULID: jen písmena, číslice, pomlčka a podtržítko. Dvojtečka v id by dovolila účel podvrhnout. */
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_TOKEN_LENGTH = 200;

function signedMessage(purpose: TokenPurpose, id: string): string {
  return purpose === 'course' ? id : `${purpose}:${id}`;
}

export async function createSignedToken(purpose: TokenPurpose, id: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedMessage(purpose, id)));
  const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${id}.${sigHex}`;
}

/** Vrátí id, pro které byl token vydán, nebo null (jiný účel, poškozený token, cizí klíč). */
export async function verifySignedToken(purpose: TokenPurpose, token: string, secret: string): Promise<string | null> {
  if (typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  if (!ID_RE.test(id)) return null;
  const expected = await createSignedToken(purpose, id, secret);
  return timingSafeEqual(expected, token) ? id : null;
}

/** Odhlášení z kurzu (id zápisu). */
export function createUnsubscribeToken(enrollmentId: string, jwtSecret: string): Promise<string> {
  return createSignedToken('course', enrollmentId, jwtSecret);
}

export function verifyUnsubscribeToken(token: string, jwtSecret: string): Promise<string | null> {
  return verifySignedToken('course', token, jwtSecret);
}

/** Odhlášení nabídek dalšího vzdělávání (id uživatele). Lekce chodí dál. */
export function createPromoOptOutToken(userId: string, jwtSecret: string): Promise<string> {
  return createSignedToken('promo', userId, jwtSecret);
}

export function verifyPromoOptOutToken(token: string, jwtSecret: string): Promise<string | null> {
  return verifySignedToken('promo', token, jwtSecret);
}

/** Odkaz na hodnocení kurzu (id zápisu). */
export function createRatingToken(enrollmentId: string, jwtSecret: string): Promise<string> {
  return createSignedToken('rating', enrollmentId, jwtSecret);
}

export function verifyRatingToken(token: string, jwtSecret: string): Promise<string | null> {
  return verifySignedToken('rating', token, jwtSecret);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
