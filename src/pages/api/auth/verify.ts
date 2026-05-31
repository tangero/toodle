import type { APIRoute } from 'astro';
import { verifyMagicLink, createSession, setSessionCookie } from '@lib/auth';
import { env } from "@lib/env";

export const GET: APIRoute = async ({ request, redirect }) => {

  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirect('/prihlaseni?error=missing-token');
  }

  const userId = await verifyMagicLink(env.DB, token);
  if (!userId) {
    return redirect('/prihlaseni?error=invalid-token');
  }

  const sessionToken = await createSession(userId, env.JWT_SECRET);

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/profil',
      'Set-Cookie': setSessionCookie(sessionToken),
    },
  });
};
