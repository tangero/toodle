import type { APIRoute } from 'astro';
import { generateId, getAll, run } from '@lib/db';
import { sendEmail } from '@lib/email';
import { reminderEmail } from '@lib/email-templates/reminder';
import { createUnsubscribeToken } from '@lib/unsubscribe';
import { logAudit } from '@lib/audit';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  if (request.headers.get('X-Cron-Secret') !== env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Find on_click enrollments that haven't progressed in 3+ days
  const stalled = await getAll<{
    id: string; current_lesson: number;
    user_email: string; user_name: string; course_title: string;
  }>(
    env.DB,
    `SELECT e.id, e.current_lesson,
            u.email as user_email, u.name as user_name,
            c.title as course_title
     FROM enrollments e
     JOIN users u ON e.user_id = u.id
     JOIN courses c ON e.course_id = c.id
     WHERE e.status = 'active'
       AND e.delivery_mode = 'on_click'
       AND e.next_send_at IS NULL
       AND (
         SELECT MAX(el.sent_at) FROM email_log el WHERE el.enrollment_id = e.id
       ) < datetime('now', '-3 days')`,
  );

  let reminded = 0;
  for (const enrollment of stalled) {
    try {
      const unsubToken = await createUnsubscribeToken(enrollment.id, env.JWT_SECRET);
      const html = reminderEmail(
        enrollment.user_name,
        enrollment.course_title,
        enrollment.current_lesson,
        enrollment.id,
        env.APP_URL,
        unsubToken,
      );

      const { id: resendId } = await sendEmail(env, {
        to: enrollment.user_email,
        subject: `Pokračujte v kurzu ${enrollment.course_title}`,
        html,
        tags: [{ name: 'type', value: 'reminder' }],
      });

      await run(
        env.DB,
        `INSERT INTO email_log (id, enrollment_id, lesson_id, template, resend_id) VALUES (?, ?, NULL, 'reminder', ?)`,
        generateId(), enrollment.id, resendId,
      );
      await run(env.DB, `UPDATE enrollments SET status = 'stalled' WHERE id = ?`, enrollment.id);
      await logAudit(env.DB, 'cron', 'reminder.sent', enrollment.id);
      reminded++;
    } catch (err) {
      console.error(`Reminder error for ${enrollment.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ ok: true, reminded }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
