import type { APIRoute } from 'astro';
import { run } from '@lib/db';
import { isCronAuthorized } from '@lib/cron';
import { env } from '@lib/env';

/** Denní úklid: prošlé přihlašovací odkazy a starý audit log (retence 2 roky). */
export const POST: APIRoute = async ({ request }) => {
  if (!isCronAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const links = await run(
    env.DB,
    `DELETE FROM magic_links WHERE datetime(expires_at) < datetime('now', '-1 day')`,
  );
  const audit = await run(
    env.DB,
    `DELETE FROM audit_log WHERE datetime(created_at) < datetime('now', '-2 years')`,
  );

  return new Response(
    JSON.stringify({ ok: true, magicLinksDeleted: links.meta.changes, auditDeleted: audit.meta.changes }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
