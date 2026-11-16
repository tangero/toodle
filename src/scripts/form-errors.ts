/**
 * Přístupnost chyb u polí formuláře. Vzhled chyby řeší CSS přes :user-invalid (site.css),
 * tenhle skript k tomu drží v souladu aria-invalid a aria-describedby a chybu oznámí čtečce.
 * Pole se s chybovou hláškou propojí atributem data-error="id-hlášky".
 */
type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function initFormErrors(form: HTMLFormElement): void {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.className = 'sr-only';
  form.insertAdjacentElement('beforeend', announcer);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const isField = (el: EventTarget | null): el is Field =>
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;

  // Hláška smí být v aria-describedby jen ve chvíli, kdy je vidět, jinak ji čtečka čte pořád.
  const linkError = (el: Field, shown: boolean) => {
    const errorId = el.dataset.error;
    if (!errorId) return;
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  const sync = (el: Field, announce = false) => {
    if (el.type === 'hidden') return;
    const invalid = el.matches(':user-invalid');
    const wasInvalid = el.getAttribute('aria-invalid') === 'true';
    el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    linkError(el, invalid);
    if (invalid && announce && !wasInvalid) {
      const error = el.dataset.error ? document.getElementById(el.dataset.error) : null;
      if (!error) return;
      const label = el.labels?.[0]?.textContent?.trim();
      clearTimeout(timer);
      announcer.textContent = '';
      // Počkáme, až čtečka dočte pole, na které uživatel právě přešel.
      timer = setTimeout(() => {
        announcer.textContent = `${label ? `${label}: ` : ''}${error.textContent?.trim() ?? ''}`;
      }, 500);
    } else if (!invalid && wasInvalid) {
      clearTimeout(timer);
      announcer.textContent = '';
    }
  };

  for (const el of Array.from(form.elements)) if (isField(el)) sync(el);

  form.addEventListener('blur', (e) => { if (isField(e.target)) sync(e.target, true); }, true);
  form.addEventListener('input', (e) => { if (isField(e.target)) sync(e.target); });
  // Neúspěšné odeslání: prohlížeč sám přesune focus na první chybné pole, hlášku přečte přes aria-describedby.
  form.addEventListener('invalid', (e) => {
    const el = e.target;
    if (isField(el)) setTimeout(() => sync(el));
  }, true);
}
