import { baseTemplate } from './base';
import { renderMarkdown } from '../markdown';

export function welcomeEmail(
  name: string,
  courseTitle: string,
  welcomeMd: string,
): string {
  const content = welcomeMd
    ? renderMarkdown(welcomeMd)
    : `<p>Gratulujeme! Právě jste začali kurz <strong>${courseTitle}</strong>. První lekce vám přijde již brzy.</p>`;

  return baseTemplate(
    `Vítejte v kurzu ${courseTitle}`,
    `
    <p>Ahoj ${name},</p>
    ${content}
    <p>Přejeme hodně štěstí s učením!</p>
    `,
  );
}
