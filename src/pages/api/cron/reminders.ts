import type { APIRoute } from 'astro';
import { getAll, run } from '@lib/db';
import { sendEmail, logEmail, listUnsubscribeHeaders, isAlreadySentConflict } from '@lib/email';
import { reminderEmail } from '@lib/email-templates/reminder';
import { ratingRequestEmail } from '@lib/email-templates/rating-request';
import { createRatingToken, createUnsubscribeToken } from '@lib/unsubscribe';
import { toSqlDateTime } from '@lib/time';
import { logAudit } from '@lib/audit';
import { isCronAuthorized } from '@lib/cron';
import { env } from '@lib/env';

/** Kolik žádostí o hodnocení odejde v jednom běhu. Zbytek vyřídí běh další den. */
const RATING_BATCH_SIZE = 100;

/**
 * Denní cron se dvěma nezávislými úkoly:
 *
 * 1. Připomínky. On-click kurzy, kde uživatel 3+ dny nepokročil: jedna připomínka a stav `stalled`.
 *    Ze stavu `stalled` lze dál normálně pokračovat tlačítkem „Hotovo“ (vrátí se na `active`).
 *    Připomínka se pošle jen jednou – stalled zápisy už se znovu nevybírají.
 * 2. Žádosti o hodnocení: jednou, tři dny po dokončení kurzu (viz sendRatingRequests).
 *
 * Chyba v jednom úkolu nezastaví druhý.
 */
export const POST: APIRoute = async ({ request }) => {
  if (!isCronAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  let reminded = 0;
  let reminderFailed = false;
  try {
    reminded = await sendStalledReminders();
  } catch (err) {
    reminderFailed = true;
    console.error('reminders: stalled reminders failed:', err);
  }

  let ratings = { due: 0, sent: 0, errors: 0 };
  let ratingFailed = false;
  try {
    ratings = await sendRatingRequests();
  } catch (err) {
    ratingFailed = true;
    console.error('reminders: rating requests failed:', err);
  }

  const ok = !reminderFailed && !ratingFailed;
  console.log('reminders', JSON.stringify({ reminded, ratings, ok }));
  // Nenulový stav = scheduled handler nepingne heartbeat a výpadek se ukáže v monitoringu.
  return new Response(JSON.stringify({ ok, reminded, ratingRequests: ratings }), {
    status: ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });
};

async function sendStalledReminders(): Promise<number> {
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

  return reminded;
}

/**
 * Žádost o hodnocení kurzu: jednou na zápis, tři dny po dokončení.
 *
 * Stejný postup jako u lekcí (deliverNextLesson): zápis se nejdřív podmíněným UPDATE
 * „zabere“ (rating_requested_at), pak se odešle e-mail s Idempotency-Key, a když odeslání
 * selže, značka se vrátí, aby to zkusil další běh. Kdo už kurz ohodnotil sám, žádost nedostane.
 */
async function sendRatingRequests(now: Date = new Date()): Promise<{ due: number; sent: number; errors: number }> {
  const due = await getAll<{ id: string; user_email: string; user_name: string; course_title: string }>(
    env.DB,
    `SELECT e.id, u.email as user_email, u.name as user_name, c.title as course_title
     FROM enrollments e
     JOIN users u ON e.user_id = u.id AND u.deleted_at IS NULL
     JOIN courses c ON e.course_id = c.id
     WHERE e.status = 'completed'
       AND e.rating_requested_at IS NULL
       AND e.completed_at IS NOT NULL
       AND datetime(e.completed_at) <= datetime('now', '-3 days')
       AND NOT EXISTS (SELECT 1 FROM course_ratings r WHERE r.enrollment_id = e.id)
     ORDER BY e.completed_at
     LIMIT ${RATING_BATCH_SIZE}`,
  );

  const results = { due: due.length, sent: 0, errors: 0 };
  for (const enrollment of due) {
    try {
      // 1. Rezervace
      const claim = await run(
        env.DB,
        `UPDATE enrollments SET rating_requested_at = ?
         WHERE id = ? AND status = 'completed' AND rating_requested_at IS NULL`,
        toSqlDateTime(now),
        enrollment.id,
      );
      if (!claim.meta.changes) continue;

      // 2. Odeslání
      let resendId: string | null = null;
      try {
        const token = await createRatingToken(enrollment.id, env.JWT_SECRET);
        const result = await sendEmail(env, {
          to: enrollment.user_email,
          subject: 'Jak se vám kurz líbil?',
          html: ratingRequestEmail({
            courseTitle: enrollment.course_title,
            ratingUrl: `${env.APP_URL}/hodnoceni/${token}`,
            appUrl: env.APP_URL,
          }),
          tags: [{ name: 'type', value: 'rating-request' }],
          idempotencyKey: `rating-request-${enrollment.id}`,
        });
        resendId = result.id;
      } catch (err) {
        if (!isAlreadySentConflict(err)) {
          // 3. Vrácení rezervace
          await run(env.DB, `UPDATE enrollments SET rating_requested_at = NULL WHERE id = ?`, enrollment.id);
          throw err;
        }
      }

      await logEmail(env, { enrollmentId: enrollment.id, template: 'rating_request', resendId });
      await logAudit(env.DB, 'cron', 'rating.requested', enrollment.id);
      results.sent++;
    } catch (err) {
      results.errors++;
      console.error(`Rating request error for ${enrollment.id}:`, err);
    }
  }
  return results;
}
