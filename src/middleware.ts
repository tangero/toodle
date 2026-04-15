import { defineMiddleware } from 'astro:middleware';
import { getSessionCookie, verifySession, isAdmin } from '@lib/auth';
import { getOne } from '@lib/db';
import type { User } from '@lib/types';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, url } = context;
  const env = locals.runtime.env;

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

  const path = url.pathname;

  // Protect /profil/* routes
  if (path.startsWith('/profil')) {
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
    if (!locals.user) {
      return new Response(JSON.stringify({ error: 'Nepřihlášen' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const admin = await isAdmin(locals.user.email, env.ADMIN_EMAIL);
    if (!admin) {
      return new Response(JSON.stringify({ error: 'Přístup odepřen' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
});
