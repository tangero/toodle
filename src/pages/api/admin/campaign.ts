import type { APIRoute } from 'astro';
import { env } from '@lib/env';
import {
  campaignCounts,
  parseCampaign,
  retryFailed,
  saveInvitationTemplate,
  sendInvitationBatch,
  sendTestInvitation,
} from '@lib/campaign';
import { validateInvitationTemplateInput } from '@lib/email-templates/invitation';
import { logAudit } from '@lib/audit';

/**
 * Rozesílka a úprava pozvánky. Tělo: `{ action, campaign, ... }`, kampaň musí být v CAMPAIGNS.
 * Akce:
 * - `save` (uloží předmět, preheader a Markdown tělo pozvánky pro danou vlnu),
 * - `test` (zkušební e-mail adminovi),
 * - `batch` (další dávka ze zmrazeného seznamu dané vlny; stránka ji volá opakovaně, dokud nikdo nečeká),
 * - `retry` (neúspěšné zpět do fronty).
 * Přístup hlídá middleware (jen ADMIN_EMAIL).
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const actor = locals.user!.email;
  let body: { action?: unknown; campaign?: unknown; subject?: unknown; preheader?: unknown; body_md?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }
  const action = String(body.action ?? '');
  const campaign = parseCampaign(body.campaign);
  if (!campaign) return json({ error: 'Neznámá kampaň' }, 400);

  if (action === 'save') {
    const parsed = validateInvitationTemplateInput(body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    try {
      const template = await saveInvitationTemplate(env.DB, campaign, parsed.value);
      await logAudit(env.DB, actor, 'campaign.template.save', campaign, {
        subject: template.subject,
        length: template.body_md.length,
      });
      return json({ ok: true, message: 'Text pozvánky je uložený.', template });
    } catch (err) {
      console.error('[campaign] save:', err);
      return json({ error: 'Uložení se nepovedlo. Podrobnosti jsou v logu Workeru.' }, 500);
    }
  }

  try {
    if (action === 'test') {
      const id = await sendTestInvitation(env, actor, campaign);
      await logAudit(env.DB, actor, 'campaign.test', campaign, { resend_id: id });
      return json({ ok: true, message: `Zkušební pozvánka odešla na ${actor}.` });
    }
    if (action === 'batch') {
      const result = await sendInvitationBatch(env, campaign, actor);
      return json({ ok: true, result, counts: await campaignCounts(env.DB, campaign) });
    }
    if (action === 'retry') {
      const n = await retryFailed(env.DB, campaign);
      return json({ ok: true, message: `Do fronty vráceno: ${n}.`, counts: await campaignCounts(env.DB, campaign) });
    }
  } catch (err) {
    console.error('[campaign]', err);
    return json({ error: 'Odeslání se nepovedlo. Podrobnosti jsou v logu Workeru.' }, 502);
  }
  return json({ error: 'Neznámá akce' }, 400);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
