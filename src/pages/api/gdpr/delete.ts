import type { APIRoute } from 'astro';
import { clearSessionCookie } from '@lib/auth';
import { deleteUserData } from '@lib/users';
import { env } from '@lib/env';

export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  try {
    await deleteUserData(env, user.id);
  } catch (err) {
    console.error(`GDPR delete failed for ${user.id}:`, err);
    return json({ error: 'Smazání se nepodařilo, zkuste to prosím znovu.' }, 500);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookie() },
  });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
