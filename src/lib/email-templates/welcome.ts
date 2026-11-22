import { baseTemplate, infoBox, promoSection, styleProse, P, SIGNATURE, type PromoData } from './base';
import { renderMarkdown } from '../markdown';
import { escapeHtml } from '../escape';

interface WelcomeEmailParams {
  courseTitle: string;
  /** Uvítací text kurzu z adminu (Markdown). Prázdný = výchozí věta. */
  welcomeMd: string;
  /** Kdy a jak přijde první lekce. */
  firstLessonInfo?: string;
  appUrl: string;
  /** Nabídka dalšího vzdělávání. Chybí u příjemců, kteří ji odhlásili, a když není co nabídnout. */
  promo?: PromoData;
}

export function welcomeEmail(p: WelcomeEmailParams): string {
  const content = p.welcomeMd
    ? styleProse(renderMarkdown(p.welcomeMd))
    : `<p style="${P}">vítejte v kurzu <strong>${escapeHtml(p.courseTitle)}</strong>. Jsme rádi, že jste se zapsali.</p>`;

  return baseTemplate(
    `Vítejte v kurzu ${p.courseTitle}`,
    `
    <p style="${P}">Dobrý den,</p>
    ${content}
    ${p.firstLessonInfo ? infoBox(escapeHtml(p.firstLessonInfo)) : ''}
    <p style="${P}">Přejeme vám, ať se kurz dobře čte.</p>
    ${SIGNATURE}
    ${promoSection(p.promo)}
    `,
    { appUrl: p.appUrl },
  );
}
