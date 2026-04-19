import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { logAudit } from '@lib/audit';

export const PUT: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user!;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const { course_id, questions } = body as { course_id: string; questions: unknown[] };
  if (!course_id) return json({ error: 'course_id je povinné' }, 400);

  const questionsJson = JSON.stringify(questions ?? []);

  const existing = await getOne(env.DB, `SELECT id FROM tests WHERE course_id = ?`, course_id);
  if (existing) {
    await run(env.DB, `UPDATE tests SET questions_json = ? WHERE course_id = ?`, questionsJson, course_id);
  } else {
    await run(
      env.DB,
      `INSERT INTO tests (id, course_id, questions_json) VALUES (?, ?, ?)`,
      generateId(), course_id, questionsJson,
    );
  }

  await logAudit(env.DB, user.email, 'test.update', course_id);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
