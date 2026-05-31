import type { APIRoute } from 'astro';
import { getOne } from '@lib/db';
import { env } from '@lib/env';

export const GET: APIRoute = async () => {
  const checks: Record<string, 'ok' | 'error' | 'not_configured'> = {};
  const details: Record<string, string> = {};

  // 1. D1 Database
  try {
    await getOne(env.DB, `SELECT 1`);
    checks.db = 'ok';
  } catch (e: any) {
    checks.db = 'error';
    details.db = e?.message ?? 'unknown error';
  }

  // 2. R2 Bucket
  checks.bucket = env.BUCKET ? 'ok' : 'error';

  // 3. Required secrets presence
  const required = ['RESEND_API_KEY', 'JWT_SECRET', 'CRON_SECRET', 'ADMIN_EMAIL'] as const;
  for (const key of required) {
    checks[key.toLowerCase().replace('_', '')] = (env as any)[key] ? 'ok' : 'not_configured';
  }

  checks.openrouter = env.OPENROUTER_API_KEY ? 'ok' : 'not_configured';
  checks.fio = env.FIO_API_TOKEN ? 'ok' : 'not_configured';

  const hasErrors = Object.values(checks).some((v) => v === 'error');
  const statusCode = hasErrors ? 503 : 200;

  return new Response(
    JSON.stringify({
      status: hasErrors ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      app_url: env.APP_URL,
      checks,
      details: Object.keys(details).length ? details : undefined,
      version: 'toodle-2026.04',
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
