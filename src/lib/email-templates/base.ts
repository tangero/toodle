/**
 * Společný základ e-mailů ve vzhledu webu Škola AI (src/styles/site.css):
 * bílá plocha na světlém podkladu, ostré rohy, tmavé linky, akcent jen na odkazech.
 *
 * E-mailové klienty neumí vnější styly spolehlivě, proto je vše inline a rozvržení
 * drží tabulky. Blok <style> v hlavičce jen zmenšuje okraje na telefonu; kde ho klient
 * zahodí, e-mail vypadá stejně, jen s širšími okraji. Webová písma ani obrázky se nenačítají.
 */
import { escapeHtml } from '../escape';
import type { EventTip } from '../events';

export const COLOR = {
  paper: '#fbfbfa',
  surface: '#ffffff',
  ink: '#121212',
  muted: '#55524c',
  line: '#d6d3cc',
  fill: '#f1efea',
  accent: '#b93a0d',
} as const;

export const FONT = "'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

/** Styly odstavců a drobného textu pro skládání těla šablon. */
export const P = `margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLOR.ink};`;
export const SMALL = `margin:0 0 12px;font-size:14px;line-height:1.5;color:${COLOR.muted};`;
export const LINK = `color:${COLOR.accent};text-decoration:underline;`;

/** Podpis pod e-maily, které ho mají. */
export const SIGNATURE = `<p style="${P}margin-top:24px;">Tým Školy AI, Patrick a Andrea</p>`;

interface BaseOptions {
  /** Kořenová adresa webu (env.APP_URL) – kvůli odkazu na zásady v patičce. */
  appUrl: string;
  /** Text, který poštovní klient ukáže v náhledu vedle předmětu. */
  preheader?: string;
}

/** `title` a `preheader` jsou prostý text (escapují se), `body` je hotové HTML – vkládané hodnoty escapuj už při skládání. */
export function baseTemplate(title: string, body: string, opts: BaseOptions): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLOR.paper};font-size:1px;line-height:1px;">${escapeHtml(opts.preheader)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)}</title>
  <style>
    @media (max-width: 480px) {
      .sa-outer { padding: 12px 0 24px !important; }
      .sa-pad { padding-left: 18px !important; padding-right: 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.paper};font-family:${FONT};color:${COLOR.ink};-webkit-text-size-adjust:100%;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR.paper};">
    <tr>
      <td align="center" class="sa-outer" style="padding:32px 12px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${COLOR.surface};border:1px solid ${COLOR.ink};">
          <tr>
            <td class="sa-pad" style="padding:18px 28px;border-bottom:1px solid ${COLOR.ink};font-family:${FONT};font-size:18px;font-weight:700;line-height:1.3;color:${COLOR.ink};">Škola AI</td>
          </tr>
          <tr>
            <td class="sa-pad" style="padding:28px 28px 24px;font-family:${FONT};font-size:16px;line-height:1.6;color:${COLOR.ink};word-break:break-word;overflow-wrap:break-word;">
              ${body}
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td class="sa-pad" style="padding:16px 28px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${COLOR.muted};">
              &copy; ${new Date().getFullYear()} Škola AI · Patrick Zandl, IČO 43943420<br>
              <a href="${escapeHtml(opts.appUrl)}/ochrana-osobnich-udaju" style="color:${COLOR.muted};text-decoration:underline;">Ochrana osobních údajů</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plné tlačítko s ostrými rohy. `label` je prostý text, `url` se escapuje. */
export function button(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td bgcolor="${COLOR.ink}" style="background-color:${COLOR.ink};border-radius:0;">
        <a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 24px;font-family:${FONT};font-size:16px;font-weight:600;line-height:1.3;color:#ffffff;text-decoration:none;border:1px solid ${COLOR.ink};border-radius:0;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

/** Rámeček s doplňující informací. `html` je hotové HTML. */
export function infoBox(html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
    <tr>
      <td style="padding:14px 16px;background-color:${COLOR.fill};border:1px solid ${COLOR.ink};font-family:${FONT};font-size:15px;line-height:1.55;color:${COLOR.ink};">${html}</td>
    </tr>
  </table>`;
}

const H = `font-family:${FONT};font-weight:600;line-height:1.25;color:${COLOR.ink};`;

/** Inline styly pro značky, které propouští `renderMarkdown` (whitelist v src/lib/markdown.ts). */
const PROSE_STYLES: Record<string, string> = {
  p: P,
  h1: `${H}margin:28px 0 12px;font-size:22px;`,
  h2: `${H}margin:28px 0 12px;font-size:20px;`,
  h3: `${H}margin:24px 0 10px;font-size:18px;`,
  h4: `${H}margin:20px 0 8px;font-size:16px;`,
  h5: `${H}margin:20px 0 8px;font-size:16px;`,
  h6: `${H}margin:20px 0 8px;font-size:16px;`,
  ul: `margin:0 0 16px;padding:0 0 0 22px;`,
  ol: `margin:0 0 16px;padding:0 0 0 22px;`,
  li: `margin:0 0 8px;font-size:16px;line-height:1.6;color:${COLOR.ink};`,
  a: `${LINK}word-break:break-word;`,
  blockquote: `margin:0 0 16px;padding:2px 0 2px 16px;border-left:3px solid ${COLOR.ink};`,
  pre: `margin:0 0 16px;padding:14px 16px;background-color:${COLOR.fill};font-family:${FONT_MONO};font-size:14px;line-height:1.55;white-space:pre-wrap;word-break:break-word;`,
  code: `font-family:${FONT_MONO};font-size:14px;background-color:${COLOR.fill};`,
  hr: `border:none;border-top:1px solid ${COLOR.line};margin:24px 0;`,
  table: `width:100%;margin:0 0 16px;border-collapse:collapse;`,
  th: `padding:8px 10px;border:1px solid ${COLOR.line};background-color:${COLOR.fill};font-size:14px;line-height:1.45;text-align:left;vertical-align:top;word-break:normal;overflow-wrap:break-word;`,
  td: `padding:8px 10px;border:1px solid ${COLOR.line};font-size:14px;line-height:1.45;text-align:left;vertical-align:top;word-break:normal;overflow-wrap:break-word;`,
};

const PROSE_TAG_RE = new RegExp(`<(${Object.keys(PROSE_STYLES).join('|')})(\\s[^>]*)?>`, 'g');

/**
 * Doplní inline styly do HTML z `renderMarkdown`. Volat až na vyčištěný výstup:
 * spoléhá na to, že značky nemají vlastní atribut style a hodnoty atributů neobsahují `>`.
 */
export function styleProse(html: string): string {
  return html
    .replace(PROSE_TAG_RE, (_tag, name: string, attrs: string | undefined) =>
      `<${name}${attrs ?? ''} style="${PROSE_STYLES[name]}">`)
    // Odstavec uvnitř položky seznamu nemá mít vlastní spodní okraj.
    .replace(/(<li[^>]*>\s*)<p style="[^"]*">/g, `$1<p style="margin:0;font-size:16px;line-height:1.6;color:${COLOR.ink};">`);
}

/** Kolik akcí se pod e-mail vejde. */
export const PROMO_MAX_ITEMS = 2;

/** Podklady pro blok nabídek: akce a odkaz na jejich odhlášení pro daného příjemce. */
export interface PromoData {
  tips: EventTip[];
  optOutUrl: string;
}

/**
 * Blok „Další naše AI vzdělávání“ pod lekcí, uvítacím a závěrečným e-mailem.
 * Bez akcí vrací prázdný řetězec, takže se sekce v e-mailu vůbec neobjeví.
 */
export function promoBlock(tips: EventTip[], optOutUrl: string): string {
  const items = tips
    .filter((tip) => tip.title.trim() && tip.url.startsWith('https://'))
    .slice(0, PROMO_MAX_ITEMS);
  if (items.length === 0) return '';

  const rows = items.map((tip) => {
    const meta = [tip.label, tip.meta].map((part) => part.trim()).filter(Boolean).join(' · ');
    return `
      <tr>
        <td style="padding:12px 0;border-top:1px solid ${COLOR.line};font-family:${FONT};">
          ${meta ? `<div style="margin:0 0 3px;font-size:13px;line-height:1.45;color:${COLOR.muted};">${escapeHtml(meta)}</div>` : ''}
          <a href="${escapeHtml(tip.url)}" style="font-size:16px;font-weight:600;line-height:1.35;color:${COLOR.ink};text-decoration:underline;">${escapeHtml(tip.title)}</a>
        </td>
      </tr>`;
  }).join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:36px 0 0;border-top:1px solid ${COLOR.ink};">
      <tr>
        <td style="padding:16px 0 10px;font-family:${FONT};font-size:14px;font-weight:600;line-height:1.4;color:${COLOR.ink};">Další naše AI vzdělávání</td>
      </tr>${rows}
      <tr>
        <td style="padding:10px 0 0;border-top:1px solid ${COLOR.line};font-family:${FONT};font-size:12px;line-height:1.5;color:${COLOR.muted};">
          <a href="${escapeHtml(optOutUrl)}" style="color:${COLOR.muted};text-decoration:underline;">Nechci dostávat nabídky</a>
        </td>
      </tr>
    </table>`;
}

/** Pohodlnější volání ze šablon: bez podkladů nic nevloží. */
export function promoSection(promo: PromoData | undefined): string {
  return promo ? promoBlock(promo.tips, promo.optOutUrl) : '';
}

/** Drobná patička těla s odkazem na odhlášení z kurzu. */
export function courseUnsubscribeLine(appUrl: string, unsubscribeToken: string): string {
  return `<p style="margin:24px 0 0;padding-top:14px;border-top:1px solid ${COLOR.line};font-size:12px;line-height:1.5;color:${COLOR.muted};">
      <a href="${escapeHtml(appUrl)}/odhlaseni/${escapeHtml(unsubscribeToken)}" style="color:${COLOR.muted};text-decoration:underline;">Odhlásit se z kurzu</a>
    </p>`;
}
