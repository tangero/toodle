import { generateId, run } from './db';

export async function logAudit(
  db: D1Database,
  actor: string,
  action: string,
  target?: string | null,
  payload?: Record<string, unknown> | null,
): Promise<void> {
  await run(
    db,
    `INSERT INTO audit_log (id, actor, action, target, payload_json, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    generateId(),
    actor,
    action,
    target ?? null,
    payload ? JSON.stringify(payload) : null,
  );
}
