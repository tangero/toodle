import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_INVITATION_MD,
  INVITATION_BODY_MAX,
  INVITATION_PREHEADER,
  INVITATION_PREHEADER_MAX,
  INVITATION_SUBJECT,
  INVITATION_SUBJECT_MAX,
  invitationEmail,
  type InvitationCourse,
} from '@lib/email-templates/invitation';

interface InvitationEditorProps {
  campaign: string;
  initialSubject: string;
  initialPreheader: string;
  initialBodyMd: string;
  isCustom: boolean;
  updatedAt: string | null;
  sentCount: number;
  courses: InvitationCourse[];
  appUrl: string;
}

interface SavedState {
  subject: string;
  preheader: string;
  bodyMd: string;
  isCustom: boolean;
  updatedAt: string | null;
}

type PreviewMode = 'desktop' | 'mobile';

function formatDate(v: string): string {
  return v.slice(0, 10).split('-').reverse().map(Number).join('. ');
}

export default function InvitationEditor({
  campaign,
  initialSubject,
  initialPreheader,
  initialBodyMd,
  isCustom,
  updatedAt,
  sentCount,
  courses,
  appUrl,
}: InvitationEditorProps) {
  const idPrefix = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [saved, setSaved] = useState<SavedState>({
    subject: initialSubject,
    preheader: initialPreheader,
    bodyMd: initialBodyMd,
    isCustom,
    updatedAt,
  });
  const [subject, setSubject] = useState(initialSubject);
  const [preheader, setPreheader] = useState(initialPreheader);
  const [bodyMd, setBodyMd] = useState(initialBodyMd);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const isDirty =
    subject !== saved.subject ||
    preheader !== saved.preheader ||
    bodyMd !== saved.bodyMd;

  const isDefault =
    subject === INVITATION_SUBJECT &&
    preheader === INVITATION_PREHEADER &&
    bodyMd === DEFAULT_INVITATION_MD;

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const previewHtml = useMemo(
    () =>
      invitationEmail({
        courses,
        appUrl,
        optOutUrl: `${appUrl}/odhlaseni-nabidek/ukazka`,
        subject,
        preheader,
        bodyMd,
      }),
    [courses, appUrl, subject, preheader, bodyMd],
  );

  const applyEdit = (nextText: string, selStart: number, selEnd: number) => {
    setBodyMd(nextText);
    setStatus(null);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  };

  const wrapSelection = (before: string, after: string, placeholder: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = bodyMd.slice(start, end) || placeholder;
    const next = bodyMd.slice(0, start) + before + selected + after + bodyMd.slice(end);
    applyEdit(next, start + before.length, start + before.length + selected.length);
  };

  const prefixLines = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = bodyMd.lastIndexOf('\n', start - 1) + 1;
    const rawEnd = bodyMd.indexOf('\n', end);
    const lineEnd = rawEnd === -1 ? bodyMd.length : rawEnd;
    const block = bodyMd.slice(lineStart, lineEnd);
    const prefixed = block
      .split('\n')
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join('\n');
    const next = bodyMd.slice(0, lineStart) + prefixed + bodyMd.slice(lineEnd);
    applyEdit(next, lineStart, lineStart + prefixed.length);
  };

  const insertBlock = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = bodyMd.slice(0, start);
    const after = bodyMd.slice(end);
    const lead = before.length === 0 ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
    const trail = after.length === 0 ? '' : after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
    const next = before + lead + snippet + trail + after;
    const pos = before.length + lead.length;
    applyEdit(next, pos, pos + snippet.length);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          campaign,
          subject,
          preheader,
          body_md: bodyMd,
        }),
      });
      const data = (await res.json().catch(() => ({ error: 'Neplatná odpověď serveru' }))) as {
        error?: string;
        message?: string;
        template?: {
          subject: string;
          preheader: string;
          body_md: string;
          is_custom: boolean;
          updated_at: string | null;
        };
      };
      if (!res.ok || !data.template) {
        setStatus({ kind: 'err', text: data.error ?? `Chyba ${res.status}` });
        return;
      }
      const t = data.template;
      setSubject(t.subject);
      setPreheader(t.preheader);
      setBodyMd(t.body_md);
      setSaved({
        subject: t.subject,
        preheader: t.preheader,
        bodyMd: t.body_md,
        isCustom: t.is_custom,
        updatedAt: t.updated_at,
      });
      setStatus({ kind: 'ok', text: data.message ?? 'Text pozvánky je uložený.' });
    } catch {
      setStatus({ kind: 'err', text: 'Uložení se nepovedlo. Zkuste to znovu.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    setSubject(INVITATION_SUBJECT);
    setPreheader(INVITATION_PREHEADER);
    setBodyMd(DEFAULT_INVITATION_MD);
    setStatus({ kind: 'ok', text: 'Načten výchozí text. Pro uložení klikněte na Uložit změny.' });
  };

  const handleDiscard = () => {
    setSubject(saved.subject);
    setPreheader(saved.preheader);
    setBodyMd(saved.bodyMd);
    setStatus(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (isDirty && !saving) void handleSave();
    }
  };

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
  const toolbarBtn =
    'inline-flex min-h-9 items-center rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50';
  const btn =
    'inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50';

  const subjectId = `${idPrefix}-subject`;
  const preheaderId = `${idPrefix}-preheader`;
  const preheaderHintId = `${idPrefix}-preheader-hint`;
  const bodyId = `${idPrefix}-body`;
  const bodyHintId = `${idPrefix}-body-hint`;

  return (
    <section
      className="mb-10 max-w-7xl"
      data-invitation-dirty={isDirty ? 'true' : 'false'}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-lg font-bold text-gray-900">Editor pozvánky (Markdown)</h2>
          {isDirty ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
              Neuložené změny
            </span>
          ) : saved.isCustom ? (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-900">
              Upravený text{saved.updatedAt ? ` (${formatDate(saved.updatedAt)})` : ''}
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              Výchozí šablona
            </span>
          )}
        </div>
      </div>

      {sentCount > 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          V této vlně už odešlo {sentCount} pozvánek. Případná úprava textu se projeví jen u zbývajících čekajících příjemců a ve zkušebním e-mailu.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={handleSave} className="min-w-0 space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <div>
            <label htmlFor={subjectId} className="block text-sm font-medium text-gray-900">
              Předmět e-mailu
            </label>
            <input
              id={subjectId}
              type="text"
              required
              maxLength={INVITATION_SUBJECT_MAX}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setStatus(null);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={preheaderId} className="block text-sm font-medium text-gray-900">
              Náhledový text (preheader)
            </label>
            <input
              id={preheaderId}
              type="text"
              maxLength={INVITATION_PREHEADER_MAX}
              aria-describedby={preheaderHintId}
              value={preheader}
              onChange={(e) => {
                setPreheader(e.target.value);
                setStatus(null);
              }}
              className={inputClass}
            />
            <p id={preheaderHintId} className="mt-1 text-xs text-gray-500">
              Krátký text, který poštovní klient ukáže vedle předmětu. Může zůstat prázdný.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor={bodyId} className="block text-sm font-medium text-gray-900">
                Tělo e-mailu (Markdown)
              </label>
              <span className="text-xs text-gray-500">
                {bodyMd.length} znaků
              </span>
            </div>

            <div
              role="toolbar"
              aria-label="Formátování Markdownu"
              className="mt-2 flex flex-wrap gap-1.5 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 p-2"
            >
              <button type="button" className={toolbarBtn} onClick={() => wrapSelection('**', '**', 'tučný text')}>
                Tučně
              </button>
              <button type="button" className={toolbarBtn} onClick={() => wrapSelection('*', '*', 'kurzíva')}>
                Kurzíva
              </button>
              <button type="button" className={toolbarBtn} onClick={() => prefixLines('## ')}>
                Nadpis
              </button>
              <button type="button" className={toolbarBtn} onClick={() => prefixLines('- ')}>
                Seznam
              </button>
              <button type="button" className={toolbarBtn} onClick={() => wrapSelection('[', '](https://)', 'text odkazu')}>
                Odkaz
              </button>
              <span aria-hidden="true" className="mx-1 self-stretch border-l border-gray-300" />
              <button type="button" className={toolbarBtn} onClick={() => insertBlock('{{kurzy}}')}>
                + Kurzy
              </button>
              <button type="button" className={toolbarBtn} onClick={() => insertBlock('{{tlacitko:Vybrat kurz}}')}>
                + Tlačítko
              </button>
            </div>

            <textarea
              ref={textareaRef}
              id={bodyId}
              rows={20}
              required
              maxLength={INVITATION_BODY_MAX}
              aria-describedby={bodyHintId}
              value={bodyMd}
              onChange={(e) => {
                setBodyMd(e.target.value);
                setStatus(null);
              }}
              className="block w-full rounded-b-lg border border-gray-300 bg-white px-3 py-2.5 font-mono text-sm leading-relaxed text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />

            <div id={bodyHintId} className="mt-2 space-y-1 text-xs text-gray-600">
              <p>
                Značky:{' '}
                <code className="rounded bg-gray-100 px-1">{'{{kurzy}}'}</code> seznam publikovaných kurzů,{' '}
                <code className="rounded bg-gray-100 px-1">{'{{tlacitko:Text}}'}</code> nebo{' '}
                <code className="rounded bg-gray-100 px-1">{'{{tlacitko:Text|URL}}'}</code> tlačítko,{' '}
                <code className="rounded bg-gray-100 px-1">{'{{url}}'}</code> adresa webu.
              </p>
              <p className="text-gray-500">
                Odkaz na odhlášení nabídek se doplní automaticky na konec každého e-mailu. Oslovení nechávejte jen „Dobrý den,“ bez jména.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className={`${btn} bg-gray-900 text-white`}
            >
              {saving ? 'Ukládám…' : 'Uložit změny'}
            </button>
            {isDirty && (
              <button
                type="button"
                disabled={saving}
                onClick={handleDiscard}
                className={`${btn} border border-gray-300 bg-white text-gray-900`}
              >
                Vrátit úpravy
              </button>
            )}
            <button
              type="button"
              disabled={saving || isDefault}
              onClick={handleResetDefault}
              className={`${btn} border border-gray-300 bg-white text-gray-700`}
            >
              Obnovit výchozí text
            </button>
          </div>

          <p
            role="status"
            aria-live="polite"
            className={`min-h-5 text-sm ${status?.kind === 'err' ? 'text-red-700' : 'text-green-800'}`}
          >
            {status?.text ?? ''}
          </p>
        </form>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 text-sm text-gray-600">
              <p className="truncate">
                Předmět: <strong className="text-gray-900">{subject.trim() || INVITATION_SUBJECT}</strong>
              </p>
              {preheader.trim() && (
                <p className="truncate text-xs text-gray-500">Náhled: {preheader.trim()}</p>
              )}
            </div>
            <div role="group" aria-label="Šířka náhledu" className="flex shrink-0 rounded-lg border border-gray-300 bg-white p-0.5 text-xs">
              {(['desktop', 'mobile'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={previewMode === mode}
                  onClick={() => setPreviewMode(mode)}
                  className={
                    'min-h-8 rounded-md px-3 font-medium ' +
                    (previewMode === mode ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100')
                  }
                >
                  {mode === 'desktop' ? 'Počítač' : 'Telefon'}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-100 p-3">
            <iframe
              title="Náhled pozvánky"
              srcDoc={previewHtml}
              sandbox=""
              className={`h-[740px] rounded-lg border border-gray-200 bg-white transition-all ${
                previewMode === 'mobile' ? 'mx-auto block w-[375px] max-w-full' : 'w-full'
              }`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
