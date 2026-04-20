import type { APIRoute } from 'astro';
import { getAll } from '@lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const baseUrl = env.APP_URL ?? 'https://skola.aivefirmach.cz';

  const courses = await getAll<{ slug: string }>(
    env.DB,
    `SELECT slug FROM courses WHERE status = 'published' ORDER BY created_at DESC`,
  );

  const staticPages = ['', '/prihlaseni'];
  const coursePages = courses.map((c) => `/kurz/${c.slug}`);
  const allPages = [...staticPages, ...coursePages];

  const urls = allPages
    .map((path) => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>${path === '' ? 'daily' : 'weekly'}</changefreq>
  </url>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
