import type { AppEnv } from './env';

/**
 * Omezení počtu požadavků.
 *
 * Primárně Cloudflare Rate Limiting binding (`RATE_LIMITER`, sdílený napříč instancemi,
 * limit a okno se nastavují ve wrangler.jsonc). Bez bindingu (např. testy) se použije
 * záložní okno v paměti jedné instance – to samo o sobě ochranu negarantuje.
 *
 * Limity „na e-mail za hodinu“ se proto počítají v databázi (viz auth.ts).
 */
const windows = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || now > entry.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/** true = požadavek je povolen. */
export async function checkRateLimit(env: AppEnv, key: string): Promise<boolean> {
  if (env.RATE_LIMITER) {
    try {
      const { success } = await env.RATE_LIMITER.limit({ key });
      return success;
    } catch (err) {
      console.error('Rate limiter selhal, použije se záložní limit:', err);
    }
  }
  return memoryLimit(key, 10, 60_000);
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP')
    ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    ?? 'unknown';
}

export function tooManyRequests(): Response {
  return new Response(JSON.stringify({ error: 'Příliš mnoho požadavků. Zkuste to prosím za chvíli.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
  });
}
