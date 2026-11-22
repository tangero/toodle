import { baseTemplate, button, P } from './base';
import { escapeHtml } from '../escape';

export function certificateEmail(
  courseTitle: string,
  score: number,
  certificateUrl: string,
  appUrl: string,
): string {
  return baseTemplate(
    `Váš certifikát: ${courseTitle}`,
    `
    <p style="${P}">Dobrý den,</p>
    <p style="${P}">gratulujeme. Závěrečný test kurzu <strong>${escapeHtml(courseTitle)}</strong> jste splnili s výsledkem ${score} %.</p>
    <p style="${P}">Certifikát si můžete zobrazit, stáhnout jako PDF a kdokoli si jeho pravost ověří přes QR kód.</p>
    ${button(certificateUrl, 'Zobrazit certifikát')}
    `,
    { appUrl },
  );
}
