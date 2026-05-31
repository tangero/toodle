import type { APIRoute } from 'astro';
import { env } from "@lib/env";

export const GET: APIRoute = async ({ params }) => {

  const key = params.key;
  if (!key) return new Response('Not found', { status: 404 });

  const object = await env.BUCKET.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType ?? 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body as unknown as ReadableStream, { headers });
};
