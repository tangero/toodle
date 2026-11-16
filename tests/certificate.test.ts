import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { generateCertificatePdf } from '../src/lib/certificate';

describe('generateCertificatePdf', () => {
  it('vygeneruje PDF s českými znaky (dříve padalo na WinAnsi „ě“)', async () => {
    const bytes = await generateCertificatePdf({
      userName: 'Jiří Kočvara-Šťastný Žluťoučký',
      courseTitle: 'Začínáme s ChatGPT – úvod do práce s umělou inteligencí pro úplné začátečníky',
      score: 87,
      issuedAt: '2026-11-12T10:00:00.000Z',
      publicId: 'abc23def45',
      appUrl: 'https://skola.aivefirmach.cz',
    });
    expect(bytes.byteLength).toBeGreaterThan(5_000);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    // Fonty se vkládají jako podmnožina, PDF má zůstat malé.
    expect(bytes.byteLength).toBeLessThan(200_000);
  });
});
