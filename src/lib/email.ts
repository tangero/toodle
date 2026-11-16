import type { AppEnv } from './env';
import { generateId, run } from './db';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  tags?: { name: string; value: string }[];
  /** Další hlavičky e-mailu (např. List-Unsubscribe). */
  headers?: Record<string, string>;
  /**
   * Resend Idempotency-Key – stejný klíč do 24 h nevytvoří druhý e-mail.
   * Chrání před dvojím odesláním lekce při opakovaném běhu cronu.
   */
  idempotencyKey?: string;
}

interface SendEmailResult {
  id: string;
}

const RESEND_TIMEOUT_MS = 15_000;

/** Chyba vrácená Resendem – nese stavový kód, aby šlo rozlišit kolizi Idempotency-Key. */
export class EmailSendError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`Resend API error: ${status} ${body}`);
    this.name = 'EmailSendError';
  }
}

/**
 * Resend odmítl požadavek, protože pod stejným Idempotency-Key už během 24 h přijal
 * e-mail s jiným obsahem (409 invalid_idempotent_request). Znamená to, že původní e-mail
 * odešel; liší se jen tělo – typicky blok nabídek, který se mezi pokusy změnil.
 */
export function isAlreadySentConflict(err: unknown): boolean {
  return err instanceof EmailSendError && err.status === 409 && err.body.includes('invalid_idempotent_request');
}

export async function sendEmail(
  env: AppEnv,
  params: SendEmailParams,
): Promise<SendEmailResult> {
  if (env.EMAIL_DEV_LOG === '1') {
    const id = `dev-${generateId()}`;
    console.log(`[email:dev] ${id} → ${params.to} | ${params.subject}`);
    console.log(`[email:dev-body] ${id} ${params.html.replace(/\s+/g, ' ')}`);
    return { id };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  };
  if (params.idempotencyKey) headers['Idempotency-Key'] = params.idempotencyKey;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      tags: params.tags,
      headers: params.headers,
    }),
  });

  if (!response.ok) {
    throw new EmailSendError(response.status, await response.text());
  }

  const data = (await response.json()) as { id: string };
  return { id: data.id };
}

/** Záznam do email_log – kvůli párování webhooků (doručeno, bounce, stížnost). */
export async function logEmail(
  env: AppEnv,
  entry: { enrollmentId: string | null; lessonId?: string | null; template: string; resendId: string | null },
): Promise<void> {
  await run(
    env.DB,
    `INSERT INTO email_log (id, enrollment_id, lesson_id, template, resend_id) VALUES (?, ?, ?, ?, ?)`,
    generateId(),
    entry.enrollmentId,
    entry.lessonId ?? null,
    entry.template,
    entry.resendId,
  );
}

/** Hlavičky pro odhlášení jedním kliknutím (RFC 8058, vyžadují Gmail a Yahoo). */
export function listUnsubscribeHeaders(appUrl: string, unsubscribeToken: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${appUrl}/api/unsubscribe/${unsubscribeToken}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}
