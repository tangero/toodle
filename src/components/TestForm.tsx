import { useEffect, useRef, useState } from 'react';
import type { TestQuestion } from '@lib/types';

const MAX_ANSWER_LENGTH = 2000;

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
  certificateError?: boolean;
}

interface Props {
  enrollmentId: string;
  questions: TestQuestion[];
}

function pointsLabel(points: number): string {
  if (points === 1) return 'bod';
  return points >= 2 && points <= 4 ? 'body' : 'bodů';
}

export default function TestForm({ enrollmentId, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState('');
  const resultTitle = useRef<HTMLHeadingElement>(null);

  // Po vyhodnocení formulář zmizí, focus proto přesuneme na nadpis výsledku.
  useEffect(() => {
    if (result) resultTitle.current?.focus();
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Povinná pole hlídá prohlížeč (required); tady zachytíme odpovědi ze samých mezer.
    const missing = questions.find((q) => !answers[q.id]?.trim());
    if (missing) {
      setError(`Chybí odpověď na otázku ${questions.indexOf(missing) + 1}. Doplňte ji a test odevzdejte znovu.`);
      document.getElementById(`q-${missing.id}`)?.focus();
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, answers }),
      });
      const data = await res.json() as SubmitResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Test se nepodařilo odevzdat. Vaše odpovědi zůstaly vyplněné, zkuste to znovu.');
        return;
      }
      setResult(data);
    } catch {
      setError('Test se nepodařilo odeslat. Zkontrolujte připojení k internetu a zkuste to znovu, odpovědi zůstaly vyplněné.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    // Návrat k odpovědím nabízíme při neúspěchu i tehdy, když se nepodařilo vystavit certifikát.
    const canRetry = !result.passed || result.certificateError;

    return (
      <div className="stack">
        <div className={`note ${result.passed ? 'ok' : 'err'}`}>
          <p className="score">{result.score} %</p>
          <h2 ref={resultTitle} tabIndex={-1}>
            {result.passed ? 'Test jste splnili' : 'Test jste tentokrát nesplnili'}
          </h2>
          {!result.passed && <p>K certifikátu potřebujete alespoň 70 %. Test můžete zopakovat.</p>}
          {result.certificateError && (
            <p>
              Certifikát se nepodařilo vystavit. Vraťte se k odpovědím a odešlete test znovu. Když se chyba
              zopakuje, napište na <a href="mailto:patrick@zandl.cz">patrick@zandl.cz</a>.
            </p>
          )}
          {result.certificatePublicId && (
            <p className="actions">
              <a className="btn" href={`/certifikat/${result.certificatePublicId}`}>Zobrazit certifikát</a>
            </p>
          )}
        </div>

        <h2>Hodnocení odpovědí</h2>
        {questions.map((q, i) => {
          const fb = result.feedback.find((f) => f.question_id === q.id);
          const full = fb ? fb.points_awarded === fb.max_points : false;
          const answer = q.type === 'multiple_choice'
            ? q.options?.find((opt) => opt.id === answers[q.id])?.text ?? answers[q.id]
            : answers[q.id];
          return (
            <div key={q.id} className={`question ${full ? 'good' : 'bad'}`}>
              <h3 className="q-title">{i + 1}. {q.question}</h3>
              <p className="mono">Vaše odpověď</p>
              <p className="answer">{answer ?? '—'}</p>
              {fb && (
                <>
                  <p>
                    <strong>{fb.points_awarded} z {fb.max_points} {pointsLabel(fb.max_points)}</strong>
                    {full ? ', plný počet' : ''}
                  </p>
                  <p className="muted">{fb.feedback}</p>
                </>
              )}
            </div>
          );
        })}

        <div className="actions">
          {canRetry && (
            <button type="button" className="btn" onClick={() => setResult(null)}>
              Vrátit se k odpovědím a zkusit to znovu
            </button>
          )}
          <a className="btn btn-line" href="/profil">Zpět do profilu</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {questions.map((q, i) => {
        const points = `Nejvýše ${q.max_points} ${pointsLabel(q.max_points)}`;

        if (q.type === 'multiple_choice' && q.options) {
          return (
            <fieldset key={q.id} className="question">
              <legend>{i + 1}. {q.question}</legend>
              <p className="mono">{points}</p>
              <div className="choices">
                {q.options.map((opt, optIndex) => (
                  <label key={opt.id} className="choice">
                    <input
                      type="radio"
                      id={optIndex === 0 ? `q-${q.id}` : `q-${q.id}-${opt.id}`}
                      name={`q-${q.id}`}
                      value={opt.id}
                      required
                      checked={answers[q.id] === opt.id}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        }

        return (
          <div key={q.id} className="question field">
            <label className="q-title" htmlFor={`q-${q.id}`}>{i + 1}. {q.question}</label>
            <p className="mono" id={`q-${q.id}-hint`}>{points} · nejvýše {MAX_ANSWER_LENGTH} znaků</p>
            <textarea
              id={`q-${q.id}`}
              name={`q-${q.id}`}
              rows={5}
              required
              maxLength={MAX_ANSWER_LENGTH}
              aria-describedby={`q-${q.id}-hint`}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            />
          </div>
        );
      })}

      <div aria-live="polite">
        {error && <p className="note err">{error}</p>}
      </div>

      <div className="actions">
        <button type="submit" className="btn btn-accent" disabled={submitting}>
          {submitting ? 'Odesílám a hodnotím…' : 'Odevzdat test'}
        </button>
        <span className="hint">Hodnocení otevřených odpovědí trvá několik sekund.</span>
      </div>
    </form>
  );
}
