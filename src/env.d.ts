/// <reference types="astro/client" />
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare module "cloudflare:workers" {
  interface Env {
    // D1 + R2 bindings
    DB: D1Database;
    BUCKET: R2Bucket;
    ASSETS: Fetcher;

    // Public vars
    APP_URL: string;
    MAIL_FROM: string;

    // Secrets
    RESEND_API_KEY: string;
    RESEND_WEBHOOK_SECRET: string;
    OPENROUTER_API_KEY: string;
    OPENROUTER_MODEL?: string;
    FIO_API_TOKEN: string;
    ADMIN_EMAIL: string;
    JWT_SECRET: string;
    CRON_SECRET: string;

    // Optional monitoring
    BETTERSTACK_HEARTBEAT_LESSONS?: string;
    BETTERSTACK_HEARTBEAT_PAYMENTS?: string;
    BETTERSTACK_HEARTBEAT_REMINDERS?: string;
    BETTERSTACK_HEARTBEAT_DIGEST?: string;
  }

  export const env: Env;
}

declare namespace App {
  interface Locals {
    // Nový pattern v Astro 6+
    cfContext?: ExecutionContext;

    // Naplněno v middleware.ts (přihlášený uživatel)
    user?: {
      id: string;
      email: string;
      name: string;
    } | null;
  }
}

// Globální augmentace pro Astro.locals v .astro souborech
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
        name: string;
      } | null;
    }
  }
}
