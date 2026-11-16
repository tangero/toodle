import { baseTemplate, button, infoBox, COLOR } from './base';

interface DigestData {
  newEnrollments: number;
  completedEnrollments: number;
  paidOrders: number;
  revenue: number;
  unmatchedPayments: number;
  bouncedEmails: number;
  date: string;
  appUrl: string;
}

export function adminDigestEmail(data: DigestData): string {
  return baseTemplate(
    `Denní přehled: ${data.date}`,
    `
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;line-height:1.25;color:${COLOR.ink};">Přehled za posledních 24 hodin (${data.date})</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 16px;">
      ${row('Nové zápisy', data.newEnrollments)}
      ${row('Dokončené kurzy', data.completedEnrollments)}
      ${row('Zaplacené objednávky', data.paidOrders)}
      ${row('Tržby (24 h)', `${data.revenue} Kč`)}
    </table>

    ${data.unmatchedPayments > 0
      ? infoBox(`<strong>Nespárované platby: ${data.unmatchedPayments}.</strong> Čekají na ruční zpracování.`)
      : ''}
    ${data.bouncedEmails > 0
      ? infoBox(`<strong>Vrácené e-maily: ${data.bouncedEmails}.</strong>`)
      : ''}

    ${button(`${data.appUrl}/admin`, 'Otevřít administraci')}
    `,
    { appUrl: data.appUrl },
  );
}

function row(label: string, value: string | number) {
  return `
    <tr>
      <td style="padding:9px 0;color:${COLOR.muted};font-size:14px;border-bottom:1px solid ${COLOR.line};">${label}</td>
      <td style="padding:9px 0;font-weight:600;color:${COLOR.ink};font-size:15px;text-align:right;border-bottom:1px solid ${COLOR.line};">${value}</td>
    </tr>
  `;
}
