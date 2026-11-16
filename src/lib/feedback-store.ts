/**
 * Zpětná vazba na srozumitelnost lekcí: čtení a zápis do tabulky `lesson_feedback`.
 * Čisté funkce (části lekce, validace, zadání pro AI) jsou v `feedback.ts`.
 */
import type { D1Database } from '@cloudflare/workers-types';
import { generateId, getOne, run } from './db';
import { toSqlDateTime } from './time';
import { renderMarkdown } from './markdown';
import { lessonSections, type FeedbackAnswer, type FeedbackDetail, type LessonSection } from './feedback';
import type { DeliveryMode } from './types';

export interface FeedbackContext {
  enrollmentId: string;
  courseTitle: string;
  deliveryMode: DeliveryMode;
  lessonCount: number;
  lessonId: string;
  lessonPosition: number;
  lessonTitle: string;
  /** Aktuální verze lekce v databázi. */
  lessonVersion: number;
  /**
   * Verze, kterou čtenář dostal e-mailem (email_log.lesson_version posledního odeslání).
   * K ní se odpověď ukládá: po úpravě textu by se jinak započítala verzi, kterou nečetl.
   */
  deliveredVersion: number;
  /** Aktuální text je ten, který čtenář dostal. Jinak nelze nabízet části lekce: starší znění neuchováváme. */
  textIsDelivered: boolean;
  contentMd: string;
  /** Dosavadní odpověď čtenáře k této lekci, pokud nějaká je. */
  answer: FeedbackAnswer | null;
  sectionsJson: string;
  comment: string;
}

interface ContextRow {
  enrollment_id: string;
  course_title: string;
  delivery_mode: DeliveryMode;
  lesson_count: number;
  lesson_id: string;
  lesson_position: number;
  lesson_title: string;
  lesson_version: number;
  delivered_version: number | null;
  content_md: string;
  answer: FeedbackAnswer | null;
  sections_json: string | null;
  comment: string | null;
}

/** Lekci určuje buď stálé id (odkaz s tokenem), nebo pozice v kurzu (stránka kurzu po přihlášení). */
export type LessonRef = { lessonId: string } | { position: number };

/**
 * Zápis, lekce a dosavadní odpověď pro zpětnou vazbu. Vrací null, když zápis nebo
 * lekce neexistuje, lekce patří jinému kurzu, účet je smazaný, nebo lekce čtenáři ještě
 * neodešla (`current_lesson` ukazuje na lekci, která se pošle příště, doručené jsou jen
 * pozice pod ním).
 *
 * Doručená verze se bere z posledního odeslání lekce v `email_log` (opakovaný zápis jich
 * má víc). Když záznam chybí, bere se aktuální verze.
 */
export async function loadFeedbackContext(
  db: D1Database,
  enrollmentId: string,
  lesson: LessonRef,
): Promise<FeedbackContext | null> {
  const byId = 'lessonId' in lesson;
  const row = await getOne<ContextRow>(
    db,
    `SELECT e.id as enrollment_id, c.title as course_title, c.delivery_mode, c.lesson_count,
            l.id as lesson_id, l.position as lesson_position, l.title as lesson_title,
            l.version as lesson_version, l.content_md,
            (SELECT g.lesson_version FROM email_log g
             WHERE g.enrollment_id = e.id AND g.lesson_id = l.id AND g.template = 'lesson'
             ORDER BY g.sent_at DESC, g.id DESC LIMIT 1) as delivered_version,
            f.answer, f.sections_json, f.comment
     FROM enrollments e
     JOIN users u ON u.id = e.user_id AND u.deleted_at IS NULL
     JOIN courses c ON c.id = e.course_id
     JOIN lessons l ON l.course_id = e.course_id AND ${byId ? 'l.id = ?' : 'l.position = ?'}
     LEFT JOIN lesson_feedback f ON f.enrollment_id = e.id AND f.lesson_id = l.id
     WHERE e.id = ? AND e.current_lesson > l.position`,
    byId ? lesson.lessonId : lesson.position,
    enrollmentId,
  );
  if (!row) return null;
  // Doručená verze nemůže být novější než aktuální; chybějící záznam = aktuální.
  const deliveredVersion = Math.min(row.delivered_version ?? row.lesson_version, row.lesson_version);
  return {
    enrollmentId: row.enrollment_id,
    courseTitle: row.course_title,
    deliveryMode: row.delivery_mode,
    lessonCount: row.lesson_count,
    lessonId: row.lesson_id,
    lessonPosition: row.lesson_position,
    lessonTitle: row.lesson_title,
    lessonVersion: row.lesson_version,
    deliveredVersion,
    textIsDelivered: deliveredVersion === row.lesson_version,
    contentMd: row.content_md,
    answer: row.answer,
    sectionsJson: row.sections_json ?? '[]',
    comment: row.comment ?? '',
  };
}

/** Části lekce pro formulář upřesnění. Tělo může být HTML i Markdown, proto jde přes renderMarkdown. */
export function sectionsOf(contentMd: string): LessonSection[] {
  return lessonSections(renderMarkdown(contentMd));
}

/**
 * Uloží odpověď (1 až 3) k lekci. Opakovaná odpověď starou přepíše.
 * Dřívější upřesnění (části, připomínka) zůstane jen tehdy, když nová odpověď upřesnění
 * také má (2 nebo 3) a jde o stejnou verzi lekce. Jinak se smaže: k odpovědi „rozuměl jsem“
 * ani k přepsané lekci už nepatří.
 */
export async function saveFeedbackAnswer(
  db: D1Database,
  input: { enrollmentId: string; lessonId: string; lessonVersion: number; answer: FeedbackAnswer; now?: Date },
): Promise<void> {
  const now = toSqlDateTime(input.now ?? new Date());
  await run(
    db,
    `INSERT INTO lesson_feedback (id, enrollment_id, lesson_id, lesson_version, answer, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(enrollment_id, lesson_id) DO UPDATE SET
       sections_json = CASE WHEN excluded.answer IN (2, 3) AND lesson_feedback.lesson_version = excluded.lesson_version
                            THEN lesson_feedback.sections_json ELSE '[]' END,
       comment = CASE WHEN excluded.answer IN (2, 3) AND lesson_feedback.lesson_version = excluded.lesson_version
                      THEN lesson_feedback.comment ELSE '' END,
       answer = excluded.answer,
       lesson_version = excluded.lesson_version,
       updated_at = excluded.updated_at`,
    generateId(),
    input.enrollmentId,
    input.lessonId,
    input.lessonVersion,
    input.answer,
    now,
    now,
  );
}

/**
 * Uloží dobrovolné upřesnění k existující odpovědi 2 nebo 3 ke stejné verzi lekce.
 * Novou odpověď nezakládá: vrací false, když čtenář k lekci ještě neodpověděl, odpověděl
 * „rozuměl jsem“, nebo je jeho odpověď uložená k jiné verzi.
 */
export async function saveFeedbackDetail(
  db: D1Database,
  input: { enrollmentId: string; lessonId: string; lessonVersion: number; detail: FeedbackDetail; now?: Date },
): Promise<boolean> {
  const result = await run(
    db,
    `UPDATE lesson_feedback SET sections_json = ?, comment = ?, updated_at = ?
     WHERE enrollment_id = ? AND lesson_id = ? AND lesson_version = ? AND answer IN (2, 3)`,
    JSON.stringify(input.detail.sections),
    input.detail.comment,
    toSqlDateTime(input.now ?? new Date()),
    input.enrollmentId,
    input.lessonId,
    input.lessonVersion,
  );
  return (result.meta.changes ?? 0) > 0;
}
