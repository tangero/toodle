import StarterKit from '@tiptap/starter-kit';

/**
 * Rozšíření vizuálního editoru lekcí (Tiptap). Všechno, co umí vytvořit, musí být v `EDITOR_TAGS`
 * (lesson-editor.ts), jinak to filtr značek při zobrazení zahodí. Hlídá to tests/lesson-editor.test.ts.
 */
/** Co tu není, nejde vytvořit tlačítkem, zkratkou ani vložením ze schránky. */
export function lessonEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [3] },
      // <s> a <u> filtr značek zahazuje, proto je editor vůbec nenabízí.
      strike: false,
      underline: false,
      // Blok kódu s prázdným řádkem uvnitř seznamu by Markdown při zobrazení rozbil; lekce ho nepoužívají.
      codeBlock: false,
      // Prázdný odstavec doplňovaný na konec by se ukládal a měnil by lekci už při otevření.
      trailingNode: false,
      link: {
        openOnClick: false,
        autolink: false,
        // target a rel doplňuje až renderMarkdown při zobrazení; v databázi je jen href.
        HTMLAttributes: { target: null, rel: null, class: null },
      },
    }),
  ];
}
