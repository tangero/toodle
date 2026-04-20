import type { APIRoute } from 'astro';
import { getAll, run } from '@lib/db';
import { logAudit } from '@lib/audit';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  if (request.headers.get('X-Cron-Secret') !== env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const expiredOrders = await getAll<{ id: string; enrollment_id: string | null }>(
    env.DB,
    `SELECT id, enrollment_id FROM orders
     WHERE status = 'pending' AND expires_at < datetime('now')`,
  );

  let count = 0;
  for (const order of expiredOrders) {
    await run(env.DB, `UPDATE orders SET status = 'cancelled' WHERE id = ?`, order.id);
    if (order.enrollment_id) {
      await run(
        env.DB,
        `UPDATE enrollments SET status = 'cancelled' WHERE id = ? AND status = 'pending'`,
        order.enrollment_id,
      );
    }
    await logAudit(env.DB, 'cron', 'order.expired', order.id);
    count++;
  }

  return new Response(JSON.stringify({ ok: true, expired: count }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
