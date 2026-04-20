import type { APIRoute } from 'astro';
import { getAll, run } from '@lib/db';
import { logAudit } from '@lib/audit';
import { clearSessionCookie } from '@lib/auth';

export const POST: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  const userId = user.id;

  // Delete PDF certificates from R2
  const certs = await getAll<{ pdf_r2_key: string }>(
    env.DB,
    `SELECT c.pdf_r2_key FROM certificates c JOIN enrollments e ON c.enrollment_id = e.id WHERE e.user_id = ?`,
    userId,
  );
  for (const cert of certs) {
    await env.BUCKET.delete(cert.pdf_r2_key);
  }

  // Delete all user data (cascade order matters)
  await run(env.DB, `DELETE FROM email_log WHERE enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ?)`, userId);
  await run(env.DB, `DELETE FROM test_attempts WHERE enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ?)`, userId);
  await run(env.DB, `DELETE FROM certificates WHERE enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ?)`, userId);
  await run(env.DB, `DELETE FROM enrollments WHERE user_id = ?`, userId);
  await run(env.DB, `DELETE FROM orders WHERE user_id = ?`, userId);
  await run(env.DB, `DELETE FROM magic_links WHERE user_id = ?`, userId);
  await run(env.DB, `UPDATE users SET deleted_at = datetime('now'), email = 'deleted@deleted', name = 'Smazaný uživatel' WHERE id = ?`, userId);

  await logAudit(env.DB, 'gdpr', 'user.deleted', userId);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
