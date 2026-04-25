import type { APIRoute } from 'astro';
import { generateId, getAll, getOne, run } from '@lib/db';
import { sendEmail } from '@lib/email';
import { lessonEmail } from '@lib/email-templates/lesson';
import { completionEmail } from '@lib/email-templates/completion';
import { createUnsubscribeToken } from '@lib/unsubscribe';
import { logAudit } from '@lib/audit';

function getCzechHour(): number {
  return new Date().toLocaleString('en-US', { timeZone: 'Europe/Prague', hour: 'numeric', hour12: false }) as unknown as number;
}

function nextWorkdayAt7CET(): string {
  const now = new Date();
  const czNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
  const next = new Date(czNow);
  next.setHours(7, 0, 0, 0);
  if (next <= czNow) next.setDate(next.getDate() + 1);
  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }
  // Convert back to UTC
  const offset = czNow.getTime() - now.getTime();
  return new Date(next.getTime() - offset).toISOString();
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  if (request.headers.get('X-Cron-Secret') !== env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const enrollments = await getAll<{
    id: string; user_id: string; course_id: string;
    current_lesson: number; delivery_mode: string;
    user_email: string; user_name: string;
    course_title: string; lesson_count: number;
    completion_email_md: string;
  }>(
    env.DB,
    `SELECT e.id, e.user_id, e.course_id, e.current_lesson, c.delivery_mode,
            u.email as user_email, u.name as user_name,
            c.title as course_title, c.lesson_count, c.completion_email_md
     FROM enrollments e
     JOIN users u ON e.user_id = u.id
     JOIN courses c ON e.course_id = c.id
     WHERE e.status = 'active'
       AND e.next_send_at IS NOT NULL
       AND e.next_send_at <= datetime('now')`,
  );

  const results = { sent: 0, completed: 0, errors: 0 };

  for (const enrollment of enrollments) {
    try {
      const lesson = await getOne<{
        id: string; title: string; content_md: string; reading_minutes: number; position: number;
      }>(
        env.DB,
        `SELECT id, title, content_md, reading_minutes, position
         FROM lessons WHERE course_id = ? AND position = ?`,
        enrollment.course_id,
        enrollment.current_lesson,
      );

      if (!lesson) {
        // No more lessons — complete the enrollment
        await run(
          env.DB,
          `UPDATE enrollments SET status = 'completed', completed_at = datetime('now'), next_send_at = NULL WHERE id = ?`,
          enrollment.id,
        );
        results.completed++;
        continue;
      }

      const unsubToken = await createUnsubscribeToken(enrollment.id, env.JWT_SECRET);
      const html = lessonEmail({
        userName: enrollment.user_name,
        courseTitle: enrollment.course_title,
        lessonTitle: lesson.title,
        lessonPosition: lesson.position,
        totalLessons: enrollment.lesson_count,
        contentMd: lesson.content_md,
        readingMinutes: lesson.reading_minutes,
        deliveryMode: enrollment.delivery_mode as 'on_click' | 'next_workday',
        enrollmentId: enrollment.id,
        appUrl: env.APP_URL,
        unsubscribeToken: unsubToken,
      });

      const { id: resendId } = await sendEmail(env, {
        to: enrollment.user_email,
        subject: `Lekce ${lesson.position}: ${lesson.title} — ${enrollment.course_title}`,
        html,
        tags: [{ name: 'type', value: 'lesson' }, { name: 'enrollment', value: enrollment.id }],
      });

      // Log email
      await run(
        env.DB,
        `INSERT INTO email_log (id, enrollment_id, lesson_id, template, resend_id) VALUES (?, ?, ?, 'lesson', ?)`,
        generateId(), enrollment.id, lesson.id, resendId,
      );

      const isLastLesson = enrollment.current_lesson >= enrollment.lesson_count;

      if (isLastLesson) {
        // Mark completed, send completion email
        await run(
          env.DB,
          `UPDATE enrollments SET current_lesson = current_lesson + 1,
           status = 'completed', completed_at = datetime('now'), next_send_at = NULL WHERE id = ?`,
          enrollment.id,
        );
        const completionHtml = completionEmail(
          enrollment.user_name,
          enrollment.course_title,
          enrollment.completion_email_md,
          enrollment.id,
          env.APP_URL,
        );
        await sendEmail(env, {
          to: enrollment.user_email,
          subject: `Dokončili jste kurz ${enrollment.course_title}! 🎓`,
          html: completionHtml,
          tags: [{ name: 'type', value: 'completion' }],
        });
        results.completed++;
      } else {
        const nextSendAt = enrollment.delivery_mode === 'next_workday'
          ? nextWorkdayAt7CET()
          : null; // on_click: wait for user action

        await run(
          env.DB,
          `UPDATE enrollments SET current_lesson = current_lesson + 1, next_send_at = ? WHERE id = ?`,
          nextSendAt, enrollment.id,
        );
      }

      await logAudit(env.DB, 'cron', 'lesson.sent', enrollment.id, {
        lesson: lesson.position, user: enrollment.user_email,
      });
      results.sent++;
    } catch (err) {
      results.errors++;
      console.error(`Error sending lesson for enrollment ${enrollment.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ ok: true, ...results }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
