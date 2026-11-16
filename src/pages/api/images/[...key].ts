import type { APIRoute } from 'astro';
import { env } from '@lib/env';

/** Obrázky lekcí z R2. Zpřístupněn je jen prefix images/ (ne certifikáty ani jiné soubory). */
export const GET: APIRoute = async ({ params }) => {
  const key = params.key;
  if (!key || !key.startsWith('images/') || key.includes('..')) return new Response('Not found', { status: 404 });

  const object = await env.BUCKET.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const contentType = object.httpMetadata?.contentType ?? 'application/octet-stream';
  const headers = new Headers();
  headers.set('Content-Type', contentType.startsWith('image/') && contentType !== 'image/svg+xml' ? contentType : 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");

  return new Response(object.body as unknown as ReadableStream, { headers });
};
