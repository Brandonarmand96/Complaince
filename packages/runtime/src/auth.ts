import { createHash, randomBytes, randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { SignJWT, jwtVerify, errors as joseErrors } from 'jose';
import type { Database } from './database.js';
import { transaction } from './database.js';
import { BUILT_IN_ROLES, PERMISSIONS, ROLE_PERMISSION_MATRIX } from './roles.js';
import type { Mailer } from './mail.js';

export interface AuthConfig {
  accessSecret: string;
  issuer: string;
  audience: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
  inactivityTimeoutSeconds?: number;
  lockoutAttempts?: number;
  lockoutSeconds?: number;
}
export interface AccessIdentity { userId: string; tokenId: string; sessionId: string }
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; displayName: string | null };
}
export class InvalidCredentials extends Error {}
export class EmailAlreadyRegistered extends Error {}
export class InvalidRefreshToken extends Error {}
export class AccountUnavailable extends Error {}
export class InvalidVerificationToken extends Error {}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}
export async function verifyPassword(hash: string, password: string) {
  try { return await argon2.verify(hash, password); } catch { return false; }
}
const secretKey = (secret: string) => new TextEncoder().encode(secret);
export async function issueAccessToken(config: AuthConfig, userId: string, sessionId = randomUUID()) {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId).setJti(randomUUID()).setIssuer(config.issuer).setAudience(config.audience)
    .setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1000) + config.accessTtlSeconds)
    .sign(secretKey(config.accessSecret));
}
export async function verifyAccessToken(config: AuthConfig, token: string): Promise<AccessIdentity> {
  try {
    const { payload } = await jwtVerify(token, secretKey(config.accessSecret), { algorithms: ['HS256'], issuer: config.issuer, audience: config.audience });
    if (!payload.sub || !payload.jti || typeof payload.sid !== 'string') throw new InvalidCredentials();
    return { userId: payload.sub, tokenId: payload.jti, sessionId: payload.sid };
  } catch (error) {
    if (error instanceof joseErrors.JOSEError || error instanceof InvalidCredentials) throw new InvalidCredentials();
    throw error;
  }
}
const newRefreshSecret = () => randomBytes(32).toString('base64url');
const refreshHash = (secret: string) => createHash('sha256').update(secret).digest('hex');

export function authStore(db: Database, config: AuthConfig, options: { mailer?: Mailer; webOrigin?: string } = {}) {
  const contextValues = (context?: { ipAddress?: string; userAgent?: string }) => [context?.ipAddress ?? null, context?.userAgent ?? null];
  const loginHistory = (client: import('pg').PoolClient, userId: string | null, email: string, outcome: string, context?: { ipAddress?: string; userAgent?: string }) => client.query('INSERT INTO "LoginHistory" ("id", "userId", "normalizedEmail", "outcome", "ipAddress", "userAgent") VALUES ($1, $2, $3, $4, $5, $6)', [randomUUID(), userId, email, outcome, ...contextValues(context)]);
  async function seedRoles(client: import('pg').PoolClient, organizationId: string) {
    const permissionIds = new Map<string, string>();
    for (const key of PERMISSIONS) {
      const id = randomUUID();
      const result = await client.query('INSERT INTO "Permission" ("id", "key") VALUES ($1, $2) ON CONFLICT ("key") DO UPDATE SET "key" = EXCLUDED."key" RETURNING "id"', [id, key]);
      permissionIds.set(key, result.rows[0].id);
    }
    const roleIds = new Map<string, string>();
    for (const name of BUILT_IN_ROLES) {
      const roleId = randomUUID();
      await client.query('INSERT INTO "Role" ("id", "organizationId", "name", "isSystem") VALUES ($1, $2, $3, TRUE)', [roleId, organizationId, name]);
      roleIds.set(name, roleId);
      for (const key of ROLE_PERMISSION_MATRIX[name]) await client.query('INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES ($1, $2)', [roleId, permissionIds.get(key)]);
    }
    return roleIds;
  }
  async function createSession(client: import('pg').PoolClient, user: { id: string; email: string; displayName: string | null }, context?: { ipAddress?: string; userAgent?: string }): Promise<AuthResult> {
    const familyId = randomUUID();
    const tokenId = randomUUID();
    const refreshToken = newRefreshSecret();
    const expiresAt = new Date(Date.now() + config.refreshTtlSeconds * 1000);
    await client.query('INSERT INTO "RefreshTokenFamily" ("id", "userId", "expiresAt", "ipAddress", "userAgent") VALUES ($1, $2, $3, $4, $5)', [familyId, user.id, expiresAt, context?.ipAddress ?? null, context?.userAgent ?? null]);
    await client.query('INSERT INTO "RefreshToken" ("id", "familyId", "tokenHash", "expiresAt") VALUES ($1, $2, $3, $4)', [tokenId, familyId, refreshHash(refreshToken), expiresAt]);
    return { accessToken: await issueAccessToken(config, user.id, familyId), refreshToken, expiresIn: config.accessTtlSeconds, user };
  }
  return {
    async register(input: { email: string; password: string; displayName: string; organizationName: string }, context?: { ipAddress?: string; userAgent?: string }) {
      const passwordHash = await hashPassword(input.password);
      try {
        return await transaction(db, async client => {
          const userId = randomUUID();
          const organizationId = randomUUID();
          const membershipId = randomUUID();
          const userResult = await client.query('INSERT INTO "User" ("id", "email", "displayName", "passwordHash") VALUES ($1, $2, $3, $4) RETURNING "id", "normalizedEmail" AS "email", "displayName"', [userId, input.email, input.displayName.trim(), passwordHash]);
          await client.query('INSERT INTO "Organization" ("id", "name") VALUES ($1, $2)', [organizationId, input.organizationName.trim()]);
          await client.query('INSERT INTO "OrganizationMembership" ("id", "organizationId", "userId") VALUES ($1, $2, $3)', [membershipId, organizationId, userId]);
          const roles = await seedRoles(client, organizationId);
          await client.query('INSERT INTO "MembershipRole" ("membershipId", "roleId", "organizationId") VALUES ($1, $2, $3)', [membershipId, roles.get('Organization Owner'), organizationId]);
          return createSession(client, userResult.rows[0], context);
        });
      } catch (error) {
        if ((error as { code?: string }).code === '23505') throw new EmailAlreadyRegistered();
        throw error;
      }
    },
    async login(input: { email: string; password: string }, context?: { ipAddress?: string; userAgent?: string }) {
      const email = normalizeEmail(input.email);
      const result = await db.query('SELECT "id", "normalizedEmail" AS "email", "displayName", "passwordHash", "status", "failedLoginCount", "lockedUntil" FROM "User" WHERE "normalizedEmail" = $1', [email]);
      const user = result.rows[0];
      if (!user?.passwordHash) { await transaction(db, client => loginHistory(client, null, email, 'INVALID_CREDENTIALS', context)); throw new InvalidCredentials(); }
      if (user.status !== 'ACTIVE') { await transaction(db, client => loginHistory(client, user.id, email, 'ACCOUNT_DISABLED', context)); throw new AccountUnavailable(); }
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) { await transaction(db, client => loginHistory(client, user.id, email, 'LOCKED', context)); throw new AccountUnavailable(); }
      if (!(await verifyPassword(user.passwordHash, input.password))) {
        await transaction(db, async client => {
          const attempts = Number(user.failedLoginCount) + 1;
          await client.query('UPDATE "User" SET "failedLoginCount" = $2::INTEGER, "lockedUntil" = CASE WHEN $2::INTEGER >= $3::INTEGER THEN NOW() + ($4::INTEGER * INTERVAL \'1 second\') ELSE NULL END WHERE "id" = $1', [user.id, attempts, config.lockoutAttempts ?? 5, config.lockoutSeconds ?? 900]);
          await loginHistory(client, user.id, email, 'INVALID_CREDENTIALS', context);
        });
        throw new InvalidCredentials();
      }
      return transaction(db, async client => {
        const previous = await client.query('SELECT 1 FROM "LoginHistory" WHERE "userId" = $1 AND "outcome" = \'SUCCESS\' LIMIT 1', [user.id]);
        const knownDevice = await client.query('SELECT 1 FROM "LoginHistory" WHERE "userId" = $1 AND "outcome" = \'SUCCESS\' AND "ipAddress" IS NOT DISTINCT FROM $2 AND "userAgent" IS NOT DISTINCT FROM $3 LIMIT 1', [user.id, ...contextValues(context)]);
        await client.query('UPDATE "User" SET "failedLoginCount" = 0, "lockedUntil" = NULL WHERE "id" = $1', [user.id]);
        await loginHistory(client, user.id, email, 'SUCCESS', context);
        if (previous.rowCount && !knownDevice.rowCount) await client.query('INSERT INTO "SecurityEvent" ("id", "userId", "type", "ipAddress", "userAgent") VALUES ($1, $2, \'NEW_DEVICE_LOGIN\', $3, $4)', [randomUUID(), user.id, ...contextValues(context)]);
        return createSession(client, { id: user.id, email: user.email, displayName: user.displayName }, context);
      });
    },
    async refresh(secret: string) {
      const outcome = await transaction(db, async client => {
        const result = await client.query('SELECT t."id", t."familyId", t."usedAt", t."revokedAt", t."expiresAt", f."revokedAt" AS "familyRevokedAt", f."expiresAt" AS "familyExpiresAt", f."lastSeenAt", u."id" AS "userId", u."normalizedEmail" AS "email", u."displayName", u."status" FROM "RefreshToken" t JOIN "RefreshTokenFamily" f ON f."id" = t."familyId" JOIN "User" u ON u."id" = f."userId" WHERE t."tokenHash" = $1 FOR UPDATE OF t, f', [refreshHash(secret)]);
        const token = result.rows[0];
        if (!token) throw new InvalidRefreshToken();
        const inactive = new Date(token.lastSeenAt).getTime() < Date.now() - (config.inactivityTimeoutSeconds ?? 1800) * 1000;
        if (token.usedAt || token.revokedAt || token.familyRevokedAt || token.status !== 'ACTIVE' || inactive) {
          await client.query('UPDATE "RefreshTokenFamily" SET "revokedAt" = COALESCE("revokedAt", NOW()) WHERE "id" = $1', [token.familyId]);
          await client.query('UPDATE "RefreshToken" SET "revokedAt" = COALESCE("revokedAt", NOW()) WHERE "familyId" = $1', [token.familyId]);
          return { replayed: true } as const;
        }
        if (new Date(token.expiresAt) <= new Date() || new Date(token.familyExpiresAt) <= new Date()) throw new InvalidRefreshToken();
        await client.query('UPDATE "RefreshToken" SET "usedAt" = NOW() WHERE "id" = $1', [token.id]);
        const nextSecret = newRefreshSecret();
        await client.query('INSERT INTO "RefreshToken" ("id", "familyId", "tokenHash", "expiresAt") VALUES ($1, $2, $3, $4)', [randomUUID(), token.familyId, refreshHash(nextSecret), token.familyExpiresAt]);
        await client.query('UPDATE "RefreshTokenFamily" SET "lastSeenAt" = NOW() WHERE "id" = $1', [token.familyId]);
        return { replayed: false, result: { accessToken: await issueAccessToken(config, token.userId, token.familyId), refreshToken: nextSecret, expiresIn: config.accessTtlSeconds, user: { id: token.userId, email: token.email, displayName: token.displayName } } satisfies AuthResult } as const;
      });
      if (outcome.replayed) throw new InvalidRefreshToken();
      return outcome.result;
    },
    async logout(secret: string) {
      await db.query('UPDATE "RefreshTokenFamily" f SET "revokedAt" = COALESCE(f."revokedAt", NOW()) FROM "RefreshToken" t WHERE t."familyId" = f."id" AND t."tokenHash" = $1', [refreshHash(secret)]);
    },
    async me(userId: string, sessionId: string) {
      await this.validateAccess(userId, sessionId);
      await db.query('UPDATE "RefreshTokenFamily" SET "lastSeenAt" = NOW() WHERE "id" = $1 AND "userId" = $2', [sessionId, userId]);
      const user = await db.query('SELECT "id", "normalizedEmail" AS "email", "displayName", "emailVerifiedAt" FROM "User" WHERE "id" = $1', [userId]);
      const memberships = await db.query('SELECT m."id", m."organizationId", o."name" AS "organizationName", m."status", COALESCE(array_agg(r."name") FILTER (WHERE r."id" IS NOT NULL), ARRAY[]::TEXT[]) AS roles FROM "OrganizationMembership" m JOIN "Organization" o ON o."id" = m."organizationId" LEFT JOIN "MembershipRole" mr ON mr."membershipId" = m."id" LEFT JOIN "Role" r ON r."id" = mr."roleId" WHERE m."userId" = $1 GROUP BY m."id", o."name" ORDER BY o."name"', [userId]);
      return { ...user.rows[0], memberships: memberships.rows };
    },
    async sessions(userId: string) {
      const result = await db.query('SELECT "id", "ipAddress", "userAgent", "createdAt", "lastSeenAt", "expiresAt" FROM "RefreshTokenFamily" WHERE "userId" = $1 AND "revokedAt" IS NULL AND "expiresAt" > NOW() ORDER BY "lastSeenAt" DESC', [userId]);
      return result.rows;
    },
    async revokeSession(userId: string, sessionId: string) {
      const result = await db.query('UPDATE "RefreshTokenFamily" SET "revokedAt" = COALESCE("revokedAt", NOW()) WHERE "id" = $1 AND "userId" = $2 AND "revokedAt" IS NULL RETURNING "id"', [sessionId, userId]);
      return result.rowCount === 1;
    },
    async validateAccess(userId: string, sessionId: string) {
      const result = await db.query('SELECT 1 FROM "User" u JOIN "RefreshTokenFamily" f ON f."userId" = u."id" WHERE u."id" = $1 AND f."id" = $2 AND u."status" = \'ACTIVE\' AND f."revokedAt" IS NULL AND f."expiresAt" > NOW() AND f."lastSeenAt" > NOW() - ($3 * INTERVAL \'1 second\')', [userId, sessionId, config.inactivityTimeoutSeconds ?? 1800]);
      if (!result.rowCount) throw new InvalidCredentials();
    },
    async requestEmailVerification(emailInput: string) {
      const email = normalizeEmail(emailInput);
      const user = await db.query('SELECT "id", "emailVerifiedAt" FROM "User" WHERE "normalizedEmail" = $1', [email]);
      if (!user.rowCount || user.rows[0].emailVerifiedAt) return;
      const secret = randomBytes(32).toString('base64url');
      await transaction(db, async client => {
        await client.query('UPDATE "EmailVerificationToken" SET "consumedAt" = COALESCE("consumedAt", NOW()) WHERE "userId" = $1 AND "consumedAt" IS NULL', [user.rows[0].id]);
        await client.query('INSERT INTO "EmailVerificationToken" ("id", "userId", "tokenHash", "expiresAt") VALUES ($1, $2, $3, NOW() + INTERVAL \'24 hours\')', [randomUUID(), user.rows[0].id, refreshHash(secret)]);
      });
      await options.mailer?.send({ to: email, subject: 'Verify your ComplyOS email', text: `${options.webOrigin ?? 'http://127.0.0.1:5173'}/verify-email?token=${encodeURIComponent(secret)}` });
    },
    async consumeEmailVerification(secret: string) {
      return transaction(db, async client => {
        const token = await client.query('SELECT "id", "userId", "expiresAt", "consumedAt" FROM "EmailVerificationToken" WHERE "tokenHash" = $1 FOR UPDATE', [refreshHash(secret)]);
        const row = token.rows[0];
        if (!row || row.consumedAt || new Date(row.expiresAt) <= new Date()) throw new InvalidVerificationToken();
        await client.query('UPDATE "EmailVerificationToken" SET "consumedAt" = NOW() WHERE "id" = $1', [row.id]);
        await client.query('UPDATE "User" SET "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW()) WHERE "id" = $1', [row.userId]);
        return { verified: true } as const;
      });
    },
  };
}
