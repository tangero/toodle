import type { APIRoute } from 'astro';
import { getOne } from '@lib/db';
import { sendEmail } from '@lib/email';
import { adminDigestEmail } from '@lib/email-templates/admin-digest';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  // Verify cron secret
  const secret = request.headers.get('X-Cron-Secret');
  if (secret !== env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [newEnrollments, completedEnrollments, paidOrders, revenue, unmatchedPayments, bouncedEmails] =
    await Promise.all([
      getOne<{ count: number }>(env.DB, `SELECT COUNT(*) as count FROM enrollments WHERE started_at >= ?`, today),
      getOne<{ count: number }>(env.DB, `SELECT COUNT(*) as count FROM enrollments WHERE completed_at >= ?`, today),
      getOne<{ count: number }>(env.DB, `SELECT COUNT(*) as count FROM orders WHERE status = 'paid' AND paid_at >= ?`, today),
      getOne<{ total: number }>(env.DB, `SELECT COALESCE(SUM(amount_czk), 0) as total FROM orders WHERE status = 'paid' AND paid_at >= ?`, today),
      getOne<{ count: number }>(env.DB, `SELECT COUNT(*) as count FROM payments WHERE matched_order_id IS NULL`),
      getOne<{ count: number }>(env.DB, `SELECT COUNT(*) as count FROM email_log WHERE bounced_at >= ?`, today),
    ]);

  const html = adminDigestEmail({
    newEnrollments: newEnrollments?.count ?? 0,
    completedEnrollments: completedEnrollments?.count ?? 0,
    paidOrders: paidOrders?.count ?? 0,
    revenue: revenue?.total ?? 0,
    unmatchedPayments: unmatchedPayments?.count ?? 0,
    bouncedEmails: bouncedEmails?.count ?? 0,
    date: new Date().toLocaleDateString('cs-CZ'),
  });

  await sendEmail(env, {
    to: env.ADMIN_EMAIL,
    subject: `Letní škola AI — přehled za ${new Date().toLocaleDateString('cs-CZ')}`,
    html,
    tags: [{ name: 'type', value: 'admin-digest' }],
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
