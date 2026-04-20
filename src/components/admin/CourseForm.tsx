import { useState } from 'react';

interface CourseFormProps {
  course?: {
    id: string;
    title: string;
    slug: string;
    perex: string;
    description_md: string;
    author_name: string;
    price_czk: number;
    delivery_mode: string;
    status: string;
    welcome_email_md: string;
    completion_email_md: string;
  };
}

export default function CourseForm({ course }: CourseFormProps) {
  const isEdit = !!course;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: course?.title ?? '',
    slug: course?.slug ?? '',
    perex: course?.perex ?? '',
    description_md: course?.description_md ?? '',
    author_name: course?.author_name ?? '',
    price_czk: String(course?.price_czk ?? 0),
    delivery_mode: course?.delivery_mode ?? 'next_workday',
    status: course?.status ?? 'draft',
    welcome_email_md: course?.welcome_email_md ?? '',
    completion_email_md: course?.completion_email_md ?? '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const autoSlug = () => {
    if (!form.slug && form.title) {
      const slug = form.title.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = isEdit ? { ...form, id: course!.id, price_czk: Number(form.price_czk) }
                             : { ...form, price_czk: Number(form.price_czk) };
      const res = await fetch('/api/admin/courses', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok) { setError(data.error ?? 'Chyba'); return; }
      if (!isEdit && data.id) window.location.href = `/admin/kurzy/${data.id}`;
      else window.location.href = `/admin/kurzy/${course!.id}`;
    } catch {
      setError('Nastala chyba při ukládání.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Název kurzu *</label>
          <input type="text" required value={form.title} onChange={set('title')} onBlur={autoSlug} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug (URL) *</label>
          <input type="text" required value={form.slug} onChange={set('slug')} className={inputClass} placeholder="napr-ai-pro-zacatecniky" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Autor</label>
          <input type="text" value={form.author_name} onChange={set('author_name')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cena (Kč)</label>
          <input type="number" min="0" value={form.price_czk} onChange={set('price_czk')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Doručení</label>
          <select value={form.delivery_mode} onChange={set('delivery_mode')} className={inputClass}>
            <option value="next_workday">Automaticky Po-Pá</option>
            <option value="on_click">Na kliknutí (vlastní tempo)</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Perex (krátký popis)</label>
        <input type="text" value={form.perex} onChange={set('perex')} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Popis kurzu (Markdown)</label>
        <textarea rows={8} value={form.description_md} onChange={set('description_md')} className={inputClass + ' font-mono text-xs'} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Uvítací email (Markdown)</label>
          <textarea rows={6} value={form.welcome_email_md} onChange={set('welcome_email_md')} className={inputClass + ' font-mono text-xs'} placeholder="Text uvítacího emailu..." />
        </div>
        <div>
          <label className={labelClass}>Email po dokončení (Markdown)</label>
          <textarea rows={6} value={form.completion_email_md} onChange={set('completion_email_md')} className={inputClass + ' font-mono text-xs'} placeholder="Text emailu po dokončení kurzu..." />
        </div>
      </div>

      {isEdit && (
        <div>
          <label className={labelClass}>Stav</label>
          <select value={form.status} onChange={set('status')} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Publikovaný</option>
            <option value="archived">Archivovaný</option>
          </select>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Ukládám...' : isEdit ? 'Uložit změny' : 'Vytvořit kurz'}
        </button>
        <a href="/admin/kurzy" className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Zrušit
        </a>
      </div>
    </form>
  );
}
