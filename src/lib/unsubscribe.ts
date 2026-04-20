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
  if (dot === -1) return null;
  const enrollmentId = token.slice(0, dot);
  const expected = await createUnsubscribeToken(enrollmentId, jwtSecret);
  return expected === token ? enrollmentId : null;
}
