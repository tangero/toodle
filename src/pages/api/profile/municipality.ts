import type { APIRoute } from 'astro';
import { run } from '@lib/db';
import { logAudit } from '@lib/audit';
import { env } from '@lib/env';
import { getMunicipality, parseMunicipalityCode } from '@lib/municipalities';

/**
 * Přihlášený uživatel si v nastavení účtu nastaví nebo smaže obec, kde žije (users.municipality_code).
 * Formulář posílá `municipality_code` (prázdné = smazat) a po uložení se vrací na nastavení.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return new Response(null, { status: 303, headers: { Location: '/prihlaseni' } });

  const form = await request.formData().catch(() => null);
  const raw = String(form?.get('municipality_code') ?? '').trim();
  // Obec z dřívějšího nepotvrzeného zápisu by potvrzení odkazu jinak vrátilo do profilu.
  const dropPending = () =>
    run(env.DB, `UPDATE enrollments SET pending_municipality_code = NULL WHERE user_id = ? AND status = 'pending'`, user.id);
  const back = (state: string) =>
    new Response(null, { status: 303, headers: { Location: `/profil/nastaveni?obec=${state}#obec` } });

  if (raw === '') {
    await run(env.DB, `UPDATE users SET municipality_code = NULL WHERE id = ?`, user.id);
    await dropPending();
    await logAudit(env.DB, user.id, 'user.municipality', user.id, { code: null });
    return back('smazano');
  }

  const code = parseMunicipalityCode(raw);
  if (code === null || !(await getMunicipality(env.DB, code))) return back('neznama');

  await run(env.DB, `UPDATE users SET municipality_code = ? WHERE id = ?`, code, user.id);
  await dropPending();
  await logAudit(env.DB, user.id, 'user.municipality', user.id, { code });
  return back('ulozeno');
};
