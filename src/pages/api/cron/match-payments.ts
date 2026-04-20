import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { fetchNewTransactions } from '@lib/fio';
import { sendEmail } from '@lib/email';
import { welcomeEmail } from '@lib/email-templates/welcome';
import { logAudit } from '@lib/audit';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  if (request.headers.get('X-Cron-Secret') !== env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  let transactions;
  try {
    transactions = await fetchNewTransactions(env.FIO_API_TOKEN);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }

  const results = { matched: 0, unmatched: 0, duplicate: 0, errors: 0 };

  for (const tx of transactions) {
    // Skip already processed
    const exists = await getOne(env.DB, `SELECT id FROM payments WHERE fio_transaction_id = ?`, tx.transactionId);
    if (exists) { results.duplicate++; continue; }

    // Save payment
    const paymentId = generateId();
    await run(
      env.DB,
      `INSERT INTO payments (id, fio_transaction_id, vs, amount_czk, received_at) VALUES (?, ?, ?, ?, ?)`,
      paymentId, tx.transactionId, tx.variableSymbol ?? '', tx.amount, tx.date,
    );

    if (!tx.variableSymbol) { results.unmatched++; continue; }

    // Find matching order
    const order = await getOne<{
      id: string; amount_czk: number; enrollment_id: string;
      status: string; user_id: string; course_id: string;
    }>(
      env.DB,
      `SELECT o.id, o.amount_czk, o.enrollment_id, o.status, o.user_id, o.course_id
       FROM orders o WHERE o.vs = ? AND o.status = 'pending'`,
      tx.variableSymbol,
    );

    if (!order) {
      results.unmatched++;
      // Notify admin about unmatched payment
      await sendEmail(env, {
        to: env.ADMIN_EMAIL,
        subject: `⚠️ Nespárovaná platba ${tx.amount} Kč (VS: ${tx.variableSymbol})`,
        html: `<p>Přijata platba ${tx.amount} Kč s VS ${tx.variableSymbol}, ale nebyla nalezena odpovídající objednávka.</p><p><a href="${env.APP_URL}/admin/platby">Zobrazit platby</a></p>`,
        tags: [{ name: 'type', value: 'admin-alert' }],
      });
      continue;
    }

    const newStatus = tx.amount === order.amount_czk ? 'paid'
      : tx.amount > order.amount_czk ? 'overpaid' : 'underpaid';

    try {
      await run(env.DB, `UPDATE payments SET matched_order_id = ? WHERE id = ?`, order.id, paymentId);
      await run(env.DB, `UPDATE orders SET status = ?, paid_at = datetime('now') WHERE id = ?`, newStatus, order.id);

      if (newStatus === 'paid' && order.enrollment_id) {
        await run(
          env.DB,
          `UPDATE enrollments SET status = 'active', started_at = datetime('now'),
           next_send_at = datetime('now', '+1 hour') WHERE id = ?`,
          order.enrollment_id,
        );

        // Send welcome email
        const userRow = await getOne<{ email: string; name: string }>(
          env.DB, `SELECT email, name FROM users WHERE id = ?`, order.user_id,
        );
        const courseRow = await getOne<{ title: string; welcome_email_md: string }>(
          env.DB, `SELECT title, welcome_email_md FROM courses WHERE id = ?`, order.course_id,
        );
        if (userRow && courseRow) {
          await sendEmail(env, {
            to: userRow.email,
            subject: `Vítejte v kurzu ${courseRow.title}`,
            html: welcomeEmail(userRow.name, courseRow.title, courseRow.welcome_email_md),
            tags: [{ name: 'type', value: 'welcome' }],
          });
        }
      } else if (newStatus !== 'paid') {
        await sendEmail(env, {
          to: env.ADMIN_EMAIL,
          subject: `⚠️ Platba ${newStatus}: ${tx.amount} Kč (očekáváno ${order.amount_czk} Kč, VS: ${tx.variableSymbol})`,
          html: `<p>Platba pro objednávku VS ${tx.variableSymbol} je ${newStatus}.</p><p>Přijato: ${tx.amount} Kč, očekáváno: ${order.amount_czk} Kč.</p><p><a href="${env.APP_URL}/admin/platby">Zobrazit platby</a></p>`,
          tags: [{ name: 'type', value: 'admin-alert' }],
        });
      }

      await logAudit(env.DB, 'cron', 'payment.matched', paymentId, { vs: tx.variableSymbol, status: newStatus });
      results.matched++;
    } catch {
      results.errors++;
    }
  }

  return json({ ok: true, ...results });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
