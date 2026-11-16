/**
 * Centralizovaný a typově bezpečný přístup k Cloudflare environmentu.
 * 
 * Používej tento helper místo přímého importu "cloudflare:workers"
 * – usnadňuje případné mockování a refaktoring.
 */
import { env as cloudflareEnv } from "cloudflare:workers";
import type { D1Database, R2Bucket, ExecutionContext, Fetcher } from "@cloudflare/workers-types";

/** Cloudflare Rate Limiting binding (ratelimits ve wrangler.jsonc). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface AppEnv {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  /** Volitelné – bez bindingu se použije jen záložní limit v paměti. */
  RATE_LIMITER?: RateLimitBinding;

  APP_URL: string;
  MAIL_FROM: string;

  RESEND_API_KEY: string;
  RESEND_WEBHOOK_SECRET: string;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL?: string;
  FIO_API_TOKEN: string;
  ADMIN_EMAIL: string;
  JWT_SECRET: string;
  CRON_SECRET: string;

  /** Jen pro lokální vývoj: "1" = e-maily se neposílají, jen vypíšou do konzole. */
  EMAIL_DEV_LOG?: string;

  BETTERSTACK_HEARTBEAT_LESSONS?: string;
  BETTERSTACK_HEARTBEAT_PAYMENTS?: string;
  BETTERSTACK_HEARTBEAT_REMINDERS?: string;
  BETTERSTACK_HEARTBEAT_DIGEST?: string;
}

/** Typově bezpečný přístup k env proměnným a bindingům */
export const env: AppEnv = cloudflareEnv as unknown as AppEnv;

/** Pomocná funkce pro získání ExecutionContext (pokud je potřeba) */
export function getCfContext(locals: App.Locals): ExecutionContext | undefined {
  return locals.cfContext;
}
