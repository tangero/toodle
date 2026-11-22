import { baseTemplate, button, LINK, P, SIGNATURE, SMALL } from './base';
import { escapeHtml } from '../escape';
import { lessonCountLabel } from '../labels';

export interface InvitationCourse {
  slug: string;
  title: string;
  lesson_count: number;
}

interface InvitationParams {
  courses: InvitationCourse[];
  appUrl: string;
  /** Stránka /odhlaseni-nabidek/[token] pro tohoto čtenáře. */
  optOutUrl: string;
}

export const INVITATION_SUBJECT = 'Nové kurzy Školy AI a prosba o pomoc';

/**
 * Pozvánka pro první skupinu čtenářů (pilotní běh). Jde lidem, kteří při registraci ve staré
 * aplikaci souhlasili, že se jim ozveme s novými kurzy. Starý název „Letní škola AI“ je tu
 * jedinou výjimkou z pravidla značky (schválil Patrick 21. 11. 2026), aby nás lidé poznali.
 * Oslovení je jen „Dobrý den,“ bez jména: jména ze staré aplikace nejdou spolehlivě skloňovat
 * do 5. pádu (rozhodl Patrick 22. 11. 2026).
 */
export function invitationEmail(p: InvitationParams): string {
  const items = p.courses
    .map((c) => `<li style="margin:0 0 6px;"><a href="${escapeHtml(`${p.appUrl}/kurz/${c.slug}`)}" style="${LINK}">${escapeHtml(c.title)}</a> (${escapeHtml(lessonCountLabel(c.lesson_count))})</li>`)
    .join('');

  return baseTemplate(
    INVITATION_SUBJECT,
    `
    <p style="${P}">Dobrý den,</p>
    <p style="${P}">v létě 2025 jste se registrovali v Letní škole AI a souhlasili jste, že se vám ozveme,
       až budou nové kurzy. Teď jsou hotové. Všechny jsou zdarma a lekce vám zase mohou chodit e-mailem:</p>
    <ul style="margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;">${items}</ul>
    <p style="${P}">Píšeme vám jako jedněm z prvních a máme prosbu. Než kurzy nabídneme všem, chceme vědět,
       jestli jim rozumíte. Na konci každé lekce je otázka, jak srozumitelná byla, a tři tlačítka:
       rozuměl jsem, něco mi nesedělo, nerozuměl jsem. Stačí jedno kliknutí.</p>
    <p style="${P}">Když připíšete, čemu jste nerozuměli, pošleme vám vysvětlení jinými slovy
       a lekci podle toho upravíme.</p>
    ${button(`${p.appUrl}/#kurzy`, 'Vybrat kurz')}
    <p style="${SMALL}">Zápis zabere minutu: vyplníte jméno a e-mail a potvrdíte odkaz, který vám pošleme.</p>
    ${SIGNATURE}
    <p style="${SMALL}">Další pozvánky nechcete?
       <a href="${escapeHtml(p.optOutUrl)}" style="color:inherit;text-decoration:underline;">Odhlásit nabídky</a>.</p>
    `,
    { appUrl: p.appUrl, preheader: 'Čtyři nové kurzy zdarma. Pomozte nám zjistit, jestli jim rozumíte.' },
  );
}
