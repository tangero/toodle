import type { APIRoute } from 'astro';
import { getOne, run } from '@lib/db';

interface ResendWebhookEvent {
  type: string;
  data: {
    email_id?: string;
    [key: string]: unknown;
  };
}

import { env } from '@lib/env';
import { toSqlDateTime } from '@lib/time';

export const POST: APIRoute = async ({ request }) => {

  // Podpis (svix) je povinný – bez secretu nebo hlaviček webhook odmítneme.
  if (!env.RESEND_WEBHOOK_SECRET) {
    console.error('RESEND_WEBHOOK_SECRET není nastaven – webhook odmítnut');
    return new Response('Webhook not configured', { status: 503 });
  }
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing signature', { status: 401 });
  }
  // Ochrana proti přehrání starých zpráv: max. 5 minut.
  const ts = Number(svixTimestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    return new Response('Stale timestamp', { status: 401 });
  }

  const body = await request.text();
  const isValid = await verifyWebhookSignature(body, svixId, svixTimestamp, svixSignature, env.RESEND_WEBHOOK_SECRET);
  if (!isValid) return new Response('Invalid signature', { status: 401 });

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(body) as ResendWebhookEvent;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const resendId = event.data?.email_id;
  if (!resendId) return new Response('OK', { status: 200 });

  const logRow = await getOne<{ id: string; enrollment_id: string | null }>(
    env.DB, `SELECT id, enrollment_id FROM email_log WHERE resend_id = ?`, resendId,
  );
  if (!logRow) return new Response('OK', { status: 200 });

  const now = toSqlDateTime(new Date());

  switch (event.type) {
    case 'email.opened':
      await run(env.DB, `UPDATE email_log SET opened_at = ? WHERE id = ? AND opened_at IS NULL`, now, logRow.id);
      break;

    case 'email.clicked':
      await run(env.DB, `UPDATE email_log SET clicked_at = ? WHERE id = ? AND clicked_at IS NULL`, now, logRow.id);
      break;

    case 'email.bounced':
      await run(env.DB, `UPDATE email_log SET bounced_at = ? WHERE id = ?`, now, logRow.id);
      // Pause enrollment on hard bounce
      if (logRow.enrollment_id) {
        await run(
          env.DB,
          `UPDATE enrollments SET status = 'paused', next_send_at = NULL WHERE id = ? AND status = 'active'`,
          logRow.enrollment_id,
        );
      }
      break;

    case 'email.complained':
      await run(env.DB, `UPDATE email_log SET bounced_at = ? WHERE id = ?`, now, logRow.id);
      if (logRow.enrollment_id) {
        await run(
          env.DB,
          `UPDATE enrollments SET status = 'cancelled', next_send_at = NULL WHERE id = ?`,
          logRow.enrollment_id,
        );
      }
      break;
  }

  return new Response('OK', { status: 200 });
};

async function verifyWebhookSignature(
  body: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const signedContent = `${svixId}.${svixTimestamp}.${body}`;
    const secretBytes = Uint8Array.from(atob(secret.replace('whsec_', '')), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signatures = svixSignature.split(' ').map((s) => s.replace(/^v1,/, ''));
    for (const sig of signatures) {
      const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
      const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signedContent));
      if (valid) return true;
    }
    return false;
  } catch {
    return false;
  }
}
