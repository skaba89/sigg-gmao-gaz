// ============================================================
// Auth Utility - Secure JWT, RBAC, Token Blacklisting
// SIGG GMAO Platform - Security Hardened
// ============================================================

import jwt from 'jsonwebtoken';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { db } from './db';

// ---- Configuration ----
const JWT_SECRET: string = process.env.JWT_SECRET ?? '';
if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required. Set it in .env');
}

const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';
const SALT_LENGTH = 16;
const ITERATIONS = 10000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

// ---- Types ----
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'DIRECTION_GENERALE'
  | 'RESP_MAINTENANCE'
  | 'RESP_STOCK'
  | 'TECHNICIEN'
  | 'AUDITEUR'
  | 'FINANCE'
  | 'PRESTATAIRE';

// ---- Role Hierarchy (higher index = more permissions) ----
const ROLE_HIERARCHY: Record<UserRole, number> = {
  PRESTATAIRE: 0,
  TECHNICIEN: 1,
  AUDITEUR: 2,
  FINANCE: 3,
  RESP_STOCK: 4,
  RESP_MAINTENANCE: 5,
  DIRECTION_GENERALE: 6,
  SUPER_ADMIN: 7,
};

export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as UserRole] ?? -1;
}

export function hasRole(userRole: string, requiredRoles: UserRole[]): boolean {
  const userLevel = getRoleLevel(userRole);
  return requiredRoles.some(r => getRoleLevel(r) <= userLevel);
}

// ---- Password Hashing ----
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

// ---- JWT Token Management ----
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'sigg-gmao',
    audience: 'sigg-gmao-api',
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sigg-gmao',
      audience: 'sigg-gmao-api',
    }) as unknown as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromHeaders(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

// ---- Token Blacklisting ----
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) return true;

    // If token is already expired, no need to blacklist check
    if (decoded.exp * 1000 < Date.now()) return true;

    const blacklisted = await db.tokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklisted;
  } catch {
    return true;
  }
}

export async function blacklistToken(token: string): Promise<void> {
  try {
    const decoded = jwt.decode(token) as { exp?: number; userId?: string } | null;
    if (!decoded?.exp) return;

    const expiresAt = new Date(decoded.exp * 1000);
    // Only store if not already expired
    if (expiresAt > new Date()) {
      await db.tokenBlacklist.upsert({
        where: { token },
        update: {},
        create: {
          token,
          userId: decoded.userId || 'unknown',
          expiresAt,
        },
      });
    }
  } catch {
    // Silently fail - blacklisting is best-effort
  }
}

// ---- Authenticated User Retrieval ----
export async function getAuthenticatedUser(request: Request): Promise<TokenPayload | null> {
  const token = getTokenFromHeaders(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Check token blacklist
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) return null;

  // Check if user is still active
  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { isActive: true },
    });
    if (!user || !user.isActive) return null;
  } catch {
    return null;
  }

  return payload;
}

// ---- withAuth Higher-Order Function ----
export interface AuthOptions {
  roles?: UserRole[];
  allowSelf?: boolean; // Allow user to access their own resource (e.g., /users/[id] where id = userId)
}

type HandlerFunction = (
  request: Request,
  context: { params: Promise<Record<string, string>> },
  user: TokenPayload
) => Promise<Response>;

export function withAuth(handler: HandlerFunction, options: AuthOptions = {}) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string>> }
  ): Promise<Response> => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return Response.json(
        { error: 'Non authentifié. Token invalide ou manquant.' },
        { status: 401 }
      );
    }

    // RBAC check
    if (options.roles && options.roles.length > 0) {
      const hasPermission = hasRole(user.role, options.roles);

      // allowSelf override: if user is accessing their own resource
      if (!hasPermission && options.allowSelf) {
        const params = await context.params;
        if (params.id === user.userId) {
          // User is accessing their own resource, allow it
        } else {
          return Response.json(
            { error: 'Accès refusé. Permissions insuffisantes.' },
            { status: 403 }
          );
        }
      } else if (!hasPermission) {
        return Response.json(
          { error: 'Accès refusé. Permissions insuffisantes.' },
          { status: 403 }
        );
      }
    }

    return handler(request, context, user);
  };
}

// ---- Cleanup expired blacklisted tokens (call periodically) ----
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await db.tokenBlacklist.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  } catch {
    return 0;
  }
}
