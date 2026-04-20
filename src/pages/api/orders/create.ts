import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { findOrCreateUser } from '@lib/auth';
import { sendEmail } from '@lib/email';
import { verificationEmail } from '@lib/email-templates/verification';
import { welcomeEmail } from '@lib/email-templates/welcome';
import { logAudit } from '@lib/audit';
import { checkRateLimit } from '@lib/rate-limit';
import type { Course, Enrollment, User } from '@lib/types';

function generateVS(courseId: string): string {
  // 10-digit VS: first 4 chars of courseId (numeric hash) + 6 random digits
  const prefix = Math.abs(
    courseId.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0) % 1000,
  ).toString().padStart(3, '0');
  const random = Math.floor(Math.random() * 9_000_000 + 1_000_000).toString();
  return `${prefix}${random}`.slice(0, 10);
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  let body: { slug?: string; email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const { slug, email: rawEmail, name: rawName } = body;
  if (!slug) return json({ error: 'Slug kurzu je povinný' }, 400);

  // Resolve user — either from session or from form
  let user: User;
  if (locals.user) {
    const found = await getOne<User>(env.DB, `SELECT * FROM users WHERE id = ?`, locals.user.id);
    if (!found) return json({ error: 'Uživatel nenalezen' }, 404);
    user = found;
  } else {
    const email = rawEmail?.trim().toLowerCase();
    if (!email || !email.includes('@')) return json({ error: 'Zadejte platný email' }, 400);

    if (!checkRateLimit(`order:${email}`, 5, 60 * 60 * 1000)) {
      return json({ error: 'Příliš mnoho požadavků.' }, 429);
    }

    const name = rawName?.trim() || email.split('@')[0];
    user = await findOrCreateUser(env.DB, email, name);
  }

  const course = await getOne<Course>(
    env.DB,
    `SELECT * FROM courses WHERE slug = ? AND status = 'published'`,
    slug,
  );
  if (!course) return json({ error: 'Kurz nenalezen' }, 404);

  // Check for existing active enrollment
  const existing = await getOne<Enrollment>(
    env.DB,
    `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND status != 'cancelled'`,
    user.id,
    course.id,
  );
  if (existing) return json({ error: 'Již jste zapsáni na tento kurz.' }, 409);

  const enrollmentId = generateId();

  // Free course
  if (course.price_czk === 0) {
    const isActive = !!user.verified_at;
    await run(
      env.DB,
      `INSERT INTO enrollments (id, user_id, course_id, status, current_lesson, started_at, next_send_at)
       VALUES (?, ?, ?, ?, 1, datetime('now'), ?)`,
      enrollmentId, user.id, course.id,
      isActive ? 'active' : 'pending',
      isActive ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : null,
    );

    if (!user.verified_at) {
      const { createMagicLink } = await import('@lib/auth');
      const token = await createMagicLink(env.DB, user.id);
      const verifyUrl = `${env.APP_URL}/api/auth/verify-email?token=${token}`;
      await sendEmail(env, {
        to: user.email,
        subject: 'Ověřte svůj email — Letní škola AI',
        html: verificationEmail(verifyUrl, user.name),
        tags: [{ name: 'type', value: 'verification' }],
      });
    } else {
      await sendEmail(env, {
        to: user.email,
        subject: `Vítejte v kurzu ${course.title}`,
        html: welcomeEmail(user.name, course.title, course.welcome_email_md),
        tags: [{ name: 'type', value: 'welcome' }],
      });
    }

    await logAudit(env.DB, user.email, 'enrollment.create', enrollmentId, { course: course.slug, type: 'free' });
    return json({ ok: true, free: true, enrollmentId });
  }

  // Paid course — create order
  const orderId = generateId();
  const vs = generateVS(course.id);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  await run(
    env.DB,
    `INSERT INTO enrollments (id, user_id, course_id, status, current_lesson) VALUES (?, ?, ?, 'pending', 1)`,
    enrollmentId, user.id, course.id,
  );
  await run(
    env.DB,
    `INSERT INTO orders (id, user_id, course_id, enrollment_id, vs, amount_czk, status, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    orderId, user.id, course.id, enrollmentId, vs, course.price_czk, expiresAt,
  );

  if (!user.verified_at) {
    const { createMagicLink } = await import('@lib/auth');
    const token = await createMagicLink(env.DB, user.id);
    const verifyUrl = `${env.APP_URL}/api/auth/verify-email?token=${token}`;
    await sendEmail(env, {
      to: user.email,
      subject: 'Ověřte svůj email — Letní škola AI',
      html: verificationEmail(verifyUrl, user.name),
      tags: [{ name: 'type', value: 'verification' }],
    });
  }

  await logAudit(env.DB, user.email, 'order.create', orderId, { course: course.slug, vs, amount: course.price_czk });
  return json({ ok: true, type: 'paid', vs, amount: course.price_czk, orderId });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
