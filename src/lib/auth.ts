import { generateId, getOne, run } from './db';
import type { User, MagicLink } from './types';

const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days
const MAGIC_LINK_EXPIRY_MINUTES = 15;

// --- ULID-based token generation ---

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// --- Magic Links ---

export async function createMagicLink(
  db: D1Database,
  userId: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000,
  ).toISOString();

  await run(
    db,
    `INSERT INTO magic_links (token, user_id, expires_at) VALUES (?, ?, ?)`,
    token,
    userId,
    expiresAt,
  );

  return token;
}

export async function verifyMagicLink(
  db: D1Database,
  token: string,
): Promise<string | null> {
  const link = await getOne<MagicLink>(
    db,
    `SELECT * FROM magic_links WHERE token = ?`,
    token,
  );

  if (!link) return null;
  if (link.used_at) return null;
  if (new Date(link.expires_at) < new Date()) return null;

  await run(
    db,
    `UPDATE magic_links SET used_at = datetime('now') WHERE token = ?`,
    token,
  );

  return link.user_id;
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

function base64urlDecode(str: string): Uint8Array {
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

  return match.split('=')[1]?.trim() ?? null;
}

export function setSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${JWT_EXPIRY_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

// --- User helpers ---

export async function findOrCreateUser(
  db: D1Database,
  email: string,
  name: string,
): Promise<User> {
  const existing = await getOne<User>(
    db,
    `SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`,
    email.toLowerCase(),
  );

  if (existing) return existing;

  const id = generateId();
  await run(
    db,
    `INSERT INTO users (id, email, name) VALUES (?, ?, ?)`,
    id,
    email.toLowerCase(),
    name,
  );

  return {
    id,
    email: email.toLowerCase(),
    name,
    created_at: new Date().toISOString(),
    verified_at: null,
    deleted_at: null,
  };
}

export async function isAdmin(
  email: string,
  adminEmail: string,
): Promise<boolean> {
  return email.toLowerCase() === adminEmail.toLowerCase();
}
