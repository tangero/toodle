import { env } from './env';

/** Ověření volání cron endpointu (sdílený secret v hlavičce X-Cron-Secret). */
export function isCronAuthorized(request: Request): boolean {
  const provided = request.headers.get('X-Cron-Secret') ?? '';
  const expected = env.CRON_SECRET ?? '';
  if (!expected || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
