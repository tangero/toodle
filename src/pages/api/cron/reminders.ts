import type { APIRoute } from 'astro';
import { getAll, run } from '@lib/db';
import { sendEmail, logEmail, listUnsubscribeHeaders } from '@lib/email';
import { reminderEmail } from '@lib/email-templates/reminder';
import { createUnsubscribeToken } from '@lib/unsubscribe';
import { logAudit } from '@lib/audit';
import { isCronAuthorized } from '@lib/cron';
import { env } from '@lib/env';

/**
 * On-click kurzy, kde uživatel 3+ dny nepokročil: jedna připomínka a stav `stalled`.
 * Ze stavu `stalled` lze dál normálně pokračovat tlačítkem „Hotovo“ (vrátí se na `active`).
 * Připomínka se pošle jen jednou – stalled zápisy už se znovu nevybírají.
 */
export const POST: APIRoute = async ({ request }) => {
  if (!isCronAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const stalled = await getAll<{
    id: string; current_lesson: number;
    user_email: string; user_name: string; course_title: string;
  }>(
    env.DB,
    `SELECT e.id, e.current_lesson,
            u.email as user_email, u.name as user_name,
            c.title as course_title
     FROM enrollments e
     JOIN users u ON e.user_id = u.id AND u.deleted_at IS NULL
     JOIN courses c ON e.course_id = c.id
     WHERE e.status = 'active'
       AND c.delivery_mode = 'on_click'
       AND e.next_send_at IS NULL
       AND (SELECT MAX(datetime(el.sent_at)) FROM email_log el WHERE el.enrollment_id = e.id)
           < datetime('now', '-3 days')
     LIMIT 200`,
  );

  let reminded = 0;
  for (const enrollment of stalled) {
    try {
      const unsubToken = await createUnsubscribeToken(enrollment.id, env.JWT_SECRET);
      const { id: resendId } = await sendEmail(env, {
        to: enrollment.user_email,
        subject: `Pokračujte v kurzu ${enrollment.course_title}`,
        html: reminderEmail(
          enrollment.user_name,
          enrollment.course_title,
          enrollment.current_lesson,
          enrollment.id,
          env.APP_URL,
          unsubToken,
        ),
        tags: [{ name: 'type', value: 'reminder' }],
        headers: listUnsubscribeHeaders(env.APP_URL, unsubToken),
        idempotencyKey: `reminder-${enrollment.id}-${enrollment.current_lesson}`,
      });

      await logEmail(env, { enrollmentId: enrollment.id, template: 'reminder', resendId });
      await run(env.DB, `UPDATE enrollments SET status = 'stalled' WHERE id = ? AND status = 'active'`, enrollment.id);
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
