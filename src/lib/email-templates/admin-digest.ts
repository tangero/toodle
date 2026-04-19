import { baseTemplate } from './base';

interface DigestData {
  newEnrollments: number;
  completedEnrollments: number;
  paidOrders: number;
  revenue: number;
  unmatchedPayments: number;
  bouncedEmails: number;
  date: string;
}

export function adminDigestEmail(data: DigestData): string {
  return baseTemplate(
    `Denní přehled — ${data.date}`,
    `
    <h3 style="color: #111827; margin: 0 0 16px;">Přehled za dnešek (${data.date})</h3>

    <table style="width: 100%; border-collapse: collapse;">
      ${row('Nové enrollmenty', data.newEnrollments)}
      ${row('Dokončené kurzy', data.completedEnrollments)}
      ${row('Zaplacené objednávky', data.paidOrders)}
      ${row('Tržby dnes', `${data.revenue} Kč`)}
    </table>

    ${data.unmatchedPayments > 0 ? `
    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; margin-top: 16px;">
      <p style="margin: 0; color: #9a3412; font-size: 14px;">
        ⚠️ <strong>${data.unmatchedPayments} nespárovaných plateb</strong> čeká na zpracování.
      </p>
    </div>
    ` : ''}

    ${data.bouncedEmails > 0 ? `
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-top: 12px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        📧 <strong>${data.bouncedEmails} vrácených emailů</strong> dnes.
      </p>
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://skola.aivefirmach.cz/admin" style="background-color: #2563eb; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
        Otevřít admin panel
      </a>
    </div>
    `,
  );
}

function row(label: string, value: string | number) {
  return `
    <tr>
      <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6;">${label}</td>
      <td style="padding: 8px 0; font-weight: 600; color: #111827; text-align: right; border-bottom: 1px solid #f3f4f6;">${value}</td>
    </tr>
  `;
}
