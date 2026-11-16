import {
  baseTemplate, button, courseUnsubscribeLine, infoBox, promoSection, styleProse,
  COLOR, SMALL, type PromoData,
} from './base';
import { renderMarkdown } from '../markdown';
import { escapeHtml } from '../escape';

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
  /** Nabídka dalšího vzdělávání. Chybí u příjemců, kteří ji odhlásili, a když není co nabídnout. */
  promo?: PromoData;
}

/**
 * E-mail s lekcí. Oslovení jménem se nevkládá: texty lekcí začínají vlastním úvodem
 * (u denních kurzů „Dobré ráno…“, viz docs/course-content/pravidla-psani-lekci.md),
 * takže by se v e-mailu sešla dvě oslovení za sebou.
 */
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

    ${doneButton}
    ${nextInfo}
    ${finishInfo}
    ${promoSection(p.promo)}
    ${courseUnsubscribeLine(p.appUrl, p.unsubscribeToken)}
    `,
    { appUrl: p.appUrl },
  );
}
