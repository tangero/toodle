import { defineMiddleware } from 'astro:middleware';
import { getSessionCookie, verifySession, isAdmin } from '@lib/auth';
import { getOne } from '@lib/db';
import type { User } from '@lib/types';
import { env } from '@lib/env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cesty, které legitimně přijímají POST z jiného původu:
 * - odhlášení jedním kliknutím (posílá ho poštovní klient),
 * - webhook Resendu (ověřuje se podpisem),
 * - crony (volá je scheduled handler, ověřují se X-Cron-Secret).
 */
const CROSS_ORIGIN_ALLOWED = ['/api/unsubscribe/', '/api/webhooks/', '/api/cron/'];

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  // Skripty neomezujeme (Astro hydratace používá inline skripty); blokujeme vkládání
  // do rámů, pluginy, podvržení <base> a odesílání formulářů jinam.
  'Content-Security-Policy': "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function withSecurityHeaders(response: Response): Response {
  let res = response;
  try {
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      if (!res.headers.has(k)) res.headers.set(k, v);
    }
  } catch {
    // Neměnné hlavičky (např. Response.redirect) – vytvoříme kopii.
    res = new Response(response.body, response);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      if (!res.headers.has(k)) res.headers.set(k, v);
    }
  }
  return res;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, url } = context;
  const path = url.pathname;

  // CSRF: náhrada za Astro security.checkOrigin (ten nejde omezit jen na část cest).
  if (!SAFE_METHODS.has(request.method) && !CROSS_ORIGIN_ALLOWED.some((p) => path.startsWith(p))) {
    const origin = request.headers.get('Origin');
    if (origin !== url.origin) {
      return new Response('Cross-site požadavek byl zablokován', { status: 403 });
    }
  }

  // Resolve authenticated user from session cookie
  const sessionToken = getSessionCookie(request);
  if (sessionToken) {
    const userId = await verifySession(sessionToken, env.JWT_SECRET);
    if (userId) {
      const user = await getOne<User>(
        env.DB,
        `SELECT id, email, name FROM users WHERE id = ? AND deleted_at IS NULL`,
        userId,
      );
      if (user) {
        locals.user = { id: user.id, email: user.email, name: user.name };
      }
    }
  }

  // Protect /profil/* and /test/* routes
  if (path.startsWith('/profil') || path.startsWith('/test/')) {
    if (!locals.user) {
      return context.redirect(`/prihlaseni?redirect=${encodeURIComponent(path)}`);
    }
  }

  // Protect /admin/* routes
  if (path.startsWith('/admin')) {
    if (!locals.user) {
      return context.redirect(`/prihlaseni?redirect=${encodeURIComponent(path)}`);
    }
    const admin = await isAdmin(locals.user.email, env.ADMIN_EMAIL);
    if (!admin) {
      return new Response('Přístup odepřen', { status: 403 });
    }
  }

  // Protect /api/admin/* routes
  if (path.startsWith('/api/admin')) {
    if (!locals.user) return json({ error: 'Nepřihlášen' }, 401);
    const admin = await isAdmin(locals.user.email, env.ADMIN_EMAIL);
    if (!admin) return json({ error: 'Přístup odepřen' }, 403);
  }

  const response = await next();
  return withSecurityHeaders(response);
});
