import type { APIRoute } from 'astro';
import { run } from '@lib/db';
import { logAudit } from '@lib/audit';
import { env } from '@lib/env';

/**
 * Přihlášený uživatel si v nastavení účtu zapne nebo vypne nabídky dalšího vzdělávání
 * v e-mailech (users.promo_opt_out_at; NULL = nabídky chce). Formulář z nastavení posílá
 * pole `nabidky` = "ano" | "ne" a po uložení se vrací zpět na nastavení.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return new Response(null, { status: 303, headers: { Location: '/prihlaseni' } });

  const form = await request.formData().catch(() => null);
  const choice = String(form?.get('nabidky') ?? '');
  if (choice !== 'ano' && choice !== 'ne') {
    return new Response(null, { status: 303, headers: { Location: '/profil/nastaveni' } });
  }

  if (choice === 'ano') {
    await run(env.DB, `UPDATE users SET promo_opt_out_at = NULL WHERE id = ?`, user.id);
  } else {
    await run(
      env.DB,
      `UPDATE users SET promo_opt_out_at = COALESCE(promo_opt_out_at, datetime('now')) WHERE id = ?`,
      user.id,
    );
  }
  await logAudit(env.DB, user.id, 'user.promo', user.id, { enabled: choice === 'ano' });
  return new Response(null, { status: 303, headers: { Location: '/profil/nastaveni?nabidky=ulozeno' } });
};
