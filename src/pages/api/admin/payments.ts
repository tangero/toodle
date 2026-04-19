import type { APIRoute } from 'astro';
import { getOne, run } from '@lib/db';
import { logAudit } from '@lib/audit';

// Manual payment-to-order matching
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user!;

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const { payment_id, order_id } = body;
  if (!payment_id || !order_id) return json({ error: 'payment_id a order_id jsou povinné' }, 400);

  const payment = await getOne<{ id: string; amount_czk: number }>(
    env.DB, `SELECT id, amount_czk FROM payments WHERE id = ?`, payment_id,
  );
  if (!payment) return json({ error: 'Platba nenalezena' }, 404);

  const order = await getOne<{ id: string; amount_czk: number; enrollment_id: string; status: string }>(
    env.DB, `SELECT id, amount_czk, enrollment_id, status FROM orders WHERE id = ?`, order_id,
  );
  if (!order) return json({ error: 'Objednávka nenalezena' }, 404);
  if (order.status === 'paid') return json({ error: 'Objednávka již byla zaplacena' }, 409);

  const newStatus = payment.amount_czk === order.amount_czk ? 'paid'
    : payment.amount_czk > order.amount_czk ? 'overpaid' : 'underpaid';

  await run(
    env.DB,
    `UPDATE payments SET matched_order_id = ? WHERE id = ?`,
    order_id, payment_id,
  );
  await run(
    env.DB,
    `UPDATE orders SET status = ?, paid_at = datetime('now') WHERE id = ?`,
    newStatus, order_id,
  );

  if (newStatus === 'paid' && order.enrollment_id) {
    await run(
      env.DB,
      `UPDATE enrollments SET status = 'active', started_at = datetime('now'),
       next_send_at = datetime('now', '+1 hour') WHERE id = ?`,
      order.enrollment_id,
    );
  }

  await logAudit(env.DB, user.email, 'payment.manual_match', payment_id, { order_id, newStatus });
  return json({ ok: true, status: newStatus });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
