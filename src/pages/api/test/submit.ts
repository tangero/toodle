import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { evaluateOpenEndedAnswers } from '@lib/llm';
import { issueCertificate } from '@lib/certificate';
import { sendEmail } from '@lib/email';
import { logAudit } from '@lib/audit';
import type { TestQuestion } from '@lib/types';

const PASSING_SCORE = 70;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const user = locals.user;
  if (!user) return json({ error: 'Nepřihlášen' }, 401);

  let body: { enrollmentId: string; answers: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Neplatný požadavek' }, 400);
  }

  const { enrollmentId, answers } = body;

  const enrollment = await getOne<{ id: string; user_id: string; course_id: string; status: string; score: number | null }>(
    env.DB, `SELECT id, user_id, course_id, status, score FROM enrollments WHERE id = ?`, enrollmentId,
  );
  if (!enrollment) return json({ error: 'Enrollment nenalezen' }, 404);
  if (enrollment.user_id !== user.id) return json({ error: 'Přístup odepřen' }, 403);
  if (enrollment.status !== 'completed') return json({ error: 'Kurz není dokončen' }, 400);

  const previousBestScore = enrollment.score;

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

  // Score multiple-choice
  const mcQuestions = questions.filter((q) => q.type === 'multiple_choice');
  for (const q of mcQuestions) {
    totalPoints += q.max_points;
    if (answers[q.id] === q.correct_option_id) {
      earnedPoints += q.max_points;
      feedbackItems.push({ question_id: q.id, points_awarded: q.max_points, max_points: q.max_points, feedback: 'Správně!' });
    } else {
      feedbackItems.push({ question_id: q.id, points_awarded: 0, max_points: q.max_points, feedback: 'Nesprávně.' });
    }
  }

  // Evaluate open-ended with Claude
  const openQuestions = questions.filter((q) => q.type === 'open_ended');
  if (openQuestions.length > 0) {
    for (const q of openQuestions) totalPoints += q.max_points;

    try {
      const { evaluations, raw } = await evaluateOpenEndedAnswers(
        env.ANTHROPIC_API_KEY,
        courseRow?.title ?? '',
        openQuestions.map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: answers[q.id] ?? '',
          maxPoints: q.max_points,
        })),
      );
      llmRaw = raw;
      for (const ev of evaluations) {
        earnedPoints += ev.points_awarded;
        feedbackItems.push(ev);
      }
    } catch {
      // Fallback: half credit
      for (const q of openQuestions) {
        const pts = Math.floor(q.max_points * 0.5);
        earnedPoints += pts;
        feedbackItems.push({ question_id: q.id, points_awarded: pts, max_points: q.max_points, feedback: 'Hodnocení selhalo — přiznán částečný kredit.' });
      }
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= PASSING_SCORE;

  // Save attempt
  const attemptId = generateId();
  await run(
    env.DB,
    `INSERT INTO test_attempts (id, enrollment_id, answers_json, score, feedback_json, llm_evaluation_raw)
     VALUES (?, ?, ?, ?, ?, ?)`,
    attemptId, enrollmentId, JSON.stringify(answers), score,
    JSON.stringify(feedbackItems), llmRaw || null,
  );

  // Update best score on enrollment
  if (previousBestScore === null || score > previousBestScore) {
    await run(env.DB, `UPDATE enrollments SET score = ? WHERE id = ?`, score, enrollmentId);
  }

  // Issue certificate if passed and score improved (or no cert yet)
  let certificatePublicId: string | null = null;
  if (passed && (previousBestScore === null || score > (previousBestScore ?? 0))) {
    // Delete old certificate if exists
    const oldCert = await getOne<{ id: string; pdf_r2_key: string }>(
      env.DB, `SELECT id, pdf_r2_key FROM certificates WHERE enrollment_id = ?`, enrollmentId,
    );
    if (oldCert) {
      await env.BUCKET.delete(oldCert.pdf_r2_key);
      await run(env.DB, `DELETE FROM certificates WHERE id = ?`, oldCert.id);
    }

    const userRow = await getOne<{ name: string; email: string }>(
      env.DB, `SELECT name, email FROM users WHERE id = ?`, user.id,
    );
    const { publicId } = await issueCertificate(
      env.DB, env.BUCKET, enrollmentId,
      userRow?.name ?? user.name,
      courseRow?.title ?? '',
      score,
      env.APP_URL,
    );
    certificatePublicId = publicId;

    await sendEmail(env, {
      to: user.email,
      subject: `Váš certifikát — ${courseRow?.title}`,
      html: `<p>Gratulujeme! Úspěšně jste dokončili test s výsledkem ${score} %. Certifikát najdete na: <a href="${env.APP_URL}/certifikat/${publicId}">${env.APP_URL}/certifikat/${publicId}</a></p>`,
      tags: [{ name: 'type', value: 'certificate' }],
    });
  }

  await logAudit(env.DB, user.email, 'test.submitted', attemptId, { score, passed });
  return json({ ok: true, score, passed, feedback: feedbackItems, certificatePublicId });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
