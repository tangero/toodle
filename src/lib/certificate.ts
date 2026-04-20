import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { generateId, run } from '@lib/db';

interface CertificateParams {
  userName: string;
  courseTitle: string;
  score: number;
  issuedAt: string;
  publicId: string;
  appUrl: string;
}

export function generatePublicId(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let id = '';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const b of bytes) id += chars[b % chars.length];
  return id;
}

export async function generateCertificatePdf(params: CertificateParams): Promise<Uint8Array> {
  const { userName, courseTitle, score, issuedAt, publicId, appUrl } = params;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const navy = rgb(0.1, 0.2, 0.5);
  const gold = rgb(0.7, 0.55, 0.1);
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.9, 0.9, 0.9);

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.98, 1) });

  // Border
  const m = 30;
  page.drawRectangle({ x: m, y: m, width: width - 2 * m, height: height - 2 * m, borderColor: navy, borderWidth: 3 });
  page.drawRectangle({ x: m + 8, y: m + 8, width: width - 2 * (m + 8), height: height - 2 * (m + 8), borderColor: gold, borderWidth: 1 });

  // Header
  page.drawText('CERTIFIKÁT O ABSOLVOVÁNÍ', {
    x: 0, y: height - 110, size: 28, font: fontBold, color: navy,
    maxWidth: width, lineHeight: 35,
  });
  // Center manually
  const titleW = fontBold.widthOfTextAtSize('CERTIFIKÁT O ABSOLVOVÁNÍ', 28);
  page.drawText('CERTIFIKÁT O ABSOLVOVÁNÍ', { x: (width - titleW) / 2, y: height - 120, size: 28, font: fontBold, color: navy });

  // Subtitle
  const sub = 'Letní škola AI';
  const subW = fontReg.widthOfTextAtSize(sub, 16);
  page.drawText(sub, { x: (width - subW) / 2, y: height - 150, size: 16, font: fontReg, color: gold });

  // Divider
  page.drawLine({ start: { x: 100, y: height - 165 }, end: { x: width - 100, y: height - 165 }, thickness: 1, color: lightGray });

  // "Tímto se potvrzuje, že"
  const confirm = 'Tímto se potvrzuje, že';
  const confirmW = fontReg.widthOfTextAtSize(confirm, 14);
  page.drawText(confirm, { x: (width - confirmW) / 2, y: height - 200, size: 14, font: fontReg, color: gray });

  // Name
  const nameW = fontBold.widthOfTextAtSize(userName, 36);
  page.drawText(userName, { x: (width - nameW) / 2, y: height - 260, size: 36, font: fontBold, color: navy });

  // Underline name
  page.drawLine({ start: { x: (width - nameW) / 2, y: height - 265 }, end: { x: (width + nameW) / 2, y: height - 265 }, thickness: 1, color: navy });

  // "úspěšně absolvoval/a kurz"
  const absolvoval = 'úspěšně absolvoval/a kurz';
  const absolvovalW = fontReg.widthOfTextAtSize(absolvoval, 14);
  page.drawText(absolvoval, { x: (width - absolvovalW) / 2, y: height - 295, size: 14, font: fontReg, color: gray });

  // Course title
  const courseTitleSize = Math.min(24, 480 / (courseTitle.length * 0.6));
  const courseTitleW = fontBold.widthOfTextAtSize(courseTitle, courseTitleSize);
  page.drawText(courseTitle, { x: (width - courseTitleW) / 2, y: height - 335, size: courseTitleSize, font: fontBold, color: navy });

  // Score
  const scoreText = `Výsledek testu: ${score} %`;
  const scoreW = fontReg.widthOfTextAtSize(scoreText, 13);
  page.drawText(scoreText, { x: (width - scoreW) / 2, y: height - 365, size: 13, font: fontReg, color: gray });

  // Date
  const dateFormatted = new Date(issuedAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateText = `Vydáno: ${dateFormatted}`;
  const dateW = fontReg.widthOfTextAtSize(dateText, 12);
  page.drawText(dateText, { x: (width - dateW) / 2, y: height - 390, size: 12, font: fontReg, color: gray });

  // QR code
  const verifyUrl = `${appUrl}/certifikat/${publicId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrBytes = Uint8Array.from(atob(qrBase64), (c) => c.charCodeAt(0));
  const qrImage = await pdfDoc.embedPng(qrBytes);
  const qrSize = 90;
  page.drawImage(qrImage, { x: width - m - 8 - qrSize - 10, y: m + 30, width: qrSize, height: qrSize });

  // QR label
  page.drawText('Ověřit certifikát', { x: width - m - 8 - qrSize - 10, y: m + 20, size: 9, font: fontReg, color: gray });

  // ID
  page.drawText(`ID: ${publicId}`, { x: m + 20, y: m + 20, size: 9, font: fontReg, color: lightGray });

  return pdfDoc.save();
}

export async function issueCertificate(
  db: D1Database,
  bucket: R2Bucket,
  enrollmentId: string,
  userName: string,
  courseTitle: string,
  score: number,
  appUrl: string,
): Promise<{ publicId: string; pdfKey: string }> {
  const publicId = generatePublicId();
  const issuedAt = new Date().toISOString();
  const pdfKey = `certificates/${publicId}.pdf`;

  const pdfBytes = await generateCertificatePdf({ userName, courseTitle, score, issuedAt, publicId, appUrl });

  await bucket.put(pdfKey, pdfBytes, { httpMetadata: { contentType: 'application/pdf' } });

  const certId = generateId();
  await run(
    db,
    `INSERT INTO certificates (id, enrollment_id, public_id, issued_at, pdf_r2_key) VALUES (?, ?, ?, ?, ?)`,
    certId, enrollmentId, publicId, issuedAt, pdfKey,
  );

  await run(db, `UPDATE enrollments SET score = ? WHERE id = ?`, score, enrollmentId);

  return { publicId, pdfKey };
}
