import { getAll, getOne, run } from './db';
import type { AppEnv } from './env';
import { EmailSendError, isAlreadySentConflict, sendEmail } from './email';
import {
  DEFAULT_INVITATION_MD,
  INVITATION_PREHEADER,
  INVITATION_SUBJECT,
  invitationEmail,
  type InvitationCourse,
  type InvitationTemplateInput,
} from './email-templates/invitation';
import { createPromoOptOutToken } from './unsubscribe';
import { toSqlDateTime } from './time';
import { logAudit } from './audit';

/**
 * Rozesílka pozvánky k novým kurzům (pilotní běh a další vlny). Příjemci jsou zmrazení v tabulce
 * campaign_recipients (scripts/pilot/zmrazit_prijemce.py), posílá se jen z ní: každé
 * spuštění vezme další dávku čekajících, nikdy nové lidi.
 *
 * Řádek se nejdřív zabere (status 'sending' + čas), teprve pak se volá Resend
 * s Idempotency-Key z kampaně a uživatele. Zámek starší 10 minut je opuštěný a řádek
 * jde znovu; díky klíči Resend druhý e-mail nepošle.
 */
/**
 * Vlny pozvánky, od nejstarší. Každá má vlastní zmrazený seznam a vlastní Idempotency-Key;
 * skript zmrazení do nové vlny nepustí nikoho, kdo už je v jiné. Novou vlnu přidejte na konec.
 */
export const CAMPAIGNS = ['pilot-2026-11', 'vlna2-2026-11', 'vlna3-2026-11'] as const;
export type Campaign = (typeof CAMPAIGNS)[number];
/** Výchozí vlna v adminu: poslední v seznamu. */
export const CURRENT_CAMPAIGN: Campaign = CAMPAIGNS[CAMPAIGNS.length - 1];

export function parseCampaign(value: unknown): Campaign | null {
  return (CAMPAIGNS as readonly unknown[]).includes(value) ? (value as Campaign) : null;
}

/** Kolik e-mailů pošle jeden požadavek (Resend snese 2 za sekundu, Worker má limit podpožadavků). */
export const CAMPAIGN_BATCH = 5;
const SEND_GAP_MS = 600;
const STALE_LOCK = `datetime('now', '-10 minutes')`;

export interface CampaignCounts {
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  skipped: number;
  total: number;
}

export interface InvitationTemplate extends InvitationTemplateInput {
  is_custom: boolean;
  updated_at: string | null;
}

export async function campaignCounts(db: D1Database, campaign: string): Promise<CampaignCounts> {
  const rows = await getAll<{ status: keyof CampaignCounts; n: number }>(
    db, `SELECT status, COUNT(*) AS n FROM campaign_recipients WHERE campaign = ? GROUP BY status`, campaign,
  );
  const counts: CampaignCounts = { pending: 0, sending: 0, sent: 0, failed: 0, skipped: 0, total: 0 };
  for (const r of rows) {
    counts[r.status] = r.n;
    counts.total += r.n;
  }
  return counts;
}

/** Načte uložený text pozvánky pro vlnu, nebo vrátí výchozí šablonu z kódu. */
export async function getInvitationTemplate(db: D1Database, campaign: string): Promise<InvitationTemplate> {
  const row = await getOne<{ subject: string; preheader: string; body_md: string; updated_at: string }>(
    db,
    `SELECT subject, preheader, body_md, updated_at FROM campaign_templates WHERE campaign = ?`,
    campaign,
  );
  if (row) {
    return { ...row, is_custom: true };
  }
  return {
    subject: INVITATION_SUBJECT,
    preheader: INVITATION_PREHEADER,
    body_md: DEFAULT_INVITATION_MD,
    is_custom: false,
    updated_at: null,
  };
}

/** Uloží (nebo aktualizuje) text pozvánky v Markdownu pro danou vlnu kampaně. */
export async function saveInvitationTemplate(
  db: D1Database,
  campaign: string,
  input: InvitationTemplateInput,
): Promise<InvitationTemplate> {
  const now = toSqlDateTime(new Date());
  await run(
    db,
    `INSERT INTO campaign_templates (campaign, subject, preheader, body_md, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(campaign) DO UPDATE SET
       subject = excluded.subject,
       preheader = excluded.preheader,
       body_md = excluded.body_md,
       updated_at = excluded.updated_at`,
    campaign, input.subject, input.preheader, input.body_md, now,
  );
  return { ...input, is_custom: true, updated_at: now };
}

/** Publikované kurzy v pořadí katalogu, pro seznam v pozvánce. */
export async function invitationCourses(db: D1Database): Promise<InvitationCourse[]> {
  return getAll<InvitationCourse>(
    db,
    // Stejný počet lekcí jako v katalogu (courses.lesson_count).
    `SELECT slug, title, lesson_count FROM courses WHERE status = 'published' ORDER BY sort_order, title`,
  );
}

async function renderInvitation(
  env: AppEnv,
  user: { id: string; name: string; email: string },
  courses: InvitationCourse[],
  template: InvitationTemplateInput,
) {
  const token = await createPromoOptOutToken(user.id, env.JWT_SECRET);
  return {
    html: invitationEmail({
      courses,
      appUrl: env.APP_URL,
      optOutUrl: `${env.APP_URL}/odhlaseni-nabidek/${token}`,
      subject: template.subject,
      preheader: template.preheader,
      bodyMd: template.body_md,
    }),
    // Odhlášení jedním kliknutím z poštovního klienta odhlásí nabídky (RFC 8058).
    headers: {
      'List-Unsubscribe': `<${env.APP_URL}/api/unsubscribe/nabidky/${token}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

/** Zkušební pozvánka na adresu admina. Do seznamu příjemců se nezapisuje. */
export async function sendTestInvitation(
  env: AppEnv,
  adminEmail: string,
  campaign: string = CURRENT_CAMPAIGN,
): Promise<string> {
  const admin = await getOne<{ id: string; name: string; email: string }>(
    env.DB, `SELECT id, name, email FROM users WHERE email = ? AND deleted_at IS NULL`, adminEmail,
  );
  const [courses, template] = await Promise.all([
    invitationCourses(env.DB),
    getInvitationTemplate(env.DB, campaign),
  ]);
  const { html, headers } = await renderInvitation(
    env,
    admin ?? { id: 'test', name: '', email: adminEmail },
    courses,
    template,
  );
  const result = await sendEmail(env, {
    to: adminEmail,
    subject: `[Zkouška] ${template.subject}`,
    html,
    headers,
    tags: [{ name: 'type', value: 'invitation-test' }],
  });
  return result.id;
}

export interface BatchResult {
  sent: number;
  failed: number;
  skipped: number;
  /** Resend vrátil 429, zbytek dávky se nechal na příště. */
  throttled: boolean;
  /** Resend odmítl kvůli denní nebo měsíční kvótě tarifu: čekání nepomůže, rozesílka se má zastavit. */
  quotaExceeded: boolean;
}

/** Pošle další dávku čekajících pozvánek. */
export async function sendInvitationBatch(env: AppEnv, campaign: string, actor: string): Promise<BatchResult> {
  const result: BatchResult = { sent: 0, failed: 0, skipped: 0, throttled: false, quotaExceeded: false };
  const [courses, template] = await Promise.all([
    invitationCourses(env.DB),
    getInvitationTemplate(env.DB, campaign),
  ]);
  const candidates = await getAll<{ user_id: string }>(
    env.DB,
    `SELECT user_id FROM campaign_recipients
      WHERE campaign = ? AND (status = 'pending' OR (status = 'sending' AND datetime(sending_at) < ${STALE_LOCK}))
      ORDER BY created_at, user_id LIMIT ?`,
    campaign, CAMPAIGN_BATCH,
  );

  for (const [i, { user_id }] of candidates.entries()) {
    const now = toSqlDateTime(new Date());
    const claimed = await run(
      env.DB,
      `UPDATE campaign_recipients SET status = 'sending', sending_at = ?
        WHERE campaign = ? AND user_id = ?
          AND (status = 'pending' OR (status = 'sending' AND datetime(sending_at) < ${STALE_LOCK}))`,
      now, campaign, user_id,
    );
    if (!claimed.meta.changes) continue;

    // Stav uživatele se mohl od zmrazení seznamu změnit. Admin pozvánku nedostává (zkouška má vlastní tlačítko).
    const user = await getOne<{ id: string; email: string; name: string }>(
      env.DB,
      `SELECT id, email, name FROM users WHERE id = ? AND deleted_at IS NULL AND promo_opt_out_at IS NULL`,
      user_id,
    );
    if (!user || user.email.toLowerCase() === env.ADMIN_EMAIL.trim().toLowerCase()) {
      await run(env.DB, `UPDATE campaign_recipients SET status = 'skipped' WHERE campaign = ? AND user_id = ?`, campaign, user_id);
      result.skipped++;
      continue;
    }

    if (i > 0) await new Promise((r) => setTimeout(r, SEND_GAP_MS));
    const { html, headers } = await renderInvitation(env, user, courses, template);
    try {
      const sent = await sendEmail(env, {
        to: user.email,
        subject: template.subject,
        html,
        headers,
        idempotencyKey: `campaign-${campaign}-${user.id}`,
        tags: [{ name: 'type', value: 'invitation' }],
      });
      await markSent(env.DB, campaign, user.id, sent.id);
      result.sent++;
    } catch (err) {
      if (isAlreadySentConflict(err)) {
        // Pod stejným klíčem už Resend e-mail přijal (opakovaný pokus po přerušení).
        console.warn(`[campaign] ${campaign} ${user.id}: 409 idempotence, považuji za odeslané`);
        await markSent(env.DB, campaign, user.id, null);
        result.sent++;
      } else if (err instanceof EmailSendError && err.status === 429) {
        await run(env.DB, `UPDATE campaign_recipients SET status = 'pending', sending_at = NULL WHERE campaign = ? AND user_id = ?`, campaign, user.id);
        result.throttled = true;
        result.quotaExceeded = /quota_exceeded/.test(err.body);
        break;
      } else {
        const message = err instanceof Error ? err.message.slice(0, 500) : String(err);
        console.error(`[campaign] ${campaign} ${user.id}: ${message}`);
        await run(
          env.DB,
          `UPDATE campaign_recipients SET status = 'failed', error = ?, sending_at = NULL WHERE campaign = ? AND user_id = ?`,
          message, campaign, user.id,
        );
        result.failed++;
      }
    }
  }

  if (result.sent || result.failed) await logAudit(env.DB, actor, 'campaign.batch', campaign, { ...result });
  return result;
}

async function markSent(db: D1Database, campaign: string, userId: string, resendId: string | null) {
  await run(
    db,
    `UPDATE campaign_recipients SET status = 'sent', sent_at = ?, resend_id = ?, error = NULL, sending_at = NULL
      WHERE campaign = ? AND user_id = ?`,
    toSqlDateTime(new Date()), resendId, campaign, userId,
  );
}

/** Neúspěšné pokusy vrátí do fronty (tlačítko v adminu). */
export async function retryFailed(db: D1Database, campaign: string): Promise<number> {
  const r = await run(db, `UPDATE campaign_recipients SET status = 'pending', error = NULL WHERE campaign = ? AND status = 'failed'`, campaign);
  return r.meta.changes ?? 0;
}
