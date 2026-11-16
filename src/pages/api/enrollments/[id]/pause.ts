import type { APIRoute } from 'astro';
import { getOne, run } from '@lib/db';
import { logAudit } from '@lib/audit';
import { nextDeliverySlot, toSqlDateTime } from '@lib/time';
import { env } from '@lib/env';

/** Přepínač pozastavit / obnovit. */
export const POST: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  const id = params.id ?? '';
  const enrollment = await getOne<{ id: string; user_id: string; status: string; delivery_mode: string }>(
    env.DB,
    `SELECT e.id, e.user_id, e.status, c.delivery_mode
     FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.id = ?`,
    id,
  );

  if (!enrollment) return json({ error: 'Zápis nenalezen' }, 404);
  if (enrollment.user_id !== user.id) return json({ error: 'Přístup odepřen' }, 403);

  if (enrollment.status === 'active' || enrollment.status === 'stalled') {
    await run(
      env.DB,
      `UPDATE enrollments SET status = 'paused', next_send_at = NULL WHERE id = ? AND status = ?`,
      id, enrollment.status,
    );
    await logAudit(env.DB, user.id, 'enrollment.paused', id);
    return json({ ok: true, status: 'paused' });
  }

  if (enrollment.status === 'paused') {
    // next_workday: další lekce v nejbližším termínu; on_click: čeká na tlačítko „Hotovo“.
    const nextSend = enrollment.delivery_mode === 'next_workday' ? toSqlDateTime(nextDeliverySlot()) : null;
    await run(
      env.DB,
      `UPDATE enrollments SET status = 'active', next_send_at = ? WHERE id = ? AND status = 'paused'`,
      nextSend, id,
    );
    await logAudit(env.DB, user.id, 'enrollment.resumed', id);
    return json({ ok: true, status: 'active', nextSendAt: nextSend });
  }

  return json({ error: `Kurz nelze pozastavit/obnovit ve stavu: ${enrollment.status}` }, 400);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
