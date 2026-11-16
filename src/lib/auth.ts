import { generateId, getOne, run } from './db';
import { toSqlDateTime } from './time';
import type { User, MagicLink } from './types';
import type { D1Database } from '@cloudflare/workers-types';

const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

/** Platnost přihlašovacího odkazu. */
export const LOGIN_LINK_TTL_MINUTES = 15;
/** Platnost odkazu pro potvrzení zápisu (double opt-in) – lidé ho často otevřou později. */
export const CONFIRM_LINK_TTL_MINUTES = 48 * 60;
/** Kolik odkazů smí jeden uživatel dostat za hodinu. */
export const MAX_LINKS_PER_HOUR = 3;

// --- Tokens ---

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** V DB ukládáme jen SHA-256 hash tokenu – únik databáze tak neumožní přihlášení. */
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// --- Magic Links ---

export async function createMagicLink(
  db: D1Database,
  userId: string,
  ttlMinutes: number = LOGIN_LINK_TTL_MINUTES,
): Promise<string> {
  const token = generateToken();
  const now = new Date();
  const expiresAt = toSqlDateTime(new Date(now.getTime() + ttlMinutes * 60 * 1000));

  await run(
    db,
    `INSERT INTO magic_links (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    await hashToken(token),
    userId,
    expiresAt,
    toSqlDateTime(now),
  );

  return token;
}

/** Počet odkazů vytvořených pro uživatele za poslední hodinu (sdílený limit napříč instancemi). */
export async function countRecentMagicLinks(db: D1Database, userId: string): Promise<number> {
  const row = await getOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM magic_links WHERE user_id = ? AND created_at > datetime('now', '-1 hour')`,
    userId,
  );
  return row?.count ?? 0;
}

/** Jednorázově spotřebuje token. Vrací userId, nebo null (neplatný, použitý, prošlý). */
export async function verifyMagicLink(
  db: D1Database,
  token: string,
): Promise<string | null> {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const hash = await hashToken(token);

  // Atomické spotřebování – souběžné požadavky nemohou token použít dvakrát.
  const result = await run(
    db,
    `UPDATE magic_links SET used_at = datetime('now')
     WHERE token = ? AND used_at IS NULL AND datetime(expires_at) > datetime('now')`,
    hash,
  );
  if (!result.meta.changes) return null;

  const link = await getOne<Pick<MagicLink, 'user_id'>>(
    db,
    `SELECT user_id FROM magic_links WHERE token = ?`,
    hash,
  );
  return link?.user_id ?? null;
}

// --- JWT Sessions (using Web Crypto HMAC-SHA256) ---

interface JwtPayload {
  sub: string; // userId
  exp: number; // expiry timestamp
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function base64url(data: ArrayBuffer | Uint8Array): string {
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function createSession(
  userId: string,
  jwtSecret: string,
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JwtPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64url(encoder.encode(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;

  const key = await getSigningKey(jwtSecret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data),
  );

  return `${data}.${base64url(signature)}`;
}

export async function verifySession(
  token: string,
  jwtSecret: string,
): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    const key = await getSigningKey(jwtSecret);
    const encoder = new TextEncoder();
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlDecode(signatureB64),
      encoder.encode(data),
    );

    if (!valid) return null;

    const payload: JwtPayload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payloadB64)),
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload.sub;
  } catch {
    return null;
  }
}

// --- Cookie helpers ---

const SESSION_COOKIE = 'session';

export function getSessionCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;

  const match = cookie.split(';').find((c) => c.trim().startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;

  return match.slice(match.indexOf('=') + 1).trim() || null;
}

export function setSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${JWT_EXPIRY_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// --- User helpers ---

/** Najde uživatele podle e-mailu, nebo ho založí. Jméno existujícího uživatele nemění. */
export async function findOrCreateUser(
  db: D1Database,
  email: string,
  name: string,
): Promise<User> {
  const normalized = email.toLowerCase();
  // ON CONFLICT: souběžné objednávky se stejným e-mailem nespadnou na UNIQUE.
  await run(
    db,
    `INSERT INTO users (id, email, name) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING`,
    generateId(),
    normalized,
    name,
  );
  const user = await getOne<User>(db, `SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`, normalized);
  if (!user) throw new Error('findOrCreateUser: uživatel nenalezen');
  return user;
}

/** Označí e-mail jako ověřený (uživatel prokázal přístup ke schránce). */
export async function markUserVerified(db: D1Database, userId: string): Promise<void> {
  await run(db, `UPDATE users SET verified_at = datetime('now') WHERE id = ? AND verified_at IS NULL`, userId);
}

export async function isAdmin(
  email: string,
  adminEmail: string,
): Promise<boolean> {
  return email.toLowerCase() === adminEmail.toLowerCase();
}
