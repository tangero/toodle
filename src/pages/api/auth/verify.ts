import type { APIRoute } from 'astro';
import { verifyMagicLink, createSession, setSessionCookie, markUserVerified } from '@lib/auth';
import { activatePendingFreeEnrollments } from '@lib/enrollment';
import { safeRedirectPath } from '@lib/escape';
import { env } from '@lib/env';

/**
 * GET: starší odkazy z e-mailů → potvrzovací stránka (GET nic nespotřebovává,
 * takže odkaz „neprojde“ bezpečnostní skener pošty).
 */
export const GET: APIRoute = async ({ url, redirect }) => {
  const token = url.searchParams.get('token') ?? '';
  return redirect(`/prihlaseni/potvrzeni?token=${encodeURIComponent(token)}`, 302);
};

/** POST z potvrzovací stránky: spotřebuje token, ověří e-mail, aktivuje zápisy a přihlásí. */
export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get('token') ?? '');
  const next = safeRedirectPath(form?.get('next'));

  const userId = token ? await verifyMagicLink(env.DB, token) : null;
  if (!userId) {
    return new Response(null, { status: 303, headers: { Location: '/prihlaseni?error=invalid-token' } });
  }

  // Kliknutí na odkaz z e-mailu prokazuje vlastnictví adresy → ověřit a spustit čekající kurzy.
  await markUserVerified(env.DB, userId);
  await activatePendingFreeEnrollments(env, userId);

  const sessionToken = await createSession(userId, env.JWT_SECRET);
  return new Response(null, {
    status: 303,
    headers: { Location: next, 'Set-Cookie': setSessionCookie(sessionToken) },
  });
};
