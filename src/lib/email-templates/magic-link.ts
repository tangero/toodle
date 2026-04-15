import { baseTemplate } from './base';

export function magicLinkEmail(url: string): string {
  return baseTemplate(
    'Přihlášení do Letní školy AI',
    `
    <p>Ahoj,</p>
    <p>kliknutím na tlačítko se přihlásíte do Letní školy AI:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Přihlásit se
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">
      Odkaz platí 15 minut. Pokud jste o přihlášení nežádali, email ignorujte.
    </p>
    `,
  );
}
