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
 *
 * Volitelné pole `z` říká, odkud čtenář přišel (stejné hodnoty jako u upřesnění). Ze stránky
 * kurzu na potvrzení (`z=kurz`) se po odpovědi 1 vrací rovnou na kurz, protože upřesnění se
 * k ní nenabízí; po odpovědi 2 a 3 jde na stránku s upřesněním a odkazem zpět na kurz.
 */
const ORIGINS = new Set(['lekce', 'test', 'kurz']);

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const token = params.token ?? '';
  let origin = '';
  const back = (stav: string) => redirect(`/srozumitelnost/${encodeURIComponent(token)}?stav=${stav}${origin}`, 303);

  const target = await verifyFeedbackToken(token, env.JWT_SECRET);
  if (!target) return new Response('Odkaz na zpětnou vazbu není platný.', { status: 400 });

  if (!(await checkRateLimit(env, `feedback:${clientIp(request)}`))) return back('limit');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back('chyba');
  }
  const from = form.get('z');
  if (typeof from === 'string' && ORIGINS.has(from)) origin = `&z=${from}`;

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

  if (from === 'kurz' && answer === 1) {
    return redirect(`/profil/kurz/${encodeURIComponent(context.enrollmentId)}?srozumitelnost=ulozeno`, 303);
  }
  return back('ulozeno');
};
