import type { APIRoute } from 'astro';
import { optOutPromoByToken } from '@lib/unsubscribe-action';

/**
 * Odhlášení nabídek jedním kliknutím (RFC 8058) pro e-maily, které nejsou lekcí kurzu
 * (pozvánka k novým kurzům). POST posílá přímo poštovní klient podle hlavičky List-Unsubscribe,
 * proto je pod prefixem /api/unsubscribe/, který middleware pouští bez kontroly Origin.
 */
export const POST: APIRoute = async ({ params }) => {
  const result = await optOutPromoByToken(params.token ?? '');
  return new Response(result === 'invalid' ? 'Invalid token' : 'OK', { status: result === 'invalid' ? 400 : 200 });
};
