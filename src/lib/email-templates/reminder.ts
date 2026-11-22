import { baseTemplate, button, courseUnsubscribeLine, P } from './base';
import { escapeHtml } from '../escape';

export function reminderEmail(
  courseTitle: string,
  lessonPosition: number,
  enrollmentId: string,
  appUrl: string,
  unsubscribeToken: string,
): string {
  return baseTemplate(
    `Pokračujte v kurzu ${courseTitle}`,
    `
    <p style="${P}">Dobrý den,</p>
    <p style="${P}">
      v kurzu <strong>${escapeHtml(courseTitle)}</strong> jste se zastavili u lekce ${lessonPosition}.
      Další lekci vám pošleme, jakmile si o ni řeknete tlačítkem na stránce kurzu.
    </p>
    ${button(`${appUrl}/profil/kurz/${enrollmentId}`, 'Pokračovat v kurzu')}
    <p style="${P}">Pokud o kurz už nemáte zájem, můžete se z něj odkazem níže odhlásit.</p>
    ${courseUnsubscribeLine(appUrl, unsubscribeToken)}
    `,
    { appUrl },
  );
}
