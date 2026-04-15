import type { APIRoute } from 'astro';
import { findOrCreateUser, createMagicLink } from '@lib/auth';
import { sendEmail } from '@lib/email';
import { magicLinkEmail } from '@lib/email-templates/magic-link';
import { checkRateLimit } from '@lib/rate-limit';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Neplatný požadavek' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return new Response(
      JSON.stringify({ error: 'Zadejte platný email' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Rate limit: 3 requests per email per hour
  if (!checkRateLimit(`magic-link:${email}`, 3, 60 * 60 * 1000)) {
    return new Response(
      JSON.stringify({ error: 'Příliš mnoho požadavků. Zkuste to za chvíli.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const name = body.name?.trim() || email.split('@')[0];
  const user = await findOrCreateUser(env.DB, email, name);
  const token = await createMagicLink(env.DB, user.id);

  const url = `${env.APP_URL}/api/auth/verify?token=${token}`;
  await sendEmail(env, {
    to: email,
    subject: 'Přihlášení do Letní školy AI',
    html: magicLinkEmail(url),
    tags: [{ name: 'type', value: 'magic-link' }],
  });

  return new Response(
    JSON.stringify({ ok: true, message: 'Odkaz pro přihlášení byl odeslán na váš email.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
