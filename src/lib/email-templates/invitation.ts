import { baseTemplate, button, LINK, SMALL, styleProse } from './base';
import { escapeHtml } from '../escape';
import { lessonCountLabel } from '../labels';
import { renderMarkdown } from '../markdown';

export interface InvitationCourse {
  slug: string;
  title: string;
  lesson_count: number;
}

export interface InvitationParams {
  courses: InvitationCourse[];
  appUrl: string;
  /** Stránka /odhlaseni-nabidek/[token] pro tohoto čtenáře. */
  optOutUrl: string;
  /** Předmět e-mailu (výchozí INVITATION_SUBJECT). */
  subject?: string;
  /** Náhledový text vedle předmětu (výchozí INVITATION_PREHEADER). */
  preheader?: string;
  /** Tělo e-mailu v Markdownu (výchozí DEFAULT_INVITATION_MD). */
  bodyMd?: string;
}

export interface InvitationTemplateInput {
  subject: string;
  preheader: string;
  body_md: string;
}

export const INVITATION_SUBJECT = 'Nové kurzy Školy AI a prosba o pomoc';
export const INVITATION_PREHEADER = 'Čtyři nové kurzy zdarma. Pomozte nám zjistit, jestli jim rozumíte.';

export const INVITATION_SUBJECT_MAX = 200;
export const INVITATION_PREHEADER_MAX = 300;
export const INVITATION_BODY_MAX = 50_000;

/**
 * Výchozí znění pozvánky v Markdownu. Jde lidem, kteří při registraci ve staré aplikaci
 * souhlasili, že se jim ozveme s novými kurzy. Starý název „Letní škola AI“ je tu jedinou
 * výjimkou z pravidla značky (schválil Patrick 21. 11. 2026), aby nás lidé poznali.
 * Oslovení je jen „Dobrý den,“ bez jména: jména ze staré aplikace nejdou spolehlivě skloňovat
 * do 5. pádu (rozhodl Patrick 22. 11. 2026).
 */
export const DEFAULT_INVITATION_MD = [
  'Dobrý den,',
  '',
  'v létě 2025 jste se registrovali v Letní škole AI a souhlasili jste, že se vám ozveme, až budou nové kurzy. Teď jsou hotové. Všechny jsou zdarma a lekce vám zase mohou chodit e-mailem:',
  '',
  '{{kurzy}}',
  '',
  'Píšeme vám jako jedněm z prvních a máme prosbu. Než kurzy nabídneme všem, chceme vědět, jestli jim rozumíte. Na konci každé lekce je otázka, jak srozumitelná byla, a tři tlačítka: rozuměl jsem, něco mi nesedělo, nerozuměl jsem. Stačí jedno kliknutí.',
  '',
  'Když připíšete, čemu jste nerozuměli, pošleme vám vysvětlení jinými slovy a lekci podle toho upravíme.',
  '',
  '{{tlacitko:Vybrat kurz}}',
  '',
  'Zápis zabere minutu: vyplníte jméno a e-mail a potvrdíte odkaz, který vám pošleme.',
  '',
  'Tým Školy AI, Patrick a Andrea',
].join('\n');

export function validateInvitationTemplateInput(raw: {
  subject?: unknown;
  preheader?: unknown;
  body_md?: unknown;
}): { ok: true; value: InvitationTemplateInput } | { ok: false; error: string } {
  const subject = String(raw.subject ?? '').replace(/[\r\n]+/g, ' ').trim();
  const preheader = String(raw.preheader ?? '').replace(/[\r\n]+/g, ' ').trim();
  const body_md = String(raw.body_md ?? '').replace(/\r\n/g, '\n').trim();

  if (!subject) return { ok: false, error: 'Předmět e-mailu nesmí být prázdný.' };
  if (subject.length > INVITATION_SUBJECT_MAX) {
    return { ok: false, error: `Předmět je příliš dlouhý (max ${INVITATION_SUBJECT_MAX} znaků).` };
  }
  if (preheader.length > INVITATION_PREHEADER_MAX) {
    return { ok: false, error: `Náhledový text je příliš dlouhý (max ${INVITATION_PREHEADER_MAX} znaků).` };
  }
  if (!body_md) return { ok: false, error: 'Text pozvánky nesmí být prázdný.' };
  if (body_md.length > INVITATION_BODY_MAX) {
    return { ok: false, error: `Text pozvánky je příliš dlouhý (max ${INVITATION_BODY_MAX} znaků).` };
  }
  return { ok: true, value: { subject, preheader, body_md } };
}

function renderCourseList(courses: InvitationCourse[], appUrl: string): string {
  if (courses.length === 0) return '';
  const items = courses
    .map(
      (c) =>
        `<li style="margin:0 0 6px;"><a href="${escapeHtml(`${appUrl}/kurz/${c.slug}`)}" style="${LINK}">${escapeHtml(c.title)}</a> (${escapeHtml(lessonCountLabel(c.lesson_count))})</li>`,
    )
    .join('');
  return `<ul style="margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;">${items}</ul>`;
}

function resolveButtonUrl(rawUrl: string | undefined, appUrl: string): string {
  const trimmed = (rawUrl ?? '').trim();
  if (!trimmed) return `${appUrl}/#kurzy`;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return `${appUrl}${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${appUrl}/#kurzy`;
}

/**
 * Pozvánka k novým kurzům z Markdownu. Podporuje zástupné značky:
 * - `{{kurzy}}` – seznam publikovaných kurzů s počtem lekcí,
 * - `{{tlacitko}}`, `{{tlacitko:Text}}` nebo `{{tlacitko:Text|URL}}` – hlavní tlačítko,
 * - `{{url}}` – kořenová adresa webu.
 * Odkaz na odhlášení nabídek se vždy doplní na konec e-mailu.
 */
export function invitationEmail(p: InvitationParams): string {
  const appUrl = p.appUrl.replace(/\/+$/, '');
  const subject = p.subject?.trim() || INVITATION_SUBJECT;
  const preheader = (p.preheader ?? INVITATION_PREHEADER).trim();
  const rawMd = (p.bodyMd ?? DEFAULT_INVITATION_MD).replace(/\r\n/g, '\n');

  const withUrl = rawMd.replace(/\{\{url\}\}/g, appUrl);

  // Značky bloků vyndáme před převodem Markdownu, aby do nich marked nezasahoval (např. auto-odkazy).
  let prefix = 'XINVBLK';
  while (withUrl.includes(prefix)) prefix += 'X';

  const blocks: string[] = [];
  const pushBlock = (html: string): string => {
    const token = `${prefix}${blocks.length}END`;
    blocks.push(html);
    return token;
  };

  const preparedMd = withUrl
    .replace(/\{\{kurzy\}\}/g, () => pushBlock(renderCourseList(p.courses, appUrl)))
    .replace(/\{\{tlacitko(?::([^}\n]*))?\}\}/g, (_match, rawArg?: string) => {
      const arg = rawArg ?? '';
      const pipe = arg.indexOf('|');
      const rawLabel = pipe === -1 ? arg : arg.slice(0, pipe);
      const rawUrl = pipe === -1 ? undefined : arg.slice(pipe + 1);
      const label = rawLabel.trim() || 'Vybrat kurz';
      const url = resolveButtonUrl(rawUrl, appUrl);
      return pushBlock(button(url, label));
    });

  let bodyHtml = styleProse(renderMarkdown(preparedMd));

  // Relativní odkazy z Markdownu (/kurz/...) převedeme na plnou adresu pro e-mailové klienty.
  bodyHtml = bodyHtml.replace(
    /href="(\/(?!\/)[^"]*)"/g,
    (_m, path: string) => `href="${escapeHtml(appUrl)}${path}"`,
  );

  for (let i = 0; i < blocks.length; i++) {
    const token = `${prefix}${i}END`;
    const standalone = new RegExp(`<p[^>]*>\\s*${token}\\s*</p>`, 'g');
    bodyHtml = bodyHtml
      .replace(standalone, () => blocks[i])
      .replaceAll(token, () => blocks[i]);
  }

  const optOut = `<p style="${SMALL}margin-top:24px;">Další pozvánky nechcete? <a href="${escapeHtml(p.optOutUrl)}" style="color:inherit;text-decoration:underline;">Odhlásit nabídky</a>.</p>`;

  return baseTemplate(
    subject,
    `${bodyHtml}\n${optOut}`,
    { appUrl, preheader: preheader || undefined },
  );
}
