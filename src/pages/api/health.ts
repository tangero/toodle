import type { APIRoute } from 'astro';
import { getOne } from '@lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const checks: Record<string, 'ok' | 'error'> = {};

  try {
    await getOne(env.DB, `SELECT 1`);
    checks.db = 'ok';
  } catch {
    checks.db = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  return new Response(
    JSON.stringify({
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    }),
    {
      status: allOk ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
