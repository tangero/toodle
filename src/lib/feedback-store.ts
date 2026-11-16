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
  lessonVersion: number;
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
  content_md: string;
  answer: FeedbackAnswer | null;
  sections_json: string | null;
  comment: string | null;
}

/**
 * Zápis, lekce a dosavadní odpověď pro odkaz ze zpětné vazby. Vrací null, když zápis nebo
 * lekce neexistuje, účet je smazaný, nebo lekce čtenáři ještě neodešla (`current_lesson`
 * ukazuje na lekci, která se pošle příště, doručené jsou jen pozice pod ním).
 */
export async function loadFeedbackContext(
  db: D1Database,
  enrollmentId: string,
  lessonPosition: number,
): Promise<FeedbackContext | null> {
  const row = await getOne<ContextRow>(
    db,
    `SELECT e.id as enrollment_id, c.title as course_title, c.delivery_mode, c.lesson_count,
            l.id as lesson_id, l.position as lesson_position, l.title as lesson_title,
            l.version as lesson_version, l.content_md,
            f.answer, f.sections_json, f.comment
     FROM enrollments e
     JOIN users u ON u.id = e.user_id AND u.deleted_at IS NULL
     JOIN courses c ON c.id = e.course_id
     JOIN lessons l ON l.course_id = e.course_id AND l.position = ?
     LEFT JOIN lesson_feedback f ON f.enrollment_id = e.id AND f.lesson_id = l.id
     WHERE e.id = ? AND e.current_lesson > l.position`,
    lessonPosition,
    enrollmentId,
  );
  if (!row) return null;
  return {
    enrollmentId: row.enrollment_id,
    courseTitle: row.course_title,
    deliveryMode: row.delivery_mode,
    lessonCount: row.lesson_count,
    lessonId: row.lesson_id,
    lessonPosition: row.lesson_position,
    lessonTitle: row.lesson_title,
    lessonVersion: row.lesson_version,
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
 * Uloží dobrovolné upřesnění k existující odpovědi 2 nebo 3. Novou odpověď nezakládá:
 * vrací false, když čtenář k lekci ještě neodpověděl nebo odpověděl „rozuměl jsem“.
 */
export async function saveFeedbackDetail(
  db: D1Database,
  input: { enrollmentId: string; lessonId: string; detail: FeedbackDetail; now?: Date },
): Promise<boolean> {
  const result = await run(
    db,
    `UPDATE lesson_feedback SET sections_json = ?, comment = ?, updated_at = ?
     WHERE enrollment_id = ? AND lesson_id = ? AND answer IN (2, 3)`,
    JSON.stringify(input.detail.sections),
    input.detail.comment,
    toSqlDateTime(input.now ?? new Date()),
    input.enrollmentId,
    input.lessonId,
  );
  return (result.meta.changes ?? 0) > 0;
}
