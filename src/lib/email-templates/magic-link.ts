import { baseTemplate, button, P, SMALL } from './base';

export function magicLinkEmail(url: string, appUrl: string): string {
  return baseTemplate(
    'Přihlášení do Školy AI',
    `
    <p style="${P}">Dobrý den,</p>
    <p style="${P}">tlačítkem níže se přihlásíte do Školy AI.</p>
    ${button(url, 'Přihlásit se')}
    <p style="${SMALL}">
      Odkaz platí 15 minut. Pokud jste o přihlášení nežádali, e-mail ignorujte.
    </p>
    `,
    { appUrl },
  );
}
