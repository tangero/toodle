import type { AppEnv } from './env';
import { getAll, getOne } from './db';

/**
 * Smazání uživatele podle GDPR (volá ho uživatel i admin).
 *
 * - Osobní data průběhu (zápisy, e-mailový log, testy, certifikáty, hodnocení kurzů,
 *   zpětná vazba k lekcím, přihlašovací odkazy) se mažou.
 * - Objednávky zůstávají kvůli účetnictví, jen se odpojí od smazaného zápisu.
 * - Řádek uživatele se anonymizuje unikátním e-mailem (sloupec email je UNIQUE),
 *   takže se člověk může později znovu registrovat stejnou adresou.
 * - PDF certifikátů v R2 se mažou jako první. Když se to nepovede, mazání skončí chybou
 *   a dá se zopakovat: řádky s klíči souborů ještě existují. V opačném pořadí by PDF se jménem
 *   zůstalo v úložišti bez záznamu, podle kterého ho najít.
 * - Databázové změny běží v jedné D1 dávce (atomicky).
 */
export async function deleteUserData(env: AppEnv, userId: string): Promise<boolean> {
  const user = await getOne<{ id: string; email: string }>(
    env.DB, `SELECT id, email FROM users WHERE id = ? AND deleted_at IS NULL`, userId,
  );
  if (!user) return false;

  const certs = await getAll<{ pdf_r2_key: string }>(
    env.DB,
    `SELECT c.pdf_r2_key FROM certificates c JOIN enrollments e ON c.enrollment_id = e.id WHERE e.user_id = ?`,
    userId,
  );

  if (certs.length > 0) {
    // Smazání neexistujícího klíče v R2 chybou není, opakované volání je bezpečné.
    await env.BUCKET.delete(certs.map((cert) => cert.pdf_r2_key));
  }

  const userEnrollments = `SELECT id FROM enrollments WHERE user_id = ?`;
  const db = env.DB;
  await db.batch([
    db.prepare(`UPDATE orders SET enrollment_id = NULL WHERE user_id = ?`).bind(userId),
    db.prepare(`DELETE FROM email_log WHERE enrollment_id IN (${userEnrollments})`).bind(userId),
    db.prepare(`DELETE FROM test_attempts WHERE enrollment_id IN (${userEnrollments})`).bind(userId),
    db.prepare(`DELETE FROM certificates WHERE enrollment_id IN (${userEnrollments})`).bind(userId),
    db.prepare(`DELETE FROM course_ratings WHERE enrollment_id IN (${userEnrollments})`).bind(userId),
    db.prepare(`DELETE FROM lesson_feedback WHERE enrollment_id IN (${userEnrollments})`).bind(userId),
    db.prepare(`DELETE FROM enrollments WHERE user_id = ?`).bind(userId),
    db.prepare(`DELETE FROM magic_links WHERE user_id = ?`).bind(userId),
    db.prepare(`UPDATE audit_log SET actor = 'deleted-user' WHERE actor = ?`).bind(user.email),
    db.prepare(`UPDATE audit_log SET payload_json = NULL WHERE instr(payload_json, ?) > 0`).bind(user.email),
    db.prepare(
      `UPDATE users SET deleted_at = datetime('now'), email = 'deleted-' || id || '@deleted.invalid',
       name = 'Smazaný uživatel', promo_opt_out_at = NULL, municipality_code = NULL WHERE id = ?`,
    ).bind(userId),
    db.prepare(
      `INSERT INTO audit_log (id, actor, action, target, created_at) VALUES (?, 'gdpr', 'user.deleted', ?, datetime('now'))`,
    ).bind(crypto.randomUUID(), userId),
  ]);

  return true;
}
