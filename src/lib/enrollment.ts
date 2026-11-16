/**
 * Životní cyklus zápisu do kurzu: aktivace a doručování lekcí.
 *
 * Doručení lekce používají cron (`/api/cron/send-lessons`), tlačítko „Hotovo“
 * (`/api/enrollments/[id]/done`) i aktivace kurzu v režimu on_click – logika je
 * proto na jednom místě.
 */
import type { AppEnv } from './env';
import { getOne, run } from './db';
import { sendEmail, logEmail, listUnsubscribeHeaders, isAlreadySentConflict } from './email';
import { lessonEmail } from './email-templates/lesson';
import { completionEmail } from './email-templates/completion';
import { welcomeEmail } from './email-templates/welcome';
import { createFeedbackToken, createPromoOptOutToken, createUnsubscribeToken } from './unsubscribe';
import { loadEventTips, type EventTip } from './events';
import type { PromoData } from './email-templates/base';
import { nextDeliverySlot, toSqlDateTime, formatPragueDateTime } from './time';
import { logAudit } from './audit';

export interface DeliveryRow {
  id: string;
  status: string;
  current_lesson: number;
  next_send_at: string | null;
  /** Číslo průchodu kurzem (roste při opakovaném zápisu); součást Idempotency-Key e-mailů. */
  run_no: number;
  course_id: string;
  course_title: string;
  lesson_count: number;
  delivery_mode: 'on_click' | 'next_workday';
  completion_email_md: string;
  user_id: string;
  user_email: string;
  user_name: string;
  /** Kdy uživatel odhlásil nabídky dalšího vzdělávání. NULL = nabídky chce. */
  promo_opt_out_at: string | null;
}

export const DELIVERY_SELECT = `
  SELECT e.id, e.status, e.current_lesson, e.next_send_at, e.run_no,
         c.id as course_id, c.title as course_title, c.lesson_count, c.delivery_mode, c.completion_email_md,
         u.id as user_id, u.email as user_email, u.name as user_name, u.promo_opt_out_at
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN users u ON u.id = e.user_id AND u.deleted_at IS NULL`;

export async function loadDeliveryRow(env: AppEnv, enrollmentId: string): Promise<DeliveryRow | null> {
  return getOne<DeliveryRow>(env.DB, `${DELIVERY_SELECT} WHERE e.id = ?`, enrollmentId);
}

/**
 * Akce pro blok „Další naše AI vzdělávání“, sdílené mezi e-maily jednoho požadavku
 * nebo běhu cronu. `eventTips` se naplní při první potřebě (nebo ho volající dodá předem)
 * a další e-maily už zdroj nevolají.
 */
export interface PromoContext {
  eventTips?: EventTip[];
}

/**
 * Podklady pro blok nabídek v e-mailu daného příjemce, nebo undefined, když ho dostat nemá:
 * nabídky odhlásil, nebo není co nabídnout. Načtení akcí nikdy nevyhodí výjimku
 * (`loadEventTips` při chybě i po vypršení časového limitu vrací prázdné pole).
 */
export async function resolvePromo(
  env: AppEnv,
  row: Pick<DeliveryRow, 'user_id' | 'promo_opt_out_at'>,
  ctx: PromoContext,
): Promise<PromoData | undefined> {
  if (row.promo_opt_out_at) return undefined;
  ctx.eventTips ??= await loadEventTips(2, 'skola-ai-email');
  if (ctx.eventTips.length === 0) return undefined;
  const token = await createPromoOptOutToken(row.user_id, env.JWT_SECRET);
  return { tips: ctx.eventTips, optOutUrl: `${env.APP_URL}/odhlaseni-nabidek/${token}` };
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

/** Jak dlouho drží zámek odesílání (sending_at), než ho další požadavek smí převzít. */
const SENDING_LOCK_MINUTES = 10;

/** Stavy, ze kterých lze doručit další lekci. `stalled` = po připomínce, zápis pokračuje. */
const DELIVERABLE = new Set(['active', 'stalled']);

/**
 * Doručí lekci `current_lesson` a posune zápis dál.
 *
 * Pořadí kroků je zvolené kvůli spolehlivosti:
 * 1. Zápis se nejdřív „zarezervuje“ podmíněným UPDATE (current_lesson a stav musí sedět)
 *    a zamkne se sloupcem sending_at. Souběžný cron, dvojklik nebo druhá karta tak lekci
 *    nepošle dvakrát ani nepošle další lekci, dokud tahle čeká na Resend.
 * 2. Pak se odešle e-mail s Idempotency-Key (obsahuje číslo průchodu kurzem).
 * 3. Když odeslání selže, rezervace se vrátí, aby lekci zkusil poslat další běh. Pokud
 *    uživatel mezitím kurz pozastavil nebo zrušil, jeho rozhodnutí zůstává.
 * 4. Po odeslání se zámek uvolní.
 *
 * Blok nabídek: akce se berou z `opts.promo` (cron je načte jednou na běh), jinak se
 * načtou tady. Příjemci, kteří nabídky odhlásili, je nedostanou a zdroj se kvůli nim nevolá.
 */
export async function deliverNextLesson(
  env: AppEnv,
  row: DeliveryRow,
  opts: { now?: Date; lessonCache?: Map<string, LessonRow | null>; promo?: PromoContext } = {},
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

  // Nabídky se načítají před rezervací, aby mezi rezervací a odesláním nebylo volání cizího webu.
  const promo = await resolvePromo(env, row, opts.promo ?? {});

  // 1. Rezervace a zámek odesílání
  const claimedStatus = isLast ? 'completed' : 'active';
  const claim = await run(
    env.DB,
    `UPDATE enrollments
     SET current_lesson = current_lesson + 1,
         next_send_at = ?,
         status = ?,
         completed_at = ?,
         sending_at = datetime('now')
     WHERE id = ? AND current_lesson = ? AND status = ?
       AND (sending_at IS NULL OR datetime(sending_at) < datetime('now', '-${SENDING_LOCK_MINUTES} minutes'))`,
    nextSendAt,
    claimedStatus,
    isLast ? toSqlDateTime(now) : null,
    row.id,
    row.current_lesson,
    row.status,
  );
  if (!claim.meta.changes) return { status: 'skipped', reason: 'zápis mezitím změnil jiný požadavek' };

  // 2. Odeslání
  let resendId: string | null;
  try {
    const unsubToken = await createUnsubscribeToken(row.id, env.JWT_SECRET);
    // Otázka na srozumitelnost je v e-mailu jen u denních kurzů; u kurzů na potvrzení
    // se odpovídá tlačítky na stránce kurzu.
    const feedbackUrl = row.delivery_mode === 'next_workday'
      ? `${env.APP_URL}/srozumitelnost/${await createFeedbackToken(row.id, lesson.position, env.JWT_SECRET)}`
      : undefined;
    const result = await sendEmail(env, {
      to: row.user_email,
      subject: `Lekce ${lesson.position}: ${lesson.title} — ${row.course_title}`,
      html: lessonEmail({
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
        feedbackUrl,
        promo,
      }),
      tags: [{ name: 'type', value: 'lesson' }],
      headers: listUnsubscribeHeaders(env.APP_URL, unsubToken),
      // Stabilní id lekce, ne pozice: po smazání lekce se pozice přečíslují a stejný klíč
      // by Resend do 24 hodin vyhodnotil jako už odeslanou zprávu.
      idempotencyKey: `lesson-${row.id}-${row.run_no}-${lesson.id}`,
    });
    resendId = result.id;
  } catch (err) {
    if (!isAlreadySentConflict(err)) {
      // 3. Vrácení rezervace
      // Stav a termín vracíme jen tehdy, když je mezitím nezměnil uživatel (pozastavení, odhlášení).
      await run(
        env.DB,
        `UPDATE enrollments
         SET current_lesson = ?,
             next_send_at = CASE WHEN status = ? THEN ? ELSE next_send_at END,
             completed_at = CASE WHEN status = ? THEN NULL ELSE completed_at END,
             status = CASE WHEN status = ? THEN ? ELSE status END,
             sending_at = NULL
         WHERE id = ? AND current_lesson = ?`,
        row.current_lesson,
        claimedStatus, row.next_send_at,
        claimedStatus,
        claimedStatus, row.status,
        row.id,
        row.current_lesson + 1,
      );
      throw err;
    }
    // Lekce už odešla při dřívějším pokusu (odpověď se k nám nedostala) a tělo se mezitím
    // změnilo, typicky blok nabídek. Rezervaci nevracíme, jinak by se lekce zasekla
    // a po 24 h, až klíč vyprší, přišla podruhé.
    console.warn(`Lesson ${lesson.position} for ${row.id} was already accepted by Resend, continuing.`);
    resendId = null;
  }

  // 4. Uvolnění zámku (i když lekci přijal Resend už při dřívějším pokusu).
  await run(env.DB, `UPDATE enrollments SET sending_at = NULL WHERE id = ?`, row.id);

  await logEmail(env, { enrollmentId: row.id, lessonId: lesson.id, template: 'lesson', resendId });

  if (isLast) {
    try {
      const { id } = await sendEmail(env, {
        to: row.user_email,
        subject: `Dokončili jste kurz ${row.course_title}`,
        html: completionEmail({
          userName: row.user_name,
          courseTitle: row.course_title,
          completionMd: row.completion_email_md,
          enrollmentId: row.id,
          appUrl: env.APP_URL,
          promo,
        }),
        tags: [{ name: 'type', value: 'completion' }],
        idempotencyKey: `completion-${row.id}-${row.run_no}`,
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
  promoCtx: PromoContext = {},
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
      html: welcomeEmail({
        name: row.user_name,
        courseTitle: row.course_title,
        welcomeMd: course?.welcome_email_md ?? '',
        firstLessonInfo,
        appUrl: env.APP_URL,
        promo: await resolvePromo(env, row, promoCtx),
      }),
      tags: [{ name: 'type', value: 'welcome' }],
      idempotencyKey: `welcome-${enrollmentId}-${row.run_no}-${toSqlDateTime(now).slice(0, 10)}`,
    });
    await logEmail(env, { enrollmentId, template: 'welcome', resendId: id });
  } catch (err) {
    console.error(`Welcome email failed for ${enrollmentId}:`, err);
  }

  await logAudit(env.DB, 'system', 'enrollment.activated', enrollmentId, { mode: row.delivery_mode });

  if (row.delivery_mode === 'on_click') {
    try {
      await deliverNextLesson(env, { ...row, status: 'active', next_send_at: toSqlDateTime(firstSlot) }, { now, promo: promoCtx });
    } catch (err) {
      // next_send_at zůstává „teď“ → lekci doručí nejbližší běh cronu.
      console.error(`First lesson delivery failed for ${enrollmentId}:`, err);
    }
  }
  return true;
}

/**
 * Aktivuje jeden zápis potvrzený odkazem z e-mailu. Zápis musí patřit danému uživateli,
 * čekat na potvrzení a být do bezplatného kurzu (placené aktivuje až spárovaná platba).
 */
export async function activateConfirmedEnrollment(env: AppEnv, userId: string, enrollmentId: string): Promise<boolean> {
  const pending = await getOne<{ id: string }>(
    env.DB,
    `SELECT e.id FROM enrollments e JOIN courses c ON c.id = e.course_id
     WHERE e.id = ? AND e.user_id = ? AND e.status = 'pending' AND c.price_czk = 0`,
    enrollmentId,
    userId,
  );
  if (!pending) return false;
  return activateEnrollment(env, pending.id);
}
