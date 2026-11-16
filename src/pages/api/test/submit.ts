import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { evaluateOpenEndedAnswers, MAX_ANSWER_LENGTH } from '@lib/llm';
import { issueCertificate } from '@lib/certificate';
import { sendEmail, logEmail } from '@lib/email';
import { certificateEmail } from '@lib/email-templates/certificate';
import { logAudit } from '@lib/audit';
import type { TestQuestion } from '@lib/types';
import { env } from '@lib/env';

const PASSING_SCORE = 70;
/** Max. počet odevzdání testu za 24 h na jeden zápis (každé stojí volání LLM). */
const MAX_ATTEMPTS_PER_DAY = 5;

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  let body: { enrollmentId?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const enrollmentId = typeof body.enrollmentId === 'string' ? body.enrollmentId : '';
  const answers = sanitizeAnswers(body.answers);
  if (!enrollmentId || !answers) return json({ error: 'Neplatný požadavek' }, 400);

  const enrollment = await getOne<{ id: string; user_id: string; course_id: string; status: string; score: number | null }>(
    env.DB, `SELECT id, user_id, course_id, status, score FROM enrollments WHERE id = ?`, enrollmentId,
  );
  if (!enrollment) return json({ error: 'Zápis nenalezen' }, 404);
  if (enrollment.user_id !== user.id) return json({ error: 'Přístup odepřen' }, 403);
  if (enrollment.status !== 'completed') return json({ error: 'Kurz není dokončen' }, 400);

  const recent = await getOne<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM test_attempts
     WHERE enrollment_id = ? AND datetime(completed_at) > datetime('now', '-1 day')`,
    enrollmentId,
  );
  if ((recent?.count ?? 0) >= MAX_ATTEMPTS_PER_DAY) {
    return json({ error: `Test lze odevzdat nejvýše ${MAX_ATTEMPTS_PER_DAY}× za 24 hodin. Zkuste to prosím zítra.` }, 429);
  }

  const testRow = await getOne<{ questions_json: string }>(
    env.DB, `SELECT questions_json FROM tests WHERE course_id = ?`, enrollment.course_id,
  );
  if (!testRow) return json({ error: 'Test nenalezen' }, 404);

  const questions: TestQuestion[] = JSON.parse(testRow.questions_json);
  if (questions.length === 0) return json({ error: 'Test nemá otázky' }, 400);

  const courseRow = await getOne<{ title: string }>(
    env.DB, `SELECT title FROM courses WHERE id = ?`, enrollment.course_id,
  );

  let totalPoints = 0;
  let earnedPoints = 0;
  const feedbackItems: { question_id: string; points_awarded: number; max_points: number; feedback: string }[] = [];
  let llmRaw = '';

  for (const q of questions.filter((q) => q.type === 'multiple_choice')) {
    totalPoints += q.max_points;
    const correct = answers[q.id] === q.correct_option_id;
    if (correct) earnedPoints += q.max_points;
    feedbackItems.push({
      question_id: q.id,
      points_awarded: correct ? q.max_points : 0,
      max_points: q.max_points,
      feedback: correct ? 'Správně!' : 'Nesprávně.',
    });
  }

  const openQuestions = questions.filter((q) => q.type === 'open_ended');
  if (openQuestions.length > 0) {
    for (const q of openQuestions) totalPoints += q.max_points;
    try {
      const { evaluations, raw } = await evaluateOpenEndedAnswers(
        env.OPENROUTER_API_KEY,
        courseRow?.title ?? '',
        openQuestions.map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: answers[q.id] ?? '',
          maxPoints: q.max_points,
        })),
        env.OPENROUTER_MODEL,
      );
      llmRaw = raw;
      for (const ev of evaluations) {
        earnedPoints += ev.points_awarded;
        feedbackItems.push(ev);
      }
    } catch (err) {
      // Pokus se neukládá a nezapočítává – student odešle test znovu.
      console.error('LLM evaluation failed:', err);
      return json({ error: 'Automatické hodnocení otevřených otázek se teď nepodařilo. Vaše odpovědi zůstaly ve formuláři – zkuste test odeslat znovu za chvíli.' }, 503);
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= PASSING_SCORE;

  const attemptId = generateId();
  await run(
    env.DB,
    `INSERT INTO test_attempts (id, enrollment_id, answers_json, score, feedback_json, llm_evaluation_raw, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    attemptId, enrollmentId, JSON.stringify(answers), score,
    JSON.stringify(feedbackItems), llmRaw || null,
  );

  const existingCert = await getOne<{ id: string }>(
    env.DB, `SELECT id FROM certificates WHERE enrollment_id = ?`, enrollmentId,
  );
  const previousBest = enrollment.score;

  // Certifikát: když ještě žádný není (i po dřívějším selhání generování), nebo při lepším skóre.
  let certificatePublicId: string | null = null;
  let certificateError = false;
  if (passed && (!existingCert || previousBest === null || score > previousBest)) {
    const userRow = await getOne<{ name: string; email: string }>(
      env.DB, `SELECT name, email FROM users WHERE id = ?`, user.id,
    );
    try {
      const { publicId } = await issueCertificate(
        env.DB, env.BUCKET, enrollmentId,
        userRow?.name ?? user.name,
        courseRow?.title ?? '',
        score,
        env.APP_URL,
      );
      certificatePublicId = publicId;
    } catch (err) {
      certificateError = true;
      console.error(`Certificate issue failed for ${enrollmentId}:`, err);
    }

    if (certificatePublicId) {
      try {
        const { id } = await sendEmail(env, {
          to: userRow?.email ?? user.email,
          subject: `Váš certifikát — ${courseRow?.title ?? ''}`,
          html: certificateEmail(userRow?.name ?? user.name, courseRow?.title ?? '', score,
            `${env.APP_URL}/certifikat/${certificatePublicId}`),
          tags: [{ name: 'type', value: 'certificate' }],
        });
        await logEmail(env, { enrollmentId, template: 'certificate', resendId: id });
      } catch (err) {
        console.error(`Certificate email failed for ${enrollmentId}:`, err);
      }
    }
  }

  // Nejlepší skóre (issueCertificate ho nastavuje sám; tady pro neúspěšné / nezlepšené pokusy).
  if (!certificatePublicId && (previousBest === null || score > previousBest)) {
    await run(env.DB, `UPDATE enrollments SET score = ? WHERE id = ?`, score, enrollmentId);
  }

  await logAudit(env.DB, user.id, 'test.submitted', attemptId, { score, passed });
  return json({ ok: true, score, passed, feedback: feedbackItems, certificatePublicId, certificateError });
};

/** Odpovědi: objekt { idOtazky: text }, max. 100 otázek, každá odpověď zkrácená na limit. */
function sanitizeAnswers(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 100) return null;
  const result: Record<string, string> = {};
  for (const [key, v] of entries) {
    if (typeof v !== 'string' || key.length > 100) continue;
    result[key] = v.slice(0, MAX_ANSWER_LENGTH);
  }
  return result;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
