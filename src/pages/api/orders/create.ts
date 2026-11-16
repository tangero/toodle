import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { findOrCreateUser, createMagicLink, countRecentMagicLinks, CONFIRM_LINK_TTL_MINUTES, MAX_LINKS_PER_HOUR } from '@lib/auth';
import { sendEmail } from '@lib/email';
import { verificationEmail } from '@lib/email-templates/verification';
import { activateEnrollment } from '@lib/enrollment';
import { logAudit } from '@lib/audit';
import { checkRateLimit, clientIp, tooManyRequests } from '@lib/rate-limit';
import { normalizeEmail, normalizeName } from '@lib/escape';
import { toSqlDateTime } from '@lib/time';
import type { Course, Enrollment, User } from '@lib/types';
import { env } from '@lib/env';

function generateVS(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(1_000_000_000 + (bytes[0] % 9_000_000_000)).slice(0, 10);
}

/**
 * Zápis do kurzu.
 * - Přihlášený uživatel (e-mail už prokázal): bezplatný kurz se aktivuje hned.
 * - Nepřihlášený: zápis čeká a na e-mail odchází potvrzovací odkaz (double opt-in).
 *   Bez potvrzení se nikomu nic neposílá – formulář tak nejde zneužít k zapisování cizích adres.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  let body: { slug?: string; email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const slug = typeof body.slug === 'string' ? body.slug : '';
  if (!slug) return json({ error: 'Slug kurzu je povinný' }, 400);

  if (!(await checkRateLimit(env, `order:${clientIp(request)}`))) return tooManyRequests();

  let user: User;
  const loggedIn = !!locals.user;
  if (locals.user) {
    const found = await getOne<User>(env.DB, `SELECT * FROM users WHERE id = ? AND deleted_at IS NULL`, locals.user.id);
    if (!found) return json({ error: 'Uživatel nenalezen' }, 404);
    user = found;
  } else {
    const email = normalizeEmail(body.email);
    if (!email) return json({ error: 'Zadejte platný e-mail' }, 400);
    const name = normalizeName(body.name);
    if (!name) {
      return json({ error: 'Zadejte jméno (jen písmena, mezery a pomlčky, max. 80 znaků).' }, 400);
    }
    user = await findOrCreateUser(env.DB, email, name);
  }

  const course = await getOne<Course>(
    env.DB,
    `SELECT * FROM courses WHERE slug = ? AND status = 'published'`,
    slug,
  );
  if (!course) return json({ error: 'Kurz nenalezen' }, 404);

  const existing = await getOne<Enrollment>(
    env.DB,
    `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?`,
    user.id,
    course.id,
  );

  // Čekající zápis nepřihlášeného uživatele: pošleme potvrzovací odkaz znovu.
  if (existing && existing.status === 'pending' && !loggedIn && course.price_czk === 0) {
    const sent = await sendConfirmation(user, course, existing.id);
    if (!sent) return tooManyRequests();
    return json({ ok: true, free: true, status: 'pending', resent: true, enrollmentId: existing.id });
  }

  if (existing && existing.status !== 'cancelled') {
    return json({ error: 'Na tento kurz jste již zapsáni.', enrollmentId: loggedIn ? existing.id : undefined }, 409);
  }

  // Opakovaný zápis po odhlášení/zrušení: obnovíme původní řádek (UNIQUE user_id + course_id).
  let enrollmentId: string;
  if (existing) {
    enrollmentId = existing.id;
    await run(
      env.DB,
      `UPDATE enrollments SET status = 'pending', current_lesson = 1, next_send_at = NULL,
       started_at = NULL, completed_at = NULL, score = NULL WHERE id = ? AND status = 'cancelled'`,
      enrollmentId,
    );
  } else {
    enrollmentId = generateId();
    await run(
      env.DB,
      `INSERT INTO enrollments (id, user_id, course_id, status, current_lesson) VALUES (?, ?, ?, 'pending', 1)`,
      enrollmentId, user.id, course.id,
    );
  }

  // Bezplatný kurz
  if (course.price_czk === 0) {
    if (loggedIn) {
      await activateEnrollment(env, enrollmentId);
      await logAudit(env.DB, user.id, 'enrollment.create', enrollmentId, { course: course.slug, type: 'free' });
      return json({ ok: true, free: true, status: 'active', enrollmentId });
    }
    const sent = await sendConfirmation(user, course, enrollmentId);
    await logAudit(env.DB, user.id, 'enrollment.create', enrollmentId, { course: course.slug, type: 'free', pending: true });
    if (!sent) return tooManyRequests();
    return json({ ok: true, free: true, status: 'pending', enrollmentId });
  }

  // Placený kurz – zatím se nepoužívá (všechny kurzy jsou zdarma); platby páruje cron match-payments.
  const orderId = generateId();
  const vs = generateVS();
  const expiresAt = toSqlDateTime(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  await run(
    env.DB,
    `INSERT INTO orders (id, user_id, course_id, enrollment_id, vs, amount_czk, status, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    orderId, user.id, course.id, enrollmentId, vs, course.price_czk, expiresAt,
  );
  await logAudit(env.DB, user.id, 'order.create', orderId, { course: course.slug, vs, amount: course.price_czk });
  return json({ ok: true, type: 'paid', vs, amount: course.price_czk, orderId });
};

/** Pošle potvrzovací odkaz (double opt-in). false = překročen limit odkazů za hodinu. */
async function sendConfirmation(user: User, course: Course, enrollmentId: string): Promise<boolean> {
  if ((await countRecentMagicLinks(env.DB, user.id)) >= MAX_LINKS_PER_HOUR) return false;
  const token = await createMagicLink(env.DB, user.id, CONFIRM_LINK_TTL_MINUTES);
  const next = `/profil/kurz/${enrollmentId}`;
  const url = `${env.APP_URL}/prihlaseni/potvrzeni?typ=zapis&token=${token}&next=${encodeURIComponent(next)}`;
  await sendEmail(env, {
    to: user.email,
    subject: `Potvrďte zápis do kurzu ${course.title}`,
    html: verificationEmail(url, user.name, course.title),
    tags: [{ name: 'type', value: 'verification' }],
  });
  return true;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
