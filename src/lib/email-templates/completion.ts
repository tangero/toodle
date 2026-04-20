import { baseTemplate } from './base';
import { renderMarkdown } from '../markdown';

export function completionEmail(
  userName: string,
  courseTitle: string,
  completionMd: string,
  enrollmentId: string,
  appUrl: string,
): string {
  const content = completionMd
    ? renderMarkdown(completionMd)
    : `<p>Skvělá práce! Právě jste dokončili celý kurz <strong>${courseTitle}</strong>.</p>`;

  return baseTemplate(
    `Dokončili jste kurz ${courseTitle}!`,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-flex; align-items: center; justify-content: center;
                  width: 64px; height: 64px; border-radius: 50%; background: #dcfce7;">
        <span style="font-size: 28px;">🎓</span>
      </div>
    </div>

    <p>Ahoj ${userName},</p>
    ${content}

    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}/profil/kurz/${enrollmentId}"
         style="background-color: #16a34a; color: #ffffff; padding: 12px 32px; border-radius: 8px;
                text-decoration: none; font-weight: 600; display: inline-block;">
        Složit závěrečný test a získat certifikát
      </a>
    </div>
    `,
  );
}
