import type { APIRoute } from 'astro';
import { createMagicLink, countRecentMagicLinks, MAX_LINKS_PER_HOUR } from '@lib/auth';
import { getOne } from '@lib/db';
import { sendEmail } from '@lib/email';
import { magicLinkEmail } from '@lib/email-templates/magic-link';
import { checkRateLimit, clientIp, tooManyRequests } from '@lib/rate-limit';
import { normalizeEmail, safeRedirectPath } from '@lib/escape';
import { env } from '@lib/env';

const GENERIC_OK = {
  ok: true,
  message: 'Pokud u nás máte účet, poslali jsme vám na e-mail odkaz pro přihlášení.',
};

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; next?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const email = normalizeEmail(body.email);
  if (!email) return json({ error: 'Zadejte platný e-mail' }, 400);

  if (!(await checkRateLimit(env, `magic-link:${clientIp(request)}`))) return tooManyRequests();

  // Nové účty z přihlašovacího formuláře nezakládáme – vznikají jen zápisem do kurzu.
  // Odpověď je stejná pro existující i neexistující e-mail (nelze zjišťovat, kdo má účet).
  const user = await getOne<{ id: string }>(
    env.DB, `SELECT id FROM users WHERE email = ? AND deleted_at IS NULL`, email,
  );
  if (!user) return json(GENERIC_OK);

  if ((await countRecentMagicLinks(env.DB, user.id)) >= MAX_LINKS_PER_HOUR) return tooManyRequests();

  const token = await createMagicLink(env.DB, user.id);
  const next = safeRedirectPath(body.next);
  const url = `${env.APP_URL}/prihlaseni/potvrzeni?token=${token}&next=${encodeURIComponent(next)}`;
  await sendEmail(env, {
    to: email,
    subject: 'Přihlášení do Školy AI',
    html: magicLinkEmail(url, env.APP_URL),
    tags: [{ name: 'type', value: 'magic-link' }],
  });

  return json(GENERIC_OK);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
