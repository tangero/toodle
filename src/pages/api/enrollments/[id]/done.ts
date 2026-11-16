import type { APIRoute } from 'astro';
import { deliverNextLesson, loadDeliveryRow } from '@lib/enrollment';
import { getOne } from '@lib/db';
import { logAudit } from '@lib/audit';
import { env } from '@lib/env';

/** On-click režim: uživatel dočetl lekci → hned pošleme další. */
export const POST: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  const id = params.id ?? '';
  const owner = await getOne<{ user_id: string }>(env.DB, `SELECT user_id FROM enrollments WHERE id = ?`, id);
  if (!owner) return json({ error: 'Zápis nenalezen' }, 404);
  if (owner.user_id !== user.id) return json({ error: 'Přístup odepřen' }, 403);

  const row = await loadDeliveryRow(env, id);
  if (!row) return json({ error: 'Zápis nenalezen' }, 404);
  if (row.delivery_mode !== 'on_click') return json({ error: 'Kurz nepodporuje on-click progresi' }, 400);
  if (row.status !== 'active' && row.status !== 'stalled') {
    return json({ error: 'Kurz není aktivní' }, 400);
  }

  try {
    const result = await deliverNextLesson(env, row);
    if (result.status === 'skipped') return json({ error: 'Lekce se právě odesílá, zkuste to za chvíli.' }, 409);
    if (result.status === 'completed') return json({ ok: true, completed: true });
    await logAudit(env.DB, user.id, 'lesson.done', id, { lesson: result.position });
    return json({ ok: true, completed: result.completed, lesson: result.position });
  } catch (err) {
    console.error(`done: delivery failed for ${id}:`, err);
    return json({ error: 'Lekci se nepodařilo odeslat. Zkuste to prosím za chvíli.' }, 502);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
