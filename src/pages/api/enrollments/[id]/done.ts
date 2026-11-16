import type { APIRoute } from 'astro';
import { deliverNextLesson, loadDeliveryRow } from '@lib/enrollment';
import { getOne } from '@lib/db';
import { logAudit } from '@lib/audit';
import { parseFeedbackAnswer, type FeedbackAnswer } from '@lib/feedback';
import { loadFeedbackContext, saveFeedbackAnswer } from '@lib/feedback-store';
import { createFeedbackToken } from '@lib/unsubscribe';
import { env } from '@lib/env';

/**
 * On-click režim: uživatel dočetl lekci → hned pošleme další.
 *
 * Volitelné pole `answer` (1 až 3, JSON nebo formulář) nese odpověď na srozumitelnost
 * právě dočtené lekce. Odpověď postup nikdy neblokuje: další lekce odejde i po „nerozuměl
 * jsem“ a i tehdy, když se odpověď nepodaří uložit. Volání bez pole funguje jako dřív.
 *
 * U dokončeného kurzu (poslední lekce už odešla) se s odpovědí jen zapíše zpětná vazba
 * k poslední lekci a čtenář pokračuje k testu.
 *
 * Odpověď je JSON s polem `next` (kam má stránka přejít). Formulář odeslaný bez
 * JavaScriptu dostane místo toho přesměrování (303).
 */
export const POST: APIRoute = async ({ params, locals, request, redirect }) => {
  const id = params.id ?? '';
  const coursePath = `/profil/kurz/${encodeURIComponent(id)}`;
  const input = await readInput(request);

  const fail = (error: string, status: number, code: string) =>
    input.isForm ? redirect(`${coursePath}?chyba=${code}`, 303) : json({ error }, status);
  const done = (data: Record<string, unknown>, next: string) =>
    input.isForm ? redirect(next, 303) : json({ ok: true, ...data, next });

  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  const owner = await getOne<{ user_id: string }>(env.DB, `SELECT user_id FROM enrollments WHERE id = ?`, id);
  if (!owner) return json({ error: 'Zápis nenalezen' }, 404);
  if (owner.user_id !== user.id) return json({ error: 'Přístup odepřen' }, 403);

  if (input.invalid) return fail('Neplatná odpověď.', 400, 'odpoved');

  const row = await loadDeliveryRow(env, id);
  if (!row) return json({ error: 'Zápis nenalezen' }, 404);
  if (row.delivery_mode !== 'on_click') return fail('Kurz nepodporuje on-click progresi', 400, 'stav');

  // Lekce, kterou čtenář právě dočetl. `current_lesson` ukazuje na lekci, která se pošle příště.
  const readPosition = row.current_lesson - 1;

  if (row.status === 'completed' && input.answer) {
    const feedbackPath = await recordAnswer(id, readPosition, input.answer, user.id);
    const hasTest = !!(await getOne<{ id: string }>(
      env.DB, `SELECT id FROM tests WHERE course_id = ? AND questions_json != '[]'`, row.course_id,
    ));
    const next = feedbackPath && input.answer !== 1
      ? `${feedbackPath}?stav=ulozeno&z=${hasTest ? 'test' : 'kurz'}`
      : hasTest ? `/test/${encodeURIComponent(id)}` : coursePath;
    return done({ completed: true }, next);
  }

  if (row.status !== 'active' && row.status !== 'stalled') return fail('Kurz není aktivní', 400, 'stav');

  const feedbackPath = input.answer ? await recordAnswer(id, readPosition, input.answer, user.id) : null;
  const next = feedbackPath && input.answer !== 1 ? `${feedbackPath}?stav=ulozeno&z=lekce` : coursePath;

  try {
    const result = await deliverNextLesson(env, row);
    if (result.status === 'skipped') return fail('Lekce se právě odesílá, zkuste to za chvíli.', 409, 'odesila-se');
    if (result.status === 'completed') return done({ completed: true }, next);
    await logAudit(env.DB, user.id, 'lesson.done', id, { lesson: result.position });
    return done({ completed: result.completed, lesson: result.position }, next);
  } catch (err) {
    console.error(`done: delivery failed for ${id}:`, err);
    return fail('Lekci se nepodařilo odeslat. Zkuste to prosím za chvíli.', 502, 'odeslani');
  }
};

/**
 * Zapíše odpověď k dočtené lekci a vrátí cestu na stránku s upřesněním, nebo null,
 * když není k čemu odpověď zapsat nebo se zápis nepovedl. Nikdy nevyhazuje výjimku:
 * zpětná vazba nesmí zastavit odeslání další lekce.
 */
async function recordAnswer(
  enrollmentId: string,
  lessonPosition: number,
  answer: FeedbackAnswer,
  userId: string,
): Promise<string | null> {
  if (lessonPosition < 1) return null;
  try {
    const context = await loadFeedbackContext(env.DB, enrollmentId, lessonPosition);
    if (!context) return null;
    await saveFeedbackAnswer(env.DB, {
      enrollmentId,
      lessonId: context.lessonId,
      lessonVersion: context.lessonVersion,
      answer,
    });
    await logAudit(env.DB, userId, 'feedback.answered', enrollmentId, {
      lesson: lessonPosition, version: context.lessonVersion, answer,
    });
    const token = await createFeedbackToken(enrollmentId, lessonPosition, env.JWT_SECRET);
    return `/srozumitelnost/${token}`;
  } catch (err) {
    console.error(`done: feedback for ${enrollmentId} lesson ${lessonPosition} failed:`, err);
    return null;
  }
}

/** Přečte volitelnou odpověď z těla. Prázdné nebo nečitelné tělo znamená volání bez odpovědi. */
async function readInput(request: Request): Promise<{ answer: FeedbackAnswer | null; invalid: boolean; isForm: boolean }> {
  const type = request.headers.get('Content-Type') ?? '';
  const isForm = type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data');
  let raw: unknown;
  try {
    if (isForm) {
      raw = (await request.formData()).get('answer');
    } else {
      const text = await request.text();
      raw = text.trim() ? (JSON.parse(text) as { answer?: unknown } | null)?.answer : undefined;
    }
  } catch {
    raw = undefined;
  }
  if (raw === undefined || raw === null || raw === '') return { answer: null, invalid: false, isForm };
  const answer = parseFeedbackAnswer(raw);
  return { answer, invalid: answer === null, isForm };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
