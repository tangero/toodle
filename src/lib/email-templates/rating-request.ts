import { baseTemplate, button, P, SIGNATURE, SMALL } from './base';
import { escapeHtml } from '../escape';

interface RatingRequestParams {
  courseTitle: string;
  /** Odkaz na formulář hodnocení s podepsaným tokenem zápisu. */
  ratingUrl: string;
  appUrl: string;
}

/** Žádost o hodnocení kurzu. Odchází jednou, tři dny po dokončení. Bez bloku nabídek. */
export function ratingRequestEmail(p: RatingRequestParams): string {
  return baseTemplate(
    'Jak se vám kurz líbil?',
    `
    <p style="${P}">Dobrý den,</p>
    <p style="${P}">před pár dny jste dokončili kurz <strong>${escapeHtml(p.courseTitle)}</strong>.
       Řeknete nám, jak se vám líbil? Stačí známka, zabere to půl minuty.</p>
    <p style="${P}">Když připíšete, co vám pomohlo nebo co chybělo, použijeme to při úpravách kurzu.</p>
    ${button(p.ratingUrl, 'Ohodnotit kurz')}
    <p style="${SMALL}">Tento e-mail posíláme ke každému kurzu jen jednou.</p>
    ${SIGNATURE}
    `,
    { appUrl: p.appUrl },
  );
}
