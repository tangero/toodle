import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
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

  const { title, slug, perex, description_md, author_name, price_czk, delivery_mode } = body as Record<string, string>;
  if (!title || !slug) return json({ error: 'Název a slug jsou povinné' }, 400);

  const existing = await getOne(env.DB, `SELECT id FROM courses WHERE slug = ?`, slug);
  if (existing) return json({ error: 'Kurz s tímto slugem již existuje' }, 409);

  const id = generateId();
  await run(
    env.DB,
    `INSERT INTO courses (id, slug, title, perex, description_md, author_name, price_czk, delivery_mode, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
    id, slug, title,
    perex ?? '',
    description_md ?? '',
    author_name ?? '',
    Number(price_czk ?? 0),
    delivery_mode ?? 'next_workday',
  );

  await logAudit(env.DB, user.email, 'course.create', id, { title, slug });
  return json({ id }, 201);
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

  const { id, title, slug, perex, description_md, author_name, price_czk,
          delivery_mode, status, welcome_email_md, completion_email_md } = body as Record<string, string>;
  if (!id) return json({ error: 'ID je povinné' }, 400);

  const existing = await getOne(env.DB, `SELECT id FROM courses WHERE id = ?`, id);
  if (!existing) return json({ error: 'Kurz nenalezen' }, 404);

  await run(
    env.DB,
    `UPDATE courses SET title=?, slug=?, perex=?, description_md=?, author_name=?,
     price_czk=?, delivery_mode=?, status=?, welcome_email_md=?, completion_email_md=?
     WHERE id=?`,
    title, slug,
    perex ?? '',
    description_md ?? '',
    author_name ?? '',
    Number(price_czk ?? 0),
    delivery_mode ?? 'next_workday',
    status ?? 'draft',
    welcome_email_md ?? '',
    completion_email_md ?? '',
    id,
  );

  await logAudit(env.DB, user.email, 'course.update', id, { title, status });
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user!;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'ID je povinné' }, 400);

  // Soft-delete by archiving
  await run(env.DB, `UPDATE courses SET status = 'archived' WHERE id = ?`, id);
  await logAudit(env.DB, user.email, 'course.archive', id);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
