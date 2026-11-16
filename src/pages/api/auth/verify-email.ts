import type { APIRoute } from 'astro';

/** Zpětná kompatibilita pro odkazy z dříve odeslaných e-mailů – vše řeší potvrzovací stránka. */
export const GET: APIRoute = async ({ url, redirect }) => {
  const token = url.searchParams.get('token') ?? '';
  return redirect(`/prihlaseni/potvrzeni?typ=zapis&token=${encodeURIComponent(token)}`, 302);
};
