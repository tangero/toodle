// HMAC-signed unsubscribe tokens so users can unsubscribe without being logged in
export async function createUnsubscribeToken(enrollmentId: string, jwtSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(enrollmentId));
  const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${enrollmentId}.${sigHex}`;
}

export async function verifyUnsubscribeToken(token: string, jwtSecret: string): Promise<string | null> {
  const dot = token.lastIndexOf('.');
  if (dot <= 0 || token.length > 200) return null;
  const enrollmentId = token.slice(0, dot);
  const expected = await createUnsubscribeToken(enrollmentId, jwtSecret);
  return timingSafeEqual(expected, token) ? enrollmentId : null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
