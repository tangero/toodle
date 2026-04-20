import type { APIRoute } from 'astro';
import { clearSessionCookie } from '@lib/auth';

export const POST: APIRoute = async ({ redirect }) => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': clearSessionCookie(),
    },
  });
};
