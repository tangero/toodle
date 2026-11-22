import { baseTemplate, P, SIGNATURE, SMALL } from './base';
import { escapeHtml } from '../escape';

interface FeedbackReplyParams {
  courseTitle: string;
  lessonTitle: string;
  /** Připomínka čtenáře (prostý text, může být prázdná). */
  comment: string;
  /** Názvy částí lekce, které čtenář označil. */
  sections: string[];
  /** Schválené vysvětlení (prostý text, odstavce oddělené prázdným řádkem). */
  body: string;
  appUrl: string;
}

/** Odstavce z prostého textu; vše se escapuje, jednoduché zalomení zůstane jako <br>. */
export function plainTextToParagraphs(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p style="${P}">${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

export function feedbackReplySubject(lessonTitle: string): string {
  return `Vysvětlení k lekci ${lessonTitle}`;
}

/** Vysvětlení na připomínku čtenáře k lekci. Text schvaluje člověk, bez bloku nabídek. */
export function feedbackReplyEmail(p: FeedbackReplyParams): string {
  const what = p.comment.trim()
    ? `<p style="${P}">K lekci <strong>${escapeHtml(p.lessonTitle)}</strong> v kurzu ${escapeHtml(p.courseTitle)} jste nám napsali:</p>
       <p style="${P}padding-left:14px;border-left:3px solid #111111;">${escapeHtml(p.comment.trim()).replace(/\n/g, '<br>')}</p>`
    : `<p style="${P}">U lekce <strong>${escapeHtml(p.lessonTitle)}</strong> v kurzu ${escapeHtml(p.courseTitle)} jste označili,
       že vám něco nebylo jasné${p.sections.length ? `, konkrétně část ${p.sections.map((s) => `„${escapeHtml(s)}“`).join(', ')}` : ''}.</p>`;

  return baseTemplate(
    feedbackReplySubject(p.lessonTitle),
    `
    <p style="${P}">Dobrý den,</p>
    ${what}
    <p style="${P}">Děkujeme, přesně tohle potřebujeme vědět. Zkusíme to vysvětlit jinak:</p>
    ${plainTextToParagraphs(p.body)}
    <p style="${SMALL}">Pořád to nesedí? Odpovězte na tento e-mail, čteme to. Podle vašich připomínek lekci upravíme.</p>
    ${SIGNATURE}
    `,
    { appUrl: p.appUrl },
  );
}
