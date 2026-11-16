import { verifyUnsubscribeToken } from './unsubscribe';
import { getOne, run } from './db';
import { logAudit } from './audit';
import { env } from './env';

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
