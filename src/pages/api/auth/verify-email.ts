import type { APIRoute } from 'astro';
import { verifyMagicLink } from '@lib/auth';
import { run } from '@lib/db';

export const GET: APIRoute = async ({ request, locals, redirect }) => {
  const env = locals.runtime.env;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirect('/overeni?status=error');
  }

  const userId = await verifyMagicLink(env.DB, token);
  if (!userId) {
    return redirect('/overeni?status=invalid');
  }

  await run(
    env.DB,
    `UPDATE users SET verified_at = datetime('now') WHERE id = ? AND verified_at IS NULL`,
    userId,
  );

  return redirect('/overeni?status=ok');
};
