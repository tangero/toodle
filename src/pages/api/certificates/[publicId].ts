import type { APIRoute } from 'astro';
import { getOne } from '@lib/db';
import { env } from "@lib/env";

export const GET: APIRoute = async ({ params }) => {

  const { publicId } = params;

  const cert = await getOne<{ pdf_r2_key: string }>(
    env.DB, `SELECT pdf_r2_key FROM certificates WHERE public_id = ?`, publicId,
  );
  if (!cert) return new Response('Certifikát nenalezen', { status: 404 });

  const object = await env.BUCKET.get(cert.pdf_r2_key);
  if (!object) return new Response('PDF nenalezeno', { status: 404 });

  const pdfBytes = await object.arrayBuffer();
  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="certifikat-${publicId}.pdf"`,
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
