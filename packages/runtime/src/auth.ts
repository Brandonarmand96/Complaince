import { createHash, randomBytes, randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { SignJWT, jwtVerify, errors as joseErrors } from 'jose';
import type { Database } from './database.js';
import { transaction } from './database.js';
import { BUILT_IN_ROLES, PERMISSIONS, ROLE_PERMISSION_MATRIX } from './roles.js';

export interface AuthConfig {
  accessSecret: string;
  issuer: string;
  audience: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
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

export function authStore(db: Database, config: AuthConfig) {
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
      const result = await db.query('SELECT "id", "normalizedEmail" AS "email", "displayName", "passwordHash" FROM "User" WHERE "normalizedEmail" = $1', [normalizeEmail(input.email)]);
      const user = result.rows[0];
      if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, input.password))) throw new InvalidCredentials();
      return transaction(db, client => createSession(client, { id: user.id, email: user.email, displayName: user.displayName }, context));
    },
    async refresh(secret: string) {
      const outcome = await transaction(db, async client => {
        const result = await client.query('SELECT t."id", t."familyId", t."usedAt", t."revokedAt", t."expiresAt", f."revokedAt" AS "familyRevokedAt", f."expiresAt" AS "familyExpiresAt", u."id" AS "userId", u."normalizedEmail" AS "email", u."displayName" FROM "RefreshToken" t JOIN "RefreshTokenFamily" f ON f."id" = t."familyId" JOIN "User" u ON u."id" = f."userId" WHERE t."tokenHash" = $1 FOR UPDATE OF t, f', [refreshHash(secret)]);
        const token = result.rows[0];
        if (!token) throw new InvalidRefreshToken();
        if (token.usedAt || token.revokedAt || token.familyRevokedAt) {
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
      await db.query('UPDATE "RefreshTokenFamily" SET "lastSeenAt" = NOW() WHERE "id" = $1 AND "userId" = $2 AND "revokedAt" IS NULL', [sessionId, userId]);
      const user = await db.query('SELECT "id", "normalizedEmail" AS "email", "displayName" FROM "User" WHERE "id" = $1', [userId]);
      if (!user.rowCount) throw new InvalidCredentials();
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
  };
}
