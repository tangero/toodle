import type { APIRoute } from 'astro';
import { env } from '@lib/env';
import { campaignCounts, parseCampaign, retryFailed, sendInvitationBatch, sendTestInvitation } from '@lib/campaign';
import { logAudit } from '@lib/audit';

/**
 * Rozesílka pozvánky. Tělo: `{ action, campaign }`, kampaň musí být v CAMPAIGNS.
 * Akce: `test` (zkušební e-mail adminovi), `batch` (další dávka ze zmrazeného seznamu dané
 * vlny; stránka ji volá opakovaně, dokud nikdo nečeká), `retry` (neúspěšné zpět do fronty).
 * Přístup hlídá middleware (jen ADMIN_EMAIL).
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const actor = locals.user!.email;
  let action = '';
  let campaignRaw: unknown;
  try {
    const body = (await request.json()) as { action?: unknown; campaign?: unknown };
    action = String(body.action ?? '');
    campaignRaw = body.campaign;
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }
  const campaign = parseCampaign(campaignRaw);
  if (!campaign) return json({ error: 'Neznámá kampaň' }, 400);

  try {
    if (action === 'test') {
      const id = await sendTestInvitation(env, actor);
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
