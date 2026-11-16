/**
 * Životní cyklus zápisu do kurzu: aktivace a doručování lekcí.
 *
 * Doručení lekce používají cron (`/api/cron/send-lessons`), tlačítko „Hotovo“
 * (`/api/enrollments/[id]/done`) i aktivace kurzu v režimu on_click – logika je
 * proto na jednom místě.
 */
import type { AppEnv } from './env';
import { getAll, getOne, run } from './db';
import { sendEmail, logEmail, listUnsubscribeHeaders } from './email';
import { lessonEmail } from './email-templates/lesson';
import { completionEmail } from './email-templates/completion';
import { welcomeEmail } from './email-templates/welcome';
import { createUnsubscribeToken } from './unsubscribe';
import { nextDeliverySlot, toSqlDateTime, formatPragueDateTime } from './time';
import { logAudit } from './audit';

export interface DeliveryRow {
  id: string;
  status: string;
  current_lesson: number;
  next_send_at: string | null;
  course_id: string;
  course_title: string;
  lesson_count: number;
  delivery_mode: 'on_click' | 'next_workday';
  completion_email_md: string;
  user_email: string;
  user_name: string;
}

export const DELIVERY_SELECT = `
  SELECT e.id, e.status, e.current_lesson, e.next_send_at,
         c.id as course_id, c.title as course_title, c.lesson_count, c.delivery_mode, c.completion_email_md,
         u.email as user_email, u.name as user_name
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN users u ON u.id = e.user_id AND u.deleted_at IS NULL`;

export async function loadDeliveryRow(env: AppEnv, enrollmentId: string): Promise<DeliveryRow | null> {
  return getOne<DeliveryRow>(env.DB, `${DELIVERY_SELECT} WHERE e.id = ?`, enrollmentId);
}

interface LessonRow {
  id: string;
  title: string;
  content_md: string;
  reading_minutes: number;
  position: number;
}

export type DeliveryResult =
  | { status: 'sent'; position: number; completed: boolean }
  | { status: 'completed' }
  | { status: 'skipped'; reason: string };

/** Stavy, ze kterých lze doručit další lekci. `stalled` = po připomínce, zápis pokračuje. */
const DELIVERABLE = new Set(['active', 'stalled']);

/**
 * Doručí lekci `current_lesson` a posune zápis dál.
 *
 * Pořadí kroků je zvolené kvůli spolehlivosti:
 * 1. Zápis se nejdřív „zarezervuje“ podmíněným UPDATE (current_lesson musí sedět) –
 *    souběžný cron nebo dvojklik tak lekci nepošle dvakrát.
 * 2. Pak se odešle e-mail s Idempotency-Key.
 * 3. Když odeslání selže, rezervace se vrátí, aby lekci zkusil poslat další běh.
 */
export async function deliverNextLesson(
  env: AppEnv,
  row: DeliveryRow,
  opts: { now?: Date; lessonCache?: Map<string, LessonRow | null> } = {},
): Promise<DeliveryResult> {
  const now = opts.now ?? new Date();
  if (!DELIVERABLE.has(row.status)) return { status: 'skipped', reason: `stav ${row.status}` };

  const cacheKey = `${row.course_id}:${row.current_lesson}`;
  let lesson = opts.lessonCache?.get(cacheKey);
  if (lesson === undefined) {
    lesson = await getOne<LessonRow>(
      env.DB,
      `SELECT id, title, content_md, reading_minutes, position FROM lessons WHERE course_id = ? AND position = ?`,
      row.course_id,
      row.current_lesson,
    );
    opts.lessonCache?.set(cacheKey, lesson);
  }

  if (!lesson) {
    // Žádná další lekce (např. admin lekce smazal) – kurz je dokončený.
    await run(
      env.DB,
      `UPDATE enrollments SET status = 'completed', completed_at = datetime('now'), next_send_at = NULL
       WHERE id = ? AND current_lesson = ? AND status IN ('active', 'stalled')`,
      row.id,
      row.current_lesson,
    );
    return { status: 'completed' };
  }

  const isLast = lesson.position >= row.lesson_count;
  const nextSendAt = !isLast && row.delivery_mode === 'next_workday'
    ? toSqlDateTime(nextDeliverySlot(now, { afterToday: true }))
    : null;

  // 1. Rezervace
  const claim = await run(
    env.DB,
    `UPDATE enrollments
     SET current_lesson = current_lesson + 1,
         next_send_at = ?,
         status = ?,
         completed_at = ?
     WHERE id = ? AND current_lesson = ? AND status = ?`,
    nextSendAt,
    isLast ? 'completed' : 'active',
    isLast ? toSqlDateTime(now) : null,
    row.id,
    row.current_lesson,
    row.status,
  );
  if (!claim.meta.changes) return { status: 'skipped', reason: 'zápis mezitím změnil jiný požadavek' };

  // 2. Odeslání
  const unsubToken = await createUnsubscribeToken(row.id, env.JWT_SECRET);
  let resendId: string;
  try {
    const result = await sendEmail(env, {
      to: row.user_email,
      subject: `Lekce ${lesson.position}: ${lesson.title} — ${row.course_title}`,
      html: lessonEmail({
        userName: row.user_name,
        courseTitle: row.course_title,
        lessonTitle: lesson.title,
        lessonPosition: lesson.position,
        totalLessons: row.lesson_count,
        contentMd: lesson.content_md,
        readingMinutes: lesson.reading_minutes,
        deliveryMode: row.delivery_mode,
        enrollmentId: row.id,
        appUrl: env.APP_URL,
        unsubscribeToken: unsubToken,
      }),
      tags: [{ name: 'type', value: 'lesson' }],
      headers: listUnsubscribeHeaders(env.APP_URL, unsubToken),
      idempotencyKey: `lesson-${row.id}-${lesson.position}`,
    });
    resendId = result.id;
  } catch (err) {
    // 3. Vrácení rezervace
    await run(
      env.DB,
      `UPDATE enrollments SET current_lesson = ?, next_send_at = ?, status = ?, completed_at = NULL
       WHERE id = ? AND current_lesson = ?`,
      row.current_lesson,
      row.next_send_at,
      row.status,
      row.id,
      row.current_lesson + 1,
    );
    throw err;
  }

  await logEmail(env, { enrollmentId: row.id, lessonId: lesson.id, template: 'lesson', resendId });

  if (isLast) {
    try {
      const { id } = await sendEmail(env, {
        to: row.user_email,
        subject: `Dokončili jste kurz ${row.course_title}! 🎓`,
        html: completionEmail(row.user_name, row.course_title, row.completion_email_md, row.id, env.APP_URL),
        tags: [{ name: 'type', value: 'completion' }],
        idempotencyKey: `completion-${row.id}`,
      });
      await logEmail(env, { enrollmentId: row.id, template: 'completion', resendId: id });
    } catch (err) {
      // Lekce odešla, zápis je dokončený; závěrečný e-mail je jen bonus (odkaz na test je i v poslední lekci).
      console.error(`Completion email failed for ${row.id}:`, err);
    }
  }

  return { status: 'sent', position: lesson.position, completed: isLast };
}

/**
 * Aktivuje čekající zápis (po potvrzení e-mailu nebo u přihlášeného uživatele).
 * - next_workday: první lekce v nejbližším termínu (pracovní den 7:00),
 * - on_click: první lekce odchází hned.
 */
export async function activateEnrollment(
  env: AppEnv,
  enrollmentId: string,
  now: Date = new Date(),
): Promise<boolean> {
  const row = await loadDeliveryRow(env, enrollmentId);
  if (!row || row.status !== 'pending') return false;

  const firstSlot = row.delivery_mode === 'next_workday' ? nextDeliverySlot(now) : now;
  const activated = await run(
    env.DB,
    `UPDATE enrollments SET status = 'active', started_at = datetime('now'), next_send_at = ?
     WHERE id = ? AND status = 'pending'`,
    toSqlDateTime(firstSlot),
    enrollmentId,
  );
  if (!activated.meta.changes) return false;

  const course = await getOne<{ welcome_email_md: string }>(
    env.DB, `SELECT welcome_email_md FROM courses WHERE id = ?`, row.course_id,
  );
  const firstLessonInfo = row.delivery_mode === 'next_workday'
    ? `První lekce vám přijde ${formatPragueDateTime(firstSlot)}. Další lekce chodí každý pracovní den v 7:00.`
    : 'První lekce vám právě odchází v samostatném e-mailu. Další si vyžádáte tlačítkem „Hotovo“, až budete připraveni.';

  try {
    const { id } = await sendEmail(env, {
      to: row.user_email,
      subject: `Vítejte v kurzu ${row.course_title}`,
      html: welcomeEmail(row.user_name, row.course_title, course?.welcome_email_md ?? '', firstLessonInfo),
      tags: [{ name: 'type', value: 'welcome' }],
      idempotencyKey: `welcome-${enrollmentId}-${toSqlDateTime(now).slice(0, 10)}`,
    });
    await logEmail(env, { enrollmentId, template: 'welcome', resendId: id });
  } catch (err) {
    console.error(`Welcome email failed for ${enrollmentId}:`, err);
  }

  await logAudit(env.DB, 'system', 'enrollment.activated', enrollmentId, { mode: row.delivery_mode });

  if (row.delivery_mode === 'on_click') {
    try {
      await deliverNextLesson(env, { ...row, status: 'active', next_send_at: toSqlDateTime(firstSlot) }, { now });
    } catch (err) {
      // next_send_at zůstává „teď“ → lekci doručí nejbližší běh cronu.
      console.error(`First lesson delivery failed for ${enrollmentId}:`, err);
    }
  }
  return true;
}

/** Po ověření e-mailu aktivuje všechny čekající zápisy uživatele do bezplatných kurzů. */
export async function activatePendingFreeEnrollments(env: AppEnv, userId: string): Promise<number> {
  const pending = await getAll<{ id: string }>(
    env.DB,
    `SELECT e.id FROM enrollments e JOIN courses c ON c.id = e.course_id
     WHERE e.user_id = ? AND e.status = 'pending' AND c.price_czk = 0`,
    userId,
  );
  let count = 0;
  for (const { id } of pending) {
    if (await activateEnrollment(env, id)) count++;
  }
  return count;
}
