import {
  baseTemplate, button, courseUnsubscribeLine, infoBox, promoSection, styleProse,
  COLOR, FONT, SMALL, type PromoData,
} from './base';
import { renderMarkdown } from '../markdown';
import { escapeHtml } from '../escape';
import { FEEDBACK_ANSWERS, FEEDBACK_LABELS } from '../feedback';

interface LessonEmailParams {
  courseTitle: string;
  lessonTitle: string;
  lessonPosition: number;
  totalLessons: number;
  contentMd: string;
  readingMinutes: number;
  deliveryMode: 'on_click' | 'next_workday';
  enrollmentId: string;
  appUrl: string;
  unsubscribeToken: string;
  /**
   * Adresa stránky /srozumitelnost/[token] pro tuto lekci. Řádek s otázkou na srozumitelnost
   * se vkládá jen u kurzů doručovaných každý pracovní den; u kurzů na potvrzení se odpovídá
   * tlačítky na stránce kurzu.
   */
  feedbackUrl?: string;
  /** Nabídka dalšího vzdělávání. Chybí u příjemců, kteří ji odhlásili, a když není co nabídnout. */
  promo?: PromoData;
}

/**
 * E-mail s lekcí. Oslovení jménem se nevkládá: texty lekcí začínají vlastním úvodem
 * (u denních kurzů „Dobré ráno…“, viz docs/course-content/pravidla-psani-lekci.md),
 * takže by se v e-mailu sešla dvě oslovení za sebou.
 */
/**
 * Otázka na srozumitelnost se třemi odkazy. Všechny tři mají stejný styl a stálé pořadí,
 * žádný není zvýrazněný, aby vzhled odpověď nenapovídal. Odkaz nic nezapisuje, jen otevře
 * stránku s potvrzením (odkazy v e-mailech otevírají i skenery pošty).
 */
export function feedbackBlock(feedbackUrl: string): string {
  const rows = FEEDBACK_ANSWERS.map((answer) => `
      <tr>
        <td style="padding:0 0 8px;">
          <a href="${escapeHtml(feedbackUrl)}?odpoved=${answer}" style="display:block;padding:12px 16px;border:1px solid ${COLOR.ink};background-color:${COLOR.surface};font-family:${FONT};font-size:16px;font-weight:600;line-height:1.35;color:${COLOR.ink};text-decoration:none;">${escapeHtml(FEEDBACK_LABELS[answer])}</a>
        </td>
      </tr>`).join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;border-top:1px solid ${COLOR.ink};">
      <tr>
        <td style="padding:16px 0 12px;font-family:${FONT};font-size:16px;font-weight:600;line-height:1.4;color:${COLOR.ink};">Jak srozumitelná byla dnešní lekce?</td>
      </tr>${rows}
    </table>`;
}

export function lessonEmail(p: LessonEmailParams): string {
  const contentHtml = styleProse(renderMarkdown(p.contentMd));
  const isLast = p.lessonPosition >= p.totalLessons;
  const courseUrl = `${p.appUrl}/profil/kurz/${p.enrollmentId}`;

  const doneButton = p.deliveryMode === 'on_click' && !isLast
    ? button(courseUrl, 'Hotovo, chci další lekci')
    : '';

  const nextInfo = p.deliveryMode === 'next_workday' && !isLast
    ? `<p style="${SMALL}margin-top:24px;">Další lekce vám přijde příští pracovní den.</p>`
    : '';

  const feedback = p.deliveryMode === 'next_workday' && p.feedbackUrl
    ? feedbackBlock(p.feedbackUrl)
    : '';

  const finishInfo = isLast
    ? `${infoBox(`<strong>To byla poslední lekce kurzu.</strong><br>Teď můžete složit závěrečný test a získat certifikát.`)}
       ${button(courseUrl, 'Přejít na závěrečný test')}`
    : '';

  return baseTemplate(
    `Lekce ${p.lessonPosition}: ${p.lessonTitle}`,
    `
    <p style="${SMALL}margin-bottom:6px;">
      ${escapeHtml(p.courseTitle)} · Lekce ${p.lessonPosition} z ${p.totalLessons} · ${p.readingMinutes} min čtení
    </p>
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:600;line-height:1.2;color:${COLOR.ink};">${escapeHtml(p.lessonTitle)}</h1>

    ${contentHtml}

    ${feedback}
    ${doneButton}
    ${nextInfo}
    ${finishInfo}
    ${promoSection(p.promo)}
    ${courseUnsubscribeLine(p.appUrl, p.unsubscribeToken)}
    `,
    { appUrl: p.appUrl },
  );
}
