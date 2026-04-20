import { useState } from 'react';
import type { TestQuestion } from '@lib/types';

interface FeedbackItem {
  question_id: string;
  points_awarded: number;
  max_points: number;
  feedback: string;
}

interface SubmitResult {
  ok: boolean;
  score: number;
  passed: boolean;
  feedback: FeedbackItem[];
  certificatePublicId: string | null;
}

interface Props {
  enrollmentId: string;
  questions: TestQuestion[];
}

export default function TestForm({ enrollmentId, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState('');

  const allAnswered = questions.every((q) => answers[q.id]?.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) { setError('Odpovězte prosím na všechny otázky.'); return; }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, answers }),
      });
      const data = await res.json() as SubmitResult & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Chyba při odevzdání.'); return; }
      setResult(data);
    } catch {
      setError('Nastala chyba při odevzdání testu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-6 text-center ${result.passed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <div className="text-5xl font-bold mb-2" style={{ color: result.passed ? '#16a34a' : '#ea580c' }}>
            {result.score} %
          </div>
          <p className={`text-lg font-semibold ${result.passed ? 'text-green-800' : 'text-orange-800'}`}>
            {result.passed ? '🎉 Gratulujeme! Test byl úspěšně splněn.' : '😕 Bohužel jste test nesplnili (minimum je 70 %).'}
          </p>
          {result.certificatePublicId && (
            <a
              href={`/certifikat/${result.certificatePublicId}`}
              className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Zobrazit certifikát
            </a>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Zpětná vazba</h2>
          {questions.map((q, i) => {
            const fb = result.feedback.find((f) => f.question_id === q.id);
            const passed = fb ? fb.points_awarded === fb.max_points : false;
            return (
              <div key={q.id} className={`rounded-lg border p-4 ${passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="font-medium text-gray-900">{i + 1}. {q.question}</p>
                <p className="mt-1 text-sm text-gray-700">Vaše odpověď: {answers[q.id] ?? '—'}</p>
                {fb && (
                  <>
                    <p className="mt-1 text-sm font-medium" style={{ color: passed ? '#166534' : '#991b1b' }}>
                      {fb.points_awarded} / {fb.max_points} bodů
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{fb.feedback}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <a href="/profil" className="block text-center rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Zpět do profilu
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="font-medium text-gray-900">
            <span className="mr-2 text-gray-400">{i + 1}.</span>
            {q.question}
          </p>
          <p className="mt-1 text-xs text-gray-400">Max {q.max_points} {q.max_points === 1 ? 'bod' : q.max_points < 5 ? 'body' : 'bodů'}</p>

          {q.type === 'multiple_choice' && q.options ? (
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => (
                <label key={opt.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${answers[q.id] === opt.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-gray-900">{opt.text}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              rows={4}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="Napište svoji odpověď..."
              className="mt-3 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting || !allAnswered}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Odesílám a hodnotím...' : 'Odevzdat test'}
      </button>

      {!allAnswered && (
        <p className="text-center text-xs text-gray-400">Odpovězte prosím na všechny otázky.</p>
      )}
    </form>
  );
}
