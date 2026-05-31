/**
 * Centralizovaný a typově bezpečný přístup k Cloudflare environmentu.
 * 
 * Používej tento helper místo přímého importu "cloudflare:workers"
 * – usnadňuje případné mockování a refaktoring.
 */
import { env as cloudflareEnv } from "cloudflare:workers";
import type { D1Database, R2Bucket, ExecutionContext, Fetcher } from "@cloudflare/workers-types";

export interface AppEnv {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;

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

  BETTERSTACK_HEARTBEAT_LESSONS?: string;
  BETTERSTACK_HEARTBEAT_PAYMENTS?: string;
  BETTERSTACK_HEARTBEAT_REMINDERS?: string;
  BETTERSTACK_HEARTBEAT_DIGEST?: string;
}

/** Typově bezpečný přístup k env proměnným a bindingům */
export const env: AppEnv = cloudflareEnv as AppEnv;

/** Pomocná funkce pro získání ExecutionContext (pokud je potřeba) */
export function getCfContext(locals: App.Locals): ExecutionContext | undefined {
  return locals.cfContext;
}
