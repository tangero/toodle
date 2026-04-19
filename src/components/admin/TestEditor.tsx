import { useState } from 'react';

interface MCOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'open_ended';
  question: string;
  options?: MCOption[];
  correct_option_id?: string;
  max_points: number;
}

interface TestEditorProps {
  courseId: string;
  initialQuestions: Question[];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function TestEditor({ courseId, initialQuestions }: TestEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const updateQ = (id: string, patch: Partial<Question>) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const addMC = () =>
    setQuestions((prev) => [...prev, {
      id: uid(), type: 'multiple_choice', question: '',
      options: [{ id: uid(), text: '' }, { id: uid(), text: '' }],
      correct_option_id: '', max_points: 1,
    }]);

  const addOpen = () =>
    setQuestions((prev) => [...prev, {
      id: uid(), type: 'open_ended', question: '', max_points: 5,
    }]);

  const removeQ = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const addOption = (qid: string) =>
    setQuestions((prev) => prev.map((q) =>
      q.id === qid ? { ...q, options: [...(q.options ?? []), { id: uid(), text: '' }] } : q,
    ));

  const updateOption = (qid: string, oid: string, text: string) =>
    setQuestions((prev) => prev.map((q) =>
      q.id === qid ? { ...q, options: q.options?.map((o) => o.id === oid ? { ...o, text } : o) } : q,
    ));

  const removeOption = (qid: string, oid: string) =>
    setQuestions((prev) => prev.map((q) =>
      q.id === qid ? { ...q, options: q.options?.filter((o) => o.id !== oid) } : q,
    ));

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/tests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, questions }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? 'Chyba'); return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Nastala chyba při ukládání.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {saved && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Test byl uložen.</div>}

      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              {i + 1}
            </span>
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  {q.type === 'multiple_choice' ? 'Otázka (výběr z odpovědí)' : 'Otázka (volná odpověď)'}
                </label>
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={(e) => updateQ(q.id, { question: e.target.value })}
                  className={inputClass}
                  placeholder="Text otázky..."
                />
              </div>

              {q.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Možnosti (klikněte na správnou)</label>
                  {q.options?.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correct_option_id === opt.id}
                        onChange={() => updateQ(q.id, { correct_option_id: opt.id })}
                        className="shrink-0"
                        title="Správná odpověď"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder={`Možnost...`}
                      />
                      <button
                        onClick={() => removeOption(q.id, opt.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                        title="Odstranit možnost"
                      >✕</button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(q.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >+ Přidat možnost</button>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Max bodů</label>
                  <input
                    type="number" min="1"
                    value={q.max_points}
                    onChange={(e) => updateQ(q.id, { max_points: Number(e.target.value) })}
                    className="mt-1 w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <button onClick={() => removeQ(q.id)} className="text-gray-400 hover:text-red-500" title="Smazat otázku">✕</button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button onClick={addMC} className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400">
          + Výběr z odpovědí
        </button>
        <button onClick={addOpen} className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400">
          + Volná odpověď
        </button>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Ukládám...' : 'Uložit test'}
        </button>
      </div>
    </div>
  );
}
