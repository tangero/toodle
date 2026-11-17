import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { formatLessonHtml, isEditorHref, toEditorHtml } from '@lib/lesson-editor';
import { lessonEditorExtensions } from '@lib/lesson-editor-extensions';

interface RichTextEditorProps {
  /** Tělo lekce, jak je uložené (HTML nebo Markdown). Čte se jen při otevření editoru. */
  value: string;
  onChange: (content: string) => void;
}

/**
 * Vizuální editor těla lekce. Ukládá jen značky z `EDITOR_TAGS`.
 * Dokud admin nic nezmění, vrací původní řetězec beze změny, aby se nezvedla verze lekce.
 */
export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const original = useRef(value);
  const baseline = useRef<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkFieldId = useId();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  /** Výběr v textu ve chvíli otevření pole odkazu; zaostřením pole se v editoru ztrácí. */
  const linkRange = useRef<{ from: number; to: number } | null>(null);

  const editor = useEditor({
    extensions: lessonEditorExtensions(),
    content: toEditorHtml(value),
    // Komponenta se vykresluje i na serveru (Worker), kde editor vzniknout nemůže.
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'lesson-rte', role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Obsah lekce' },
    },
    onCreate: ({ editor: created }) => {
      baseline.current = formatLessonHtml(created.getHTML());
    },
    onUpdate: ({ editor: updated }) => {
      const html = formatLessonHtml(updated.getHTML());
      // Návrat k výchozímu stavu (třeba přes Zpět) vrací původní text znak po znaku.
      onChange(html === baseline.current ? original.current : html);
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
      heading: current?.isActive('heading', { level: 3 }) ?? false,
      bulletList: current?.isActive('bulletList') ?? false,
      orderedList: current?.isActive('orderedList') ?? false,
      blockquote: current?.isActive('blockquote') ?? false,
      link: current?.isActive('link') ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  });

  if (!editor || !state) {
    return <div className="mt-1 rounded-lg border border-gray-300 px-3 py-6 text-sm text-gray-500">Načítám editor…</div>;
  }

  const openLink = () => {
    const { from, to } = editor.state.selection;
    linkRange.current = { from, to };
    setLinkUrl((editor.getAttributes('link').href as string | undefined) ?? '');
    setLinkError('');
    setLinkOpen(true);
  };

  const restoreLinkRange = () => {
    const chain = editor.chain().focus();
    return linkRange.current ? chain.setTextSelection(linkRange.current) : chain;
  };

  const applyLink = () => {
    const href = linkUrl.trim();
    if (!isEditorHref(href)) {
      setLinkError('Zadejte adresu začínající https://, http://, mailto: nebo lomítkem.');
      return;
    }
    restoreLinkRange().extendMarkRange('link').setLink({ href }).run();
    setLinkOpen(false);
  };

  const removeLink = () => {
    restoreLinkRange().extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  };

  // Šipky v liště: prohlížeče s atributem focusgroup to umí samy, ostatním to doplní tento kód.
  const onToolbarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ('focusGroup' in HTMLElement.prototype) return;
    const items = Array.from(toolbarRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const target =
      event.key === 'ArrowRight' ? items[(index + 1) % items.length]
        : event.key === 'ArrowLeft' ? items[(index - 1 + items.length) % items.length]
          : event.key === 'Home' ? items[0]
            : event.key === 'End' ? items[items.length - 1]
              : null;
    if (!target) return;
    event.preventDefault();
    items.forEach((item) => { item.tabIndex = item === target ? 0 : -1; });
    target.focus();
  };

  let firstButton = true;
  const button = (
    label: string,
    content: ReactNode,
    run: () => void,
    options: { pressed?: boolean; disabled?: boolean } = {},
  ) => {
    const tabIndex = firstButton ? 0 : -1;
    firstButton = false;
    return (
      <button
        type="button"
        className="lesson-rte-btn"
        title={label}
        aria-label={label}
        aria-pressed={options.pressed}
        aria-disabled={options.disabled ? true : undefined}
        tabIndex={'focusGroup' in HTMLElement.prototype ? undefined : tabIndex}
        // Kliknutí do lišty nesmí editoru sebrat výběr textu.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => { if (!options.disabled) run(); }}
      >
        {content}
      </button>
    );
  };

  const separator = <span role="separator" aria-orientation="vertical" className="lesson-rte-sep" />;

  return (
    <div className="mt-1 rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="Formátování textu lekce"
        className="lesson-rte-toolbar"
        onKeyDown={onToolbarKeyDown}
        {...({ focusgroup: 'toolbar wrap' } as object)}
      >
        <div role="group" aria-label="Písmo" className="lesson-rte-group">
          {button('Tučně', <strong>B</strong>, () => editor.chain().focus().toggleBold().run(), { pressed: state.bold })}
          {button('Kurzíva', <em>I</em>, () => editor.chain().focus().toggleItalic().run(), { pressed: state.italic })}
        </div>
        {separator}
        <div role="group" aria-label="Odstavec" className="lesson-rte-group">
          {button('Nadpis části', 'Nadpis části', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), { pressed: state.heading })}
          {button('Odrážky', 'Odrážky', () => editor.chain().focus().toggleBulletList().run(), { pressed: state.bulletList })}
          {button('Číslovaný seznam', 'Číslování', () => editor.chain().focus().toggleOrderedList().run(), { pressed: state.orderedList })}
          {button('Citace', 'Citace', () => editor.chain().focus().toggleBlockquote().run(), { pressed: state.blockquote })}
        </div>
        {separator}
        <div role="group" aria-label="Odkaz" className="lesson-rte-group">
          {button('Odkaz', 'Odkaz', openLink, { pressed: state.link })}
        </div>
        {separator}
        <div role="group" aria-label="Historie" className="lesson-rte-group">
          {button('Zpět', 'Zpět', () => editor.chain().focus().undo().run(), { disabled: !state.canUndo })}
          {button('Znovu', 'Znovu', () => editor.chain().focus().redo().run(), { disabled: !state.canRedo })}
        </div>
      </div>

      {linkOpen && (
        <div className="flex flex-wrap items-end gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
          <div className="min-w-48 flex-1">
            <label htmlFor={linkFieldId} className="block text-xs font-medium text-gray-600">Adresa odkazu</label>
            <input
              id={linkFieldId}
              // Pole se otevírá na žádost uživatele, zaostření hned při vložení brání psaní do textu lekce.
              autoFocus
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={linkUrl}
              onChange={(event) => { setLinkUrl(event.target.value); setLinkError(''); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') { event.preventDefault(); applyLink(); }
                if (event.key === 'Escape') { event.preventDefault(); setLinkOpen(false); editor.commands.focus(); }
              }}
              aria-invalid={linkError ? true : undefined}
              aria-describedby={`${linkFieldId}-error`}
              placeholder="https://"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button type="button" onClick={applyLink} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
            Použít
          </button>
          {state.link && (
            <button type="button" onClick={removeLink} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
              Odebrat odkaz
            </button>
          )}
          <button
            type="button"
            onClick={() => { setLinkOpen(false); editor.commands.focus(); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Zrušit
          </button>
          <p id={`${linkFieldId}-error`} role="alert" className="w-full text-xs text-red-700">{linkError}</p>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
