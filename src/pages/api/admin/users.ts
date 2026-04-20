import type { APIRoute } from 'astro';
import { getAll, getOne, run } from '@lib/db';
import { logAudit } from '@lib/audit';

export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const user = await getOne(env.DB, `SELECT id, email, name, created_at, verified_at FROM users WHERE id = ? AND deleted_at IS NULL`, id);
    if (!user) return json({ error: 'Uživatel nenalezen' }, 404);

    const enrollments = await getAll(
      env.DB,
      `SELECT e.*, c.title as course_title FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ? ORDER BY e.started_at DESC`,
      id,
    );
    const orders = await getAll(
      env.DB,
      `SELECT o.*, c.title as course_title FROM orders o JOIN courses c ON o.course_id = c.id WHERE o.user_id = ? ORDER BY o.created_at DESC`,
      id,
    );
    return json({ user, enrollments, orders });
  }

  const search = url.searchParams.get('search') ?? '';
  const users = await getAll(
    env.DB,
    `SELECT u.id, u.email, u.name, u.created_at, u.verified_at,
            COUNT(e.id) as enrollment_count
     FROM users u
     LEFT JOIN enrollments e ON e.user_id = u.id
     WHERE u.deleted_at IS NULL AND (u.email LIKE ? OR u.name LIKE ?)
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT 100`,
    `%${search}%`, `%${search}%`,
  );
  return json({ users });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user!;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'ID je povinné' }, 400);

  await run(env.DB, `UPDATE users SET deleted_at = datetime('now') WHERE id = ?`, id);
  await logAudit(env.DB, user.email, 'user.delete', id);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
