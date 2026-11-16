import type { APIRoute } from 'astro';
import { verifyFeedbackToken } from '@lib/unsubscribe';
import { parseFeedbackAnswer } from '@lib/feedback';
import { loadFeedbackContext, saveFeedbackAnswer } from '@lib/feedback-store';
import { logAudit } from '@lib/audit';
import { checkRateLimit, clientIp } from '@lib/rate-limit';
import { env } from '@lib/env';

/**
 * Uložení odpovědi na otázku „Jak srozumitelná byla lekce?“ z formuláře na /srozumitelnost/[token].
 *
 * Formulář se odesílá bez JavaScriptu, proto endpoint odpovídá přesměrováním (303) zpět
 * na stránku s parametrem `stav`. Token je HMAC vázaný na zápis a id lekce, přihlášení
 * není potřeba. Opakovaná odpověď dřívější přepíše.
 */
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const token = params.token ?? '';
  const back = (stav: string) => redirect(`/srozumitelnost/${encodeURIComponent(token)}?stav=${stav}`, 303);

  const target = await verifyFeedbackToken(token, env.JWT_SECRET);
  if (!target) return new Response('Odkaz na zpětnou vazbu není platný.', { status: 400 });

  if (!(await checkRateLimit(env, `feedback:${clientIp(request)}`))) return back('limit');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back('chyba');
  }

  const answer = parseFeedbackAnswer(form.get('answer'));
  if (!answer) return back('odpoved');

  const context = await loadFeedbackContext(env.DB, target.enrollmentId, { lessonId: target.lessonId });
  if (!context) return new Response('Odkaz na zpětnou vazbu není platný.', { status: 400 });

  await saveFeedbackAnswer(env.DB, {
    enrollmentId: context.enrollmentId,
    lessonId: context.lessonId,
    lessonVersion: context.deliveredVersion,
    answer,
  });
  await logAudit(env.DB, 'feedback', 'feedback.answered', context.enrollmentId, {
    lesson: context.lessonPosition, version: context.deliveredVersion, answer,
  });

  return back('ulozeno');
};
