import { ulid } from 'ulid';

export function generateId(): string {
  return ulid();
}

export async function getOne<T>(
  db: D1Database,
  query: string,
  ...params: unknown[]
): Promise<T | null> {
  const stmt = db.prepare(query).bind(...params);
  const result = await stmt.first<T>();
  return result ?? null;
}

export async function getAll<T>(
  db: D1Database,
  query: string,
  ...params: unknown[]
): Promise<T[]> {
  const stmt = db.prepare(query).bind(...params);
  const result = await stmt.all<T>();
  return result.results;
}

export async function run(
  db: D1Database,
  query: string,
  ...params: unknown[]
): Promise<D1Result> {
  const stmt = db.prepare(query).bind(...params);
  return stmt.run();
}
