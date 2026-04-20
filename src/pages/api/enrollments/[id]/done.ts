import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { sendEmail } from '@lib/email';
import { lessonEmail } from '@lib/email-templates/lesson';
import { completionEmail } from '@lib/email-templates/completion';
import { createUnsubscribeToken } from '@lib/unsubscribe';
import { logAudit } from '@lib/audit';

export const POST: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  const { id } = params;

  const enrollment = await getOne<{
    id: string; user_id: string; course_id: string;
    current_lesson: number; delivery_mode: string; status: string;
  }>(
    env.DB,
    `SELECT id, user_id, course_id, current_lesson, delivery_mode, status FROM enrollments WHERE id = ?`,
    id,
  );

  if (!enrollment) return json({ error: 'Enrollment nenalezen' }, 404);
  if (enrollment.user_id !== user.id) return json({ error: 'Přístup odepřen' }, 403);
  if (enrollment.status !== 'active') return json({ error: 'Enrollment není aktivní' }, 400);
  if (enrollment.delivery_mode !== 'on_click') return json({ error: 'Kurz nepodporuje on-click progresji' }, 400);

  // Fetch next lesson and send immediately
  const nextLesson = await getOne<{
    id: string; title: string; content_md: string; reading_minutes: number; position: number;
  }>(
    env.DB,
    `SELECT id, title, content_md, reading_minutes, position
     FROM lessons WHERE course_id = ? AND position = ?`,
    enrollment.course_id,
    enrollment.current_lesson,
  );

  if (!nextLesson) {
    // Course complete
    await run(
      env.DB,
      `UPDATE enrollments SET status = 'completed', completed_at = datetime('now'), next_send_at = NULL WHERE id = ?`,
      id,
    );
    return json({ ok: true, completed: true });
  }

  const courseRow = await getOne<{
    title: string; lesson_count: number; completion_email_md: string;
  }>(env.DB, `SELECT title, lesson_count, completion_email_md FROM courses WHERE id = ?`, enrollment.course_id);
  const userRow = await getOne<{ email: string; name: string }>(
    env.DB, `SELECT email, name FROM users WHERE id = ?`, user.id,
  );
  if (!courseRow || !userRow) return json({ error: 'Data nenalezena' }, 500);

  const unsubToken = await createUnsubscribeToken(enrollment.id, env.JWT_SECRET);
  const html = lessonEmail({
    userName: userRow.name,
    courseTitle: courseRow.title,
    lessonTitle: nextLesson.title,
    lessonPosition: nextLesson.position,
    totalLessons: courseRow.lesson_count,
    contentMd: nextLesson.content_md,
    readingMinutes: nextLesson.reading_minutes,
    deliveryMode: 'on_click',
    enrollmentId: enrollment.id,
    appUrl: env.APP_URL,
    unsubscribeToken: unsubToken,
  });

  const { id: resendId } = await sendEmail(env, {
    to: userRow.email,
    subject: `Lekce ${nextLesson.position}: ${nextLesson.title} — ${courseRow.title}`,
    html,
    tags: [{ name: 'type', value: 'lesson' }],
  });

  await run(
    env.DB,
    `INSERT INTO email_log (id, enrollment_id, lesson_id, template, resend_id) VALUES (?, ?, ?, 'lesson', ?)`,
    generateId(), enrollment.id, nextLesson.id, resendId,
  );

  const isLast = nextLesson.position >= courseRow.lesson_count;
  if (isLast) {
    await run(
      env.DB,
      `UPDATE enrollments SET current_lesson = current_lesson + 1,
       status = 'completed', completed_at = datetime('now'), next_send_at = NULL WHERE id = ?`,
      id,
    );
    await sendEmail(env, {
      to: userRow.email,
      subject: `Dokončili jste kurz ${courseRow.title}! 🎓`,
      html: completionEmail(userRow.name, courseRow.title, courseRow.completion_email_md, enrollment.id, env.APP_URL),
      tags: [{ name: 'type', value: 'completion' }],
    });
    await logAudit(env.DB, user.email, 'enrollment.completed', id);
    return json({ ok: true, completed: true });
  }

  await run(
    env.DB,
    `UPDATE enrollments SET current_lesson = current_lesson + 1, next_send_at = NULL WHERE id = ?`,
    id,
  );
  await logAudit(env.DB, user.email, 'lesson.done', id, { lesson: nextLesson.position });
  return json({ ok: true, completed: false });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
