/**
 * Twin magic-link tokens: stateless HMAC-SHA256 over `twin.<b64url(email)>.<exp>`,
 * mirroring adminAuth so the same Web Crypto code runs in Edge and Node. No DB
 * table (zero-migration v1); expiry is the only revocation, so links stay short
 * (24h) — see docs/digital-twin-product-map.md.
 */

const MARKER = 'twin';
export const TWIN_LINK_TTL_MS = 24 * 60 * 60 * 1000;

function secret(): string | null {
  return process.env.TWIN_LINK_SECRET || process.env.ADMIN_SESSION_SECRET || null;
}

function keyData(s: string): ArrayBuffer {
  const b = new TextEncoder().encode(s);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

async function importKey(s: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', keyData(s), { name: 'HMAC', hash: 'SHA-256' }, false, [
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

function b64url(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64url');
}

function fromB64url(text: string): string | null {
  try {
    return Buffer.from(text, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

/** Returns null when no signing secret is configured (feature off). */
export async function signTwinToken(email: string, now = Date.now()): Promise<string | null> {
  const s = secret();
  if (!s) return null;
  const payload = `${MARKER}.${b64url(email.trim().toLowerCase())}.${now + TWIN_LINK_TTL_MS}`;
  const key = await importKey(s);
  const sig = await crypto.subtle.sign('HMAC', key, bytes(payload));
  return `${payload}.${toHex(sig)}`;
}

/** Verifies signature + expiry; returns the email or null. */
export async function verifyTwinToken(token: string, now = Date.now()): Promise<string | null> {
  const s = secret();
  if (!s || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== MARKER) return null;
  const [, emailB64, expStr, sigHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now) return null;
  const payload = `${MARKER}.${emailB64}.${expStr}`;
  const key = await importKey(s);
  const expected = toHex(await crypto.subtle.sign('HMAC', key, bytes(payload)));
  if (expected.length !== sigHex.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sigHex.charCodeAt(i);
  if (diff !== 0) return null;
  return fromB64url(emailB64);
}
