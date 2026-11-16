import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
// Jen čisté JS jádro qrcode – hlavní vstup balíčku tahá Node moduly (fs, zlib), které Worker nemá.
import { create as createQr } from 'qrcode/lib/core/qrcode';
import { generateId, getOne } from '@lib/db';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
// TTF s plnou podporou češtiny (standardní PDF fonty umí jen WinAnsi a padají na ě, ř, č, ů…).
// `?inline` vloží font do bundle jako data URL – Worker nepotřebuje žádný síťový požadavek.
import regularFontUrl from '../assets/fonts/PlusJakartaSans-Regular.ttf?inline';
import boldFontUrl from '../assets/fonts/PlusJakartaSans-Bold.ttf?inline';

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
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  for (const b of bytes) id += chars[b % chars.length];
  return id;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

let fontCache: { regular: Uint8Array; bold: Uint8Array } | null = null;
function fontBytes() {
  fontCache ??= { regular: dataUrlToBytes(regularFontUrl), bold: dataUrlToBytes(boldFontUrl) };
  return fontCache;
}

/** Vykreslí text na střed; pokud je moc široký, zmenší písmo. */
function drawCentered(
  page: PDFPage,
  text: string,
  opts: { y: number; size: number; font: PDFFont; color: ReturnType<typeof rgb>; maxWidth: number; minSize?: number },
): { width: number; size: number } {
  let size = opts.size;
  const minSize = opts.minSize ?? 10;
  while (size > minSize && opts.font.widthOfTextAtSize(text, size) > opts.maxWidth) size -= 1;
  const width = opts.font.widthOfTextAtSize(text, size);
  const x = (page.getWidth() - width) / 2;
  page.drawText(text, { x, y: opts.y, size, font: opts.font, color: opts.color });
  return { width, size };
}

/** Vektorový QR kód (ostrý při tisku, bez PNG a Node závislostí). */
function drawQrCode(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; color: ReturnType<typeof rgb> },
): void {
  const { modules } = createQr(text, { errorCorrectionLevel: 'M' });
  const quiet = 2;
  const cell = opts.size / (modules.size + quiet * 2);
  page.drawRectangle({ x: opts.x, y: opts.y, width: opts.size, height: opts.size, color: rgb(1, 1, 1) });
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (!modules.get(row, col)) continue;
      page.drawRectangle({
        x: opts.x + (col + quiet) * cell,
        y: opts.y + opts.size - (row + quiet + 1) * cell,
        width: cell,
        height: cell,
        color: opts.color,
      });
    }
  }
}

export async function generateCertificatePdf(params: CertificateParams): Promise<Uint8Array> {
  const { userName, courseTitle, score, issuedAt, publicId, appUrl } = params;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  pdfDoc.setTitle(`Certifikát – ${courseTitle}`);
  pdfDoc.setAuthor('Škola AI');

  const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
  const { width, height } = page.getSize();

  const fonts = fontBytes();
  const fontBold = await pdfDoc.embedFont(fonts.bold, { subset: true });
  const fontReg = await pdfDoc.embedFont(fonts.regular, { subset: true });

  const navy = rgb(0.1, 0.2, 0.5);
  const gold = rgb(0.7, 0.55, 0.1);
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.75, 0.75, 0.75);
  const maxWidth = width - 200;

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.98, 1) });

  const m = 30;
  page.drawRectangle({ x: m, y: m, width: width - 2 * m, height: height - 2 * m, borderColor: navy, borderWidth: 3 });
  page.drawRectangle({ x: m + 8, y: m + 8, width: width - 2 * (m + 8), height: height - 2 * (m + 8), borderColor: gold, borderWidth: 1 });

  drawCentered(page, 'CERTIFIKÁT O ABSOLVOVÁNÍ', { y: height - 120, size: 28, font: fontBold, color: navy, maxWidth });
  drawCentered(page, 'Škola AI', { y: height - 150, size: 16, font: fontReg, color: gold, maxWidth });
  page.drawLine({ start: { x: 100, y: height - 165 }, end: { x: width - 100, y: height - 165 }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });

  drawCentered(page, 'Tímto se potvrzuje, že', { y: height - 200, size: 14, font: fontReg, color: gray, maxWidth });

  const name = drawCentered(page, userName, { y: height - 260, size: 36, font: fontBold, color: navy, maxWidth, minSize: 16 });
  page.drawLine({
    start: { x: (width - name.width) / 2, y: height - 268 },
    end: { x: (width + name.width) / 2, y: height - 268 },
    thickness: 1,
    color: navy,
  });

  drawCentered(page, 'úspěšně absolvoval/a kurz', { y: height - 300, size: 14, font: fontReg, color: gray, maxWidth });
  drawCentered(page, courseTitle, { y: height - 338, size: 24, font: fontBold, color: navy, maxWidth, minSize: 12 });
  drawCentered(page, `Výsledek testu: ${score} %`, { y: height - 368, size: 13, font: fontReg, color: gray, maxWidth });

  const dateFormatted = new Date(issuedAt).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague',
  });
  drawCentered(page, `Vydáno: ${dateFormatted}`, { y: height - 392, size: 12, font: fontReg, color: gray, maxWidth });

  const verifyUrl = `${appUrl}/certifikat/${publicId}`;
  const qrSize = 90;
  drawQrCode(page, verifyUrl, { x: width - m - 8 - qrSize - 10, y: m + 30, size: qrSize, color: rgb(0, 0, 0) });
  page.drawText('Ověřit certifikát', { x: width - m - 8 - qrSize - 10, y: m + 20, size: 9, font: fontReg, color: gray });
  page.drawText(`ID: ${publicId}`, { x: m + 20, y: m + 20, size: 9, font: fontReg, color: lightGray });

  return pdfDoc.save();
}

/**
 * Vydá (nebo nahradí) certifikát k zápisu.
 * Nový certifikát se nejdřív vygeneruje a uloží; teprve pak se v jedné D1 dávce
 * vymění záznam a nakonec smaže staré PDF. Selhání generování tak nesmaže ten původní.
 */
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

  const oldCert = await getOne<{ id: string; pdf_r2_key: string }>(
    db, `SELECT id, pdf_r2_key FROM certificates WHERE enrollment_id = ?`, enrollmentId,
  );

  const statements = [];
  if (oldCert) statements.push(db.prepare(`DELETE FROM certificates WHERE id = ?`).bind(oldCert.id));
  statements.push(
    db.prepare(`INSERT INTO certificates (id, enrollment_id, public_id, issued_at, pdf_r2_key) VALUES (?, ?, ?, ?, ?)`)
      .bind(generateId(), enrollmentId, publicId, issuedAt, pdfKey),
    db.prepare(`UPDATE enrollments SET score = ? WHERE id = ?`).bind(score, enrollmentId),
  );
  await db.batch(statements);

  if (oldCert) {
    try {
      await bucket.delete(oldCert.pdf_r2_key);
    } catch (err) {
      console.error(`R2 delete failed for ${oldCert.pdf_r2_key}:`, err);
    }
  }

  return { publicId, pdfKey };
}
