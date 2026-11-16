import type { APIRoute } from 'astro';
import { cancelEnrollmentByToken } from '@lib/unsubscribe-action';

/**
 * Odhlášení jedním kliknutím (RFC 8058) – na tuto adresu posílá POST přímo poštovní
 * klient (Gmail, Yahoo…) podle hlavičky List-Unsubscribe. Proto je vyjmuté z kontroly Origin.
 */
export const POST: APIRoute = async ({ params }) => {
  const result = await cancelEnrollmentByToken(params.token ?? '');
  return new Response(result === 'invalid' ? 'Invalid token' : 'OK', { status: result === 'invalid' ? 400 : 200 });
};
