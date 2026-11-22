import { baseTemplate, button, P, SMALL } from './base';
import { escapeHtml } from '../escape';

/** Potvrzení zápisu do kurzu (double opt-in). Odkaz vede na potvrzovací stránku, ne přímo na akci. */
export function verificationEmail(url: string, courseTitle: string, appUrl: string): string {
  return baseTemplate(
    'Potvrďte zápis do kurzu',
    `
    <p style="${P}">Dobrý den,</p>
    <p style="${P}">někdo (nejspíš vy) požádal o zápis této e-mailové adresy do kurzu <strong>${escapeHtml(courseTitle)}</strong>.
       Zápis potvrdíte tlačítkem níže. Tím se zároveň přihlásíte.</p>
    ${button(url, 'Potvrdit zápis')}
    <p style="${SMALL}">
      Odkaz platí 48 hodin. Pokud jste se nezapisovali, e-mail ignorujte. Bez potvrzení vám nic chodit nebude.
    </p>
    `,
    { appUrl },
  );
}
