import { useState } from 'react';

interface Lesson {
  id: string;
  position: number;
  title: string;
  content_md: string;
  reading_minutes: number;
}

interface LessonEditorProps {
  courseId: string;
  initialLessons: Lesson[];
}

export default function LessonEditor({ courseId, initialLessons }: LessonEditorProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const editing = lessons.find((l) => l.id === editingId);

  const setEditField = (field: keyof Lesson, value: string | number) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === editingId ? { ...l, [field]: value } : l)),
    );
  };

  const saveLesson = async (lesson: Lesson) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lesson),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? 'Chyba při ukládání');
        return;
      }
      setEditingId(null);
    } catch {
      setError('Nastala chyba při ukládání.');
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, title: 'Nová lekce', content_md: '', reading_minutes: 5 }),
      });
      const data = await res.json() as { id?: string; position?: number; error?: string };
      if (!res.ok) { setError(data.error ?? 'Chyba'); return; }
      const newLesson: Lesson = {
        id: data.id!,
        position: data.position!,
        title: 'Nová lekce',
        content_md: '',
        reading_minutes: 5,
      };
      setLessons((prev) => [...prev, newLesson]);
      setEditingId(data.id!);
    } catch {
      setError('Nastala chyba.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (id: string) => {
    if (!confirm('Opravdu smazat tuto lekci?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/lessons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== id).map((l, i) => ({ ...l, position: i + 1 })));
        if (editingId === id) setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div>
      {error && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-2">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="rounded-lg border border-gray-200 bg-white">
            {editingId === lesson.id ? (
              <div className="p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-gray-600">Název lekce</label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => setEditField('title', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Čtení (min)</label>
                    <input
                      type="number"
                      min="1"
                      value={lesson.reading_minutes}
                      onChange={(e) => setEditField('reading_minutes', Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Obsah lekce (Markdown)</label>
                  <textarea
                    rows={12}
                    value={lesson.content_md}
                    onChange={(e) => setEditField('content_md', e.target.value)}
                    className={inputClass + ' font-mono text-xs'}
                    placeholder="# Nadpis lekce&#10;&#10;Text lekce v Markdown formátu..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveLesson(lesson)}
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Ukládám...' : 'Uložit'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {lesson.position}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-900">{lesson.title}</span>
                <span className="text-xs text-gray-400">{lesson.reading_minutes} min</span>
                <button
                  onClick={() => setEditingId(lesson.id)}
                  className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Upravit
                </button>
                <button
                  onClick={() => deleteLesson(lesson.id)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Smazat
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addLesson}
        disabled={saving}
        className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
      >
        <span className="text-lg leading-none">+</span> Přidat lekci
      </button>
    </div>
  );
}
