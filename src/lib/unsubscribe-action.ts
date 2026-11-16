import { verifyPromoOptOutToken, verifyUnsubscribeToken } from './unsubscribe';
import { getOne, run } from './db';
import { logAudit } from './audit';
import { env } from './env';
import { toSqlDateTime } from './time';

export type UnsubscribeResult = 'ok' | 'already' | 'completed' | 'invalid';

export async function cancelEnrollmentByToken(token: string): Promise<UnsubscribeResult> {
  const enrollmentId = token ? await verifyUnsubscribeToken(token, env.JWT_SECRET) : null;
  if (!enrollmentId) return 'invalid';

  const enrollment = await getOne<{ id: string; status: string }>(
    env.DB, `SELECT id, status FROM enrollments WHERE id = ?`, enrollmentId,
  );
  if (!enrollment) return 'invalid';
  if (enrollment.status === 'cancelled') return 'already';
  if (enrollment.status === 'completed') return 'completed';

  await run(
    env.DB,
    `UPDATE enrollments SET status = 'cancelled', next_send_at = NULL WHERE id = ?`,
    enrollmentId,
  );
  await logAudit(env.DB, 'unsubscribe', 'enrollment.cancelled', enrollmentId);
  return 'ok';
}

export type PromoOptOutState = 'confirm' | 'ok' | 'already' | 'invalid';

/** Stav nabídek pro odkaz z e-mailu: jen čte, nic nemění (GET na potvrzovací stránce). */
export async function promoOptOutState(token: string): Promise<PromoOptOutState> {
  const user = await findPromoUser(token);
  if (!user) return 'invalid';
  return user.promo_opt_out_at ? 'already' : 'confirm';
}

/**
 * Odhlásí nabídky dalšího vzdělávání. Zápisů do kurzů se nedotkne, lekce chodí dál.
 * Volat jen z POST: odkazy v e-mailech otevírají i bezpečnostní skenery pošty.
 */
export async function optOutPromoByToken(token: string): Promise<PromoOptOutState> {
  const user = await findPromoUser(token);
  if (!user) return 'invalid';
  if (user.promo_opt_out_at) return 'already';

  const updated = await run(
    env.DB,
    `UPDATE users SET promo_opt_out_at = ? WHERE id = ? AND deleted_at IS NULL AND promo_opt_out_at IS NULL`,
    toSqlDateTime(new Date()),
    user.id,
  );
  if (!updated.meta.changes) return 'already';
  await logAudit(env.DB, 'unsubscribe', 'promo.opt_out', user.id);
  return 'ok';
}

async function findPromoUser(token: string): Promise<{ id: string; promo_opt_out_at: string | null } | null> {
  const userId = token ? await verifyPromoOptOutToken(token, env.JWT_SECRET) : null;
  if (!userId) return null;
  return getOne<{ id: string; promo_opt_out_at: string | null }>(
    env.DB, `SELECT id, promo_opt_out_at FROM users WHERE id = ? AND deleted_at IS NULL`, userId,
  );
}
