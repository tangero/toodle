import { baseTemplate, button, promoSection, styleProse, P, SIGNATURE, type PromoData } from './base';
import { renderMarkdown } from '../markdown';
import { escapeHtml } from '../escape';

interface CompletionEmailParams {
  courseTitle: string;
  /** Závěrečný text kurzu z adminu (Markdown). Prázdný = výchozí věta. */
  completionMd: string;
  enrollmentId: string;
  appUrl: string;
  /** Nabídka dalšího vzdělávání. Chybí u příjemců, kteří ji odhlásili, a když není co nabídnout. */
  promo?: PromoData;
}

export function completionEmail(p: CompletionEmailParams): string {
  const content = p.completionMd
    ? styleProse(renderMarkdown(p.completionMd))
    : `<p style="${P}">právě jste dokončili celý kurz <strong>${escapeHtml(p.courseTitle)}</strong>. Gratulujeme.</p>
       <p style="${P}">Zbývá poslední krok: závěrečný test. Když ho splníte, vystavíme vám certifikát.</p>`;

  return baseTemplate(
    `Dokončili jste kurz ${p.courseTitle}`,
    `
    <p style="${P}">Dobrý den,</p>
    ${content}
    ${button(`${p.appUrl}/profil/kurz/${p.enrollmentId}`, 'Složit závěrečný test')}
    ${SIGNATURE}
    ${promoSection(p.promo)}
    `,
    { appUrl: p.appUrl },
  );
}
