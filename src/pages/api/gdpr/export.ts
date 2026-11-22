import type { APIRoute } from 'astro';
import { getAll, getOne } from '@lib/db';
import { env } from "@lib/env";

export const GET: APIRoute = async ({ locals }) => {

  const user = locals.user;
  if (!user) return new Response('Nepřihlášen', { status: 401 });

  const [userRow, enrollments, orders, emailLogs, testAttempts, certificates, courseRatings, lessonFeedback, feedbackReplies, invitations] = await Promise.all([
    getOne(env.DB, `SELECT u.id, u.email, u.name, u.created_at, u.verified_at, u.promo_opt_out_at, m.name AS municipality, m.district AS municipality_district FROM users u LEFT JOIN municipalities m ON m.code = u.municipality_code WHERE u.id = ?`, user.id),
    getAll(env.DB, `SELECT e.*, c.title as course_title FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?`, user.id),
    getAll(env.DB, `SELECT o.*, c.title as course_title FROM orders o JOIN courses c ON o.course_id = c.id WHERE o.user_id = ?`, user.id),
    getAll(env.DB, `SELECT el.template, el.sent_at, el.opened_at, el.clicked_at, el.bounced_at FROM email_log el JOIN enrollments e ON el.enrollment_id = e.id WHERE e.user_id = ?`, user.id),
    getAll(env.DB, `SELECT ta.score, ta.completed_at FROM test_attempts ta JOIN enrollments e ON ta.enrollment_id = e.id WHERE e.user_id = ?`, user.id),
    getAll(env.DB, `SELECT c.public_id, c.issued_at FROM certificates c JOIN enrollments e ON c.enrollment_id = e.id WHERE e.user_id = ?`, user.id),
    getAll(env.DB, `SELECT c.title as course_title, r.score, r.comment, r.publish_consent, r.created_at FROM course_ratings r JOIN enrollments e ON r.enrollment_id = e.id JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?`, user.id),
    getAll(env.DB, `SELECT c.title as course_title, l.position as lesson_position, l.title as lesson_title, f.lesson_version, f.answer, f.sections_json, f.comment, f.created_at, f.updated_at FROM lesson_feedback f JOIN enrollments e ON f.enrollment_id = e.id JOIN courses c ON e.course_id = c.id JOIN lessons l ON l.id = f.lesson_id WHERE e.user_id = ? ORDER BY c.title, l.position`, user.id),
    getAll(env.DB, `SELECT c.title as course_title, l.title as lesson_title, r.body, r.status, r.sent_at FROM feedback_replies r JOIN lesson_feedback f ON f.id = r.feedback_id JOIN enrollments e ON f.enrollment_id = e.id JOIN courses c ON e.course_id = c.id JOIN lessons l ON l.id = f.lesson_id WHERE e.user_id = ? AND r.status = 'sent'`, user.id),
    getAll(env.DB, `SELECT campaign, status, sent_at FROM campaign_recipients WHERE user_id = ?`, user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user: userRow,
    enrollments,
    orders,
    email_log: emailLogs,
    test_attempts: testAttempts,
    certificates,
    course_ratings: courseRatings,
    lesson_feedback: lessonFeedback,
    lesson_feedback_replies: feedbackReplies,
    invitations,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="moje-data-${Date.now()}.json"`,
    },
  });
};
