import { baseTemplate } from './base';
import { renderMarkdown } from '../markdown';

interface LessonEmailParams {
  userName: string;
  courseTitle: string;
  lessonTitle: string;
  lessonPosition: number;
  totalLessons: number;
  contentMd: string;
  readingMinutes: number;
  deliveryMode: 'on_click' | 'next_workday';
  enrollmentId: string;
  appUrl: string;
  unsubscribeToken: string;
}

export function lessonEmail(p: LessonEmailParams): string {
  const contentHtml = renderMarkdown(p.contentMd);
  const isLast = p.lessonPosition === p.totalLessons;

  const doneButton = p.deliveryMode === 'on_click' && !isLast ? `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${p.appUrl}/profil/kurz/${p.enrollmentId}"
         style="background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px;
                text-decoration: none; font-weight: 600; display: inline-block;">
        Hotovo, chci další lekci →
      </a>
    </div>
  ` : '';

  const nextInfo = p.deliveryMode === 'next_workday' && !isLast
    ? `<p style="color: #6b7280; font-size: 13px; text-align: center;">Další lekce přijde příští pracovní den.</p>`
    : '';

  const finishInfo = isLast
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:24px;text-align:center;">
         <p style="margin:0;font-weight:600;color:#166534;">Gratulujeme — to byla poslední lekce!</p>
         <p style="margin:8px 0 0;font-size:13px;color:#166534;">Nyní můžete složit závěrečný test a získat certifikát.</p>
         <a href="${p.appUrl}/profil/kurz/${p.enrollmentId}"
            style="display:inline-block;margin-top:12px;background:#16a34a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
           Přejít na závěrečný test
         </a>
       </div>`
    : '';

  return baseTemplate(
    `Lekce ${p.lessonPosition}: ${p.lessonTitle}`,
    `
    <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">
      ${p.courseTitle} · Lekce ${p.lessonPosition} z ${p.totalLessons} · ${p.readingMinutes} min čtení
    </p>
    <h2 style="color: #111827; margin: 0 0 24px; font-size: 22px;">${p.lessonTitle}</h2>

    <div style="line-height: 1.7; color: #374151;">
      ${contentHtml}
    </div>

    ${doneButton}
    ${nextInfo}
    ${finishInfo}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;" />
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      <a href="${p.appUrl}/odhlaseni/${p.unsubscribeToken}" style="color: #9ca3af;">Odhlásit se z kurzu</a>
    </p>
    `,
  );
}
