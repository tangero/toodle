import type { APIRoute } from 'astro';
import { generateId } from '@lib/db';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return json({ error: 'Očekáván multipart/form-data' }, 400);
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return json({ error: 'Soubor nebyl nahrán' }, 400);

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return json({ error: `Nepodporovaný typ: ${file.type}` }, 400);
  if (file.size > MAX_SIZE) return json({ error: 'Soubor je příliš velký (max 5 MB)' }, 400);

  const key = `images/${generateId()}.${ext}`;
  const bytes = await file.arrayBuffer();

  await env.BUCKET.put(key, bytes, {
    httpMetadata: { contentType: file.type },
  });

  const url = `/api/images/${key}`;
  return json({ ok: true, url, key });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
