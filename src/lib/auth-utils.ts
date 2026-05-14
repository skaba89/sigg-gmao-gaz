// ============================================================
// Auth Utility - Password hashing & token generation
// For now using simple approach; JWT will be added later
// ============================================================

import { createHash, randomBytes, pbkdf2Sync } from 'crypto';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'sigg-gmao-dev-secret';
const SALT_LENGTH = 16;
const ITERATIONS = 10000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const computedHash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return hash === computedHash;
}

export function generateToken(payload: { userId: string; email: string; role: string }): string {
  // Simple base64 token for now - will be replaced with JWT
  const data = { ...payload, iat: Date.now(), exp: Date.now() + 24 * 60 * 60 * 1000 };
  const signature = createHash('sha256').update(JSON.stringify(data) + TOKEN_SECRET).digest('hex').substring(0, 16);
  return Buffer.from(JSON.stringify({ ...data, sig: signature })).toString('base64');
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString());
    if (data.exp < Date.now()) return null;
    // Verify signature
    const { sig, ...payload } = data;
    const expectedSig = createHash('sha256').update(JSON.stringify(payload) + TOKEN_SECRET).digest('hex').substring(0, 16);
    if (sig !== expectedSig) return null;
    return { userId: data.userId, email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export function getTokenFromHeaders(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

export function getAuthenticatedUser(request: Request): { userId: string; email: string; role: string } | null {
  const token = getTokenFromHeaders(request);
  if (!token) return null;
  return verifyToken(token);
}
