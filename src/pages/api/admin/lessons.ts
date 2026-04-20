import type { APIRoute } from 'astro';
import { generateId, getAll, getOne, run } from '@lib/db';
import { logAudit } from '@lib/audit';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user!;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const { course_id, title, content_md, reading_minutes } = body as Record<string, string>;
  if (!course_id || !title) return json({ error: 'course_id a title jsou povinné' }, 400);

  // Get next position
  const maxPos = await getOne<{ max_pos: number }>(
    env.DB,
    `SELECT COALESCE(MAX(position), 0) as max_pos FROM lessons WHERE course_id = ?`,
    course_id,
  );
  const position = (maxPos?.max_pos ?? 0) + 1;

  const id = generateId();
  await run(
    env.DB,
    `INSERT INTO lessons (id, course_id, position, title, content_md, reading_minutes) VALUES (?, ?, ?, ?, ?, ?)`,
    id, course_id, position, title, content_md ?? '', Number(reading_minutes ?? 5),
  );

  // Update lesson_count on course
  await run(
    env.DB,
    `UPDATE courses SET lesson_count = (SELECT COUNT(*) FROM lessons WHERE course_id = ?) WHERE id = ?`,
    course_id, course_id,
  );

  await logAudit(env.DB, user.email, 'lesson.create', id, { course_id, title, position });
  return json({ id, position }, 201);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user!;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const { id, title, content_md, reading_minutes, position } = body as Record<string, string | number>;
  if (!id) return json({ error: 'ID je povinné' }, 400);

  await run(
    env.DB,
    `UPDATE lessons SET title=?, content_md=?, reading_minutes=?, position=? WHERE id=?`,
    title, content_md ?? '', Number(reading_minutes ?? 5), Number(position), id,
  );

  await logAudit(env.DB, user.email, 'lesson.update', String(id));
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user!;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'ID je povinné' }, 400);

  const lesson = await getOne<{ course_id: string; position: number }>(
    env.DB,
    `SELECT course_id, position FROM lessons WHERE id = ?`,
    id,
  );
  if (!lesson) return json({ error: 'Lekce nenalezena' }, 404);

  await run(env.DB, `DELETE FROM lessons WHERE id = ?`, id);

  // Re-number remaining lessons
  await run(
    env.DB,
    `UPDATE lessons SET position = position - 1
     WHERE course_id = ? AND position > ?`,
    lesson.course_id, lesson.position,
  );

  // Update lesson_count
  await run(
    env.DB,
    `UPDATE courses SET lesson_count = (SELECT COUNT(*) FROM lessons WHERE course_id = ?) WHERE id = ?`,
    lesson.course_id, lesson.course_id,
  );

  await logAudit(env.DB, user.email, 'lesson.delete', id);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
