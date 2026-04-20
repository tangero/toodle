import type { APIRoute } from 'astro';
import { getOne, run } from '@lib/db';
import { logAudit } from '@lib/audit';

export const POST: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  const { id } = params;
  const enrollment = await getOne<{ id: string; user_id: string; status: string; delivery_mode: string }>(
    env.DB,
    `SELECT id, user_id, status, delivery_mode FROM enrollments WHERE id = ?`,
    id,
  );

  if (!enrollment) return json({ error: 'Enrollment nenalezen' }, 404);
  if (enrollment.user_id !== user.id) return json({ error: 'Přístup odepřen' }, 403);

  if (enrollment.status === 'active') {
    await run(
      env.DB,
      `UPDATE enrollments SET status = 'paused', next_send_at = NULL WHERE id = ?`,
      id,
    );
    await logAudit(env.DB, user.email, 'enrollment.paused', id);
    return json({ ok: true, status: 'paused' });
  }

  if (enrollment.status === 'paused') {
    // Resume — schedule next send
    const nextSend = enrollment.delivery_mode === 'next_workday'
      ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
      : null;
    await run(
      env.DB,
      `UPDATE enrollments SET status = 'active', next_send_at = ? WHERE id = ?`,
      nextSend, id,
    );
    await logAudit(env.DB, user.email, 'enrollment.resumed', id);
    return json({ ok: true, status: 'active' });
  }

  return json({ error: `Enrollment nelze pozastavit/obnovit ve stavu: ${enrollment.status}` }, 400);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
