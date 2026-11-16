import type { APIRoute } from 'astro';
import { verifyFeedbackToken } from '@lib/unsubscribe';
import { parseFeedbackDetail, parseSectionsJson } from '@lib/feedback';
import { loadFeedbackContext, saveFeedbackDetail, sectionsOf } from '@lib/feedback-store';
import { logAudit } from '@lib/audit';
import { checkRateLimit, clientIp } from '@lib/rate-limit';
import { env } from '@lib/env';

/** Odkud čtenář na stránku přišel; hodnota se jen přenáší zpět do adresy. */
const ORIGINS = new Set(['lekce', 'test', 'kurz']);

/**
 * Dobrovolné upřesnění k odpovědi 2 nebo 3: označené části lekce a jedna věta.
 * Ukládá se k existující odpovědi, novou nezakládá. Odpovídá přesměrováním (303)
 * zpět na /srozumitelnost/[token], formulář funguje bez JavaScriptu.
 */
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const token = params.token ?? '';

  const target = await verifyFeedbackToken(token, env.JWT_SECRET);
  if (!target) return new Response('Odkaz na zpětnou vazbu není platný.', { status: 400 });

  let form: FormData | null = null;
  try {
    form = await request.formData();
  } catch {
    // Ohlásí se níže jako chyba, až bude jasné, kam přesměrovat.
  }
  const from = form?.get('z');
  const origin = typeof from === 'string' && ORIGINS.has(from) ? `&z=${from}` : '';
  const back = (stav: string) => redirect(`/srozumitelnost/${encodeURIComponent(token)}?stav=${stav}${origin}`, 303);

  if (!form) return back('chyba');
  if (!(await checkRateLimit(env, `feedback:${clientIp(request)}`))) return back('limit');

  const context = await loadFeedbackContext(env.DB, target.enrollmentId, { lessonId: target.lessonId });
  if (!context) return new Response('Odkaz na zpětnou vazbu není platný.', { status: 400 });

  const parsed = parseFeedbackDetail(
    { sections: form.getAll('sections'), comment: form.get('comment') },
    // Části se nabízejí jen z textu, který čtenář dostal. Po úpravě lekce starší znění nemáme.
    context.textIsDelivered ? sectionsOf(context.contentMd) : [],
  );
  if (!parsed.ok) return back('text');
  // Formulář k upravené lekci části neposílá; dříve označené části proto nepřepisujeme.
  if (!context.textIsDelivered) parsed.value.sections = parseSectionsJson(context.sectionsJson);

  const saved = await saveFeedbackDetail(env.DB, {
    enrollmentId: context.enrollmentId,
    lessonId: context.lessonId,
    lessonVersion: context.deliveredVersion,
    detail: parsed.value,
  });
  if (!saved) return back('bez-odpovedi');

  // Text připomínky do auditu nepatří (osobní údaj, při smazání účtu by v logu zůstal).
  await logAudit(env.DB, 'feedback', 'feedback.detailed', context.enrollmentId, {
    lesson: context.lessonPosition,
    sections: parsed.value.sections.map((s) => s.n),
    has_comment: parsed.value.comment.length > 0,
  });

  return back('upresneno');
};
