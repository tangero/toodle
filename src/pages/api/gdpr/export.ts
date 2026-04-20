import type { APIRoute } from 'astro';
import { getAll, getOne } from '@lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  if (!user) return new Response('Nepřihlášen', { status: 401 });

  const [userRow, enrollments, orders, emailLogs, testAttempts, certificates] = await Promise.all([
    getOne(env.DB, `SELECT id, email, name, created_at, verified_at FROM users WHERE id = ?`, user.id),
    getAll(env.DB, `SELECT e.*, c.title as course_title FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?`, user.id),
    getAll(env.DB, `SELECT o.*, c.title as course_title FROM orders o JOIN courses c ON o.course_id = c.id WHERE o.user_id = ?`, user.id),
    getAll(env.DB, `SELECT el.template, el.sent_at, el.opened_at, el.clicked_at, el.bounced_at FROM email_log el JOIN enrollments e ON el.enrollment_id = e.id WHERE e.user_id = ?`, user.id),
    getAll(env.DB, `SELECT ta.score, ta.completed_at FROM test_attempts ta JOIN enrollments e ON ta.enrollment_id = e.id WHERE e.user_id = ?`, user.id),
    getAll(env.DB, `SELECT c.public_id, c.issued_at FROM certificates c JOIN enrollments e ON c.enrollment_id = e.id WHERE e.user_id = ?`, user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user: userRow,
    enrollments,
    orders,
    email_log: emailLogs,
    test_attempts: testAttempts,
    certificates,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="moje-data-${Date.now()}.json"`,
    },
  });
};
