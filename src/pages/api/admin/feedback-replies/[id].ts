import type { APIRoute } from 'astro';
import { env } from '@lib/env';
import { logAudit } from '@lib/audit';
import { draftReply, loadReplyContext, ReplyDraftError, REPLY_MAX_LENGTH, saveReplyDraft, sendReply, type SendReplyResult } from '@lib/feedback-reply';

/**
 * Odpověď na připomínku čtenáře. Formulář z /admin/odpovedi/[id] posílá `action`:
 * - `draft`: návrh od jazykového modelu (placené volání, jen na kliknutí), uloží se jako koncept,
 * - `save`: uloží text upravený adminem,
 * - `send`: uloží text a odešle ho čtenáři.
 * Klient posílá jen id připomínky a text; vše ostatní se načítá na serveru.
 */
export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  const actor = locals.user!.email;
  const id = params.id ?? '';
  const back = (status: string) => redirect(`/admin/odpovedi/${encodeURIComponent(id)}?stav=${status}`, 303);

  const ctx = await loadReplyContext(env.DB, id);
  if (!ctx) return new Response('Připomínka nenalezena', { status: 404 });

  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  const body = String(form.get('body') ?? '').replace(/\r\n/g, '\n').trim().slice(0, REPLY_MAX_LENGTH);

  if (ctx.reply_status === 'sent') return back('odeslano');
  // Rozpracované odeslání (souběžné, nebo přerušené před zápisem výsledku): text už neměníme.
  // Odeslat jde znovu, sendReply řádek zabere až po vypršení zámku a Resend ho pod stejným klíčem nezdvojí.
  if (ctx.reply_status === 'sending') {
    if (action !== 'send') return back('odesila-se');
    const result = await sendReply(env, ctx);
    if (result === 'sent') await logAudit(env.DB, actor, 'feedback_reply.send', id);
    return back(statusFor(result));
  }

  if (action === 'draft') {
    try {
      const draft = await draftReply(env, ctx);
      await saveReplyDraft(env.DB, id, draft.body, draft.model);
      await logAudit(env.DB, actor, 'feedback_reply.draft', id, { model: draft.model });
      return back('navrh');
    } catch (err) {
      console.error('[feedback-reply] návrh:', err instanceof ReplyDraftError ? err.message : err);
      return back('chyba-modelu');
    }
  }

  if (action === 'save' || action === 'send') {
    if (!body) return back('prazdne');
    await saveReplyDraft(env.DB, id, body, null);
    if (action === 'save') return back('ulozeno');
    const fresh = await loadReplyContext(env.DB, id);
    const result = fresh ? await sendReply(env, fresh) : 'empty';
    if (result === 'sent') await logAudit(env.DB, actor, 'feedback_reply.send', id);
    return back(statusFor(result));
  }

  return back('neznama-akce');
};

function statusFor(result: SendReplyResult): string {
  return { sent: 'odeslano', failed: 'chyba-odeslani', 'not-draft': 'odesila-se', empty: 'prazdne' }[result];
}
