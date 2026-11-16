import { baseTemplate } from './base';
import { escapeHtml } from '../escape';

/** Potvrzení zápisu do kurzu (double opt-in). Odkaz vede na potvrzovací stránku, ne přímo na akci. */
export function verificationEmail(url: string, name: string, courseTitle: string): string {
  return baseTemplate(
    'Potvrďte zápis do kurzu',
    `
    <p>Ahoj ${escapeHtml(name)},</p>
    <p>někdo (nejspíš vy) požádal o zápis této e-mailové adresy do kurzu <strong>${escapeHtml(courseTitle)}</strong>.
       Zápis potvrdíte tlačítkem níže – tím se zároveň přihlásíte.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(url)}" style="background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Potvrdit zápis
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">
      Odkaz platí 48 hodin. Pokud jste se nezapisovali, e-mail ignorujte – bez potvrzení vám nic chodit nebude.
    </p>
    `,
  );
}
