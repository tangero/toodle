import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { env } from '@lib/env';

/**
 * Bootstrap endpoint pro vytvoření prvního admina na čerstvém nasazení.
 * 
 * Bezpečnost:
 * - Funguje POUZE pokud v databázi zatím neexistuje žádný uživatel.
 * - Nebo pokud je v těle poslán správný BOOTSTRAP_SECRET (jednorázově).
 * 
 * Použití (první spuštění):
 *   curl -X POST https://tvuj-web/api/admin/bootstrap \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"patrick@zandl.cz","name":"Patrick Zandl","bootstrapSecret":"tvuj-jednorazovy-secret"}'
 */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const { email, name, bootstrapSecret } = body as Record<string, string>;

  if (!email || !name) {
    return json({ error: 'email a name jsou povinné' }, 400);
  }

  // Kontrola, jestli už nějaký uživatel existuje
  const existingUser = await getOne<{ id: string }>(
    env.DB,
    `SELECT id FROM users LIMIT 1`
  );

  const isFirstUser = !existingUser;

  // Pokud nejsme první uživatel, vyžadujeme bootstrapSecret shodný s CRON_SECRET
  // (nebo speciální BOOTSTRAP_SECRET – pro jednoduchost používáme CRON_SECRET)
  if (!isFirstUser) {
    const provided = bootstrapSecret || request.headers.get('X-Bootstrap-Secret');
    if (provided !== env.CRON_SECRET) {
      return json({ error: 'Bootstrap již není povolen (existují uživatelé)' }, 403);
    }
  }

  const id = generateId();
  const now = new Date().toISOString();

  await run(
    env.DB,
    `INSERT INTO users (id, email, name, verified_at, created_at) 
     VALUES (?, ?, ?, ?, ?)`,
    id,
    email.toLowerCase(),
    name,
    now,
    now
  );

  return json({
    ok: true,
    message: isFirstUser 
      ? 'První admin účet vytvořen. Nyní se můžeš přihlásit přes magic link.'
      : 'Admin účet vytvořen (bootstrap secret byl použit).',
    userId: id,
    email: email.toLowerCase(),
  });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
