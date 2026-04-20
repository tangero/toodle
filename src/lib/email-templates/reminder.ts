import { baseTemplate } from './base';

export function reminderEmail(
  userName: string,
  courseTitle: string,
  lessonPosition: number,
  enrollmentId: string,
  appUrl: string,
  unsubscribeToken: string,
): string {
  return baseTemplate(
    `Pokračujte v kurzu ${courseTitle}`,
    `
    <p>Ahoj ${userName},</p>
    <p>
      Zdá se, že jste na chvíli přestali číst kurz <strong>${courseTitle}</strong>.
      Pokračujete u lekce č. ${lessonPosition} — ještě vás čeká zajímavé učení!
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}/profil/kurz/${enrollmentId}"
         style="background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px;
                text-decoration: none; font-weight: 600; display: inline-block;">
        Pokračovat v kurzu
      </a>
    </div>
    <p style="color: #6b7280; font-size: 13px; text-align: center;">
      Pokud o kurz nemáte zájem, můžete se
      <a href="${appUrl}/odhlaseni/${unsubscribeToken}" style="color: #6b7280;">odhlásit</a>.
    </p>
    `,
  );
}
