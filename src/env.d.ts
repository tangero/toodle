/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;

  // Vars
  APP_URL: string;
  MAIL_FROM: string;

  // Secrets
  RESEND_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  FIO_API_TOKEN: string;
  ADMIN_EMAIL: string;
  JWT_SECRET: string;
  CRON_SECRET: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user?: {
      id: string;
      email: string;
      name: string;
    } | null;
  }
}
