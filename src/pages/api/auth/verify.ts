import type { APIRoute } from 'astro';
import { verifyMagicLink, createSession, setSessionCookie, markUserVerified } from '@lib/auth';
import { activateConfirmedEnrollment } from '@lib/enrollment';
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

/** POST z potvrzovací stránky: spotřebuje token, ověří e-mail, aktivuje potvrzovaný zápis a přihlásí. */
export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get('token') ?? '');
  const next = safeRedirectPath(form?.get('next'));

  const link = token ? await verifyMagicLink(env.DB, token) : null;
  if (!link) {
    return new Response(null, { status: 303, headers: { Location: '/prihlaseni?error=invalid-token' } });
  }

  // Kliknutí na odkaz z e-mailu prokazuje vlastnictví adresy. Spustí se jen kurz, který odkaz
  // potvrzuje. Běžné přihlášení žádný čekající zápis nespouští: pod cizím e-mailem ho mohl
  // veřejným formulářem založit kdokoli.
  const { userId, enrollmentId } = link;
  await markUserVerified(env.DB, userId);
  if (enrollmentId) await activateConfirmedEnrollment(env, userId, enrollmentId);

  const sessionToken = await createSession(userId, env.JWT_SECRET);
  return new Response(null, {
    status: 303,
    headers: { Location: next, 'Set-Cookie': setSessionCookie(sessionToken) },
  });
};
