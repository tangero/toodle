import { baseTemplate } from './base';
import { escapeHtml } from '../escape';

export function certificateEmail(name: string, courseTitle: string, score: number, certificateUrl: string): string {
  return baseTemplate(
    `Váš certifikát — ${courseTitle}`,
    `
    <p>Ahoj ${escapeHtml(name)},</p>
    <p>gratulujeme! Závěrečný test kurzu <strong>${escapeHtml(courseTitle)}</strong> jste splnili s výsledkem ${score} %.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(certificateUrl)}" style="background-color: #16a34a; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Zobrazit certifikát
      </a>
    </div>
    `,
  );
}
