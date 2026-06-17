/**
 * Admin session cookie signing using Web Crypto (HMAC-SHA256), so the same code
 * runs in the Edge middleware and Node routes. The cookie payload is a fixed
 * marker + issued-at; its integrity (not secrecy) is what gates /admin.
 */
const COOKIE = 'gtos_admin';
const MARKER = 'admin';

function keyData(secret: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(secret);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', keyData(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

function bytes(text: string): ArrayBuffer {
  const b = new TextEncoder().encode(text);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signAdminCookie(secret: string): Promise<string> {
  const payload = `${MARKER}.${Date.now()}`;
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, bytes(payload));
  return `${payload}.${toHex(sig)}`;
}

export async function verifyAdminCookie(value: string | undefined, secret: string): Promise<boolean> {
  if (!value) return false;
  const idx = value.lastIndexOf('.');
  if (idx < 0) return false;
  const payload = value.slice(0, idx);
  const sigHex = value.slice(idx + 1);
  if (!payload.startsWith(`${MARKER}.`)) return false;
  const key = await importKey(secret);
  const expected = await crypto.subtle.sign("HMAC", key, bytes(payload));
  const expectedHex = toHex(expected);
  // constant-time compare
  if (expectedHex.length !== sigHex.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedHex.length; i++) diff |= expectedHex.charCodeAt(i) ^ sigHex.charCodeAt(i);
  return diff === 0;
}

/** Constant-time string compare for the password check. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const ADMIN_COOKIE_NAME = COOKIE;
