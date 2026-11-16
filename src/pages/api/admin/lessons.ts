import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { logAudit } from '@lib/audit';
import { env } from '@lib/env';

export const POST: APIRoute = async ({ request, locals }) => {
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

  await logAudit(env.DB, user.id, 'lesson.create', id, { course_id, title, position });
  return json({ id, position }, 201);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const user = locals.user!;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const { id, title, content_md, reading_minutes, position } = body as Record<string, string | number>;
  if (!id || !title) return json({ error: 'ID a název jsou povinné' }, 400);

  const lesson = await getOne<{ course_id: string; position: number }>(
    env.DB, `SELECT course_id, position FROM lessons WHERE id = ?`, id,
  );
  if (!lesson) return json({ error: 'Lekce nenalezena' }, 404);

  const newPosition = Number(position ?? lesson.position);
  const db = env.DB;
  const statements = [];

  if (Number.isInteger(newPosition) && newPosition >= 1 && newPosition !== lesson.position) {
    // Prohození pozic s lekcí, která cílovou pozici zabírá (UNIQUE course_id + position).
    statements.push(
      db.prepare(`UPDATE lessons SET position = -1 WHERE course_id = ? AND position = ?`).bind(lesson.course_id, newPosition),
      db.prepare(`UPDATE lessons SET position = ? WHERE id = ?`).bind(newPosition, id),
      db.prepare(`UPDATE lessons SET position = ? WHERE course_id = ? AND position = -1`).bind(lesson.position, lesson.course_id),
    );
  }
  statements.push(
    // Změna těla zvedá verzi lekce (k verzi se váže zpětná vazba na srozumitelnost).
    db.prepare(
      `UPDATE lessons SET title = ?, version = CASE WHEN content_md <> ? THEN version + 1 ELSE version END,
       content_md = ?, reading_minutes = ? WHERE id = ?`,
    ).bind(String(title), String(content_md ?? ''), String(content_md ?? ''), Number(reading_minutes ?? 5), id),
  );
  await db.batch(statements);

  await logAudit(env.DB, user.id, 'lesson.update', String(id));
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
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

  const db = env.DB;
  await db.batch([
    // email_log.lesson_id odkazuje na lekci (FK) – historii odeslání zachováme bez vazby.
    db.prepare(`UPDATE email_log SET lesson_id = NULL WHERE lesson_id = ?`).bind(id),
    // Zpětná vazba ke smazané lekci nemá k čemu patřit (a cizí klíč by mazání zablokoval).
    db.prepare(`DELETE FROM lesson_feedback WHERE lesson_id = ?`).bind(id),
    db.prepare(`DELETE FROM lessons WHERE id = ?`).bind(id),
    // Přečíslování ve dvou krocích, aby UPDATE nenarazil na UNIQUE(course_id, position).
    db.prepare(`UPDATE lessons SET position = -position WHERE course_id = ? AND position > ?`).bind(lesson.course_id, lesson.position),
    db.prepare(`UPDATE lessons SET position = -position - 1 WHERE course_id = ? AND position < 0`).bind(lesson.course_id),
    // Běžící zápisy, které už smazanou lekci dostaly, posuneme, aby nepřeskočily další lekci.
    db.prepare(
      `UPDATE enrollments SET current_lesson = current_lesson - 1
       WHERE course_id = ? AND current_lesson > ? AND status IN ('active', 'paused', 'stalled')`,
    ).bind(lesson.course_id, lesson.position),
    db.prepare(`UPDATE courses SET lesson_count = (SELECT COUNT(*) FROM lessons WHERE course_id = ?) WHERE id = ?`)
      .bind(lesson.course_id, lesson.course_id),
  ]);

  await logAudit(env.DB, user.id, 'lesson.delete', id);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
