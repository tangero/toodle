import { baseTemplate } from './base';

export function verificationEmail(url: string, name: string): string {
  return baseTemplate(
    'Ověřte svůj email',
    `
    <p>Ahoj ${name},</p>
    <p>děkujeme za registraci do Letní školy AI. Ověřte prosím svůj email kliknutím na tlačítko:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Ověřit email
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">
      Pokud jste se neregistrovali, email ignorujte.
    </p>
    `,
  );
}
