import { baseTemplate } from './base';
import { renderMarkdown } from '../markdown';
import { escapeHtml } from '../escape';

export function welcomeEmail(
  name: string,
  courseTitle: string,
  welcomeMd: string,
  firstLessonInfo?: string,
): string {
  const content = welcomeMd
    ? renderMarkdown(welcomeMd)
    : `<p>Gratulujeme! Právě jste začali kurz <strong>${escapeHtml(courseTitle)}</strong>.</p>`;

  const info = firstLessonInfo
    ? `<p style="background:#f3f4f6;border-radius:8px;padding:12px;">${escapeHtml(firstLessonInfo)}</p>`
    : '';

  return baseTemplate(
    `Vítejte v kurzu ${courseTitle}`,
    `
    <p>Ahoj ${escapeHtml(name)},</p>
    ${content}
    ${info}
    <p>Přejeme hodně štěstí s učením!</p>
    `,
  );
}
