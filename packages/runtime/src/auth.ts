import { createHash, randomBytes, randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { SignJWT, jwtVerify, errors as joseErrors } from 'jose';
import type { Database } from './database.js';
import { transaction } from './database.js';
import { BUILT_IN_ROLES, PERMISSIONS, ROLE_PERMISSION_MATRIX } from './roles.js';
import type { Mailer } from './mail.js';
import { decryptSecret, verifyTotp } from './mfa.js';
import { enforcePasswordPolicy } from './security.js';

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
export interface MfaRequiredResult { mfaRequired: true; challengeToken: string; expiresIn: number }
export class InvalidCredentials extends Error {}
export class EmailAlreadyRegistered extends Error {}
export class InvalidRefreshToken extends Error {}
export class AccountUnavailable extends Error {}
export class InvalidVerificationToken extends Error {}
export class InvalidPasswordResetToken extends Error {}
export class InvitationForbidden extends Error {}
export class InvalidInvitationToken extends Error {}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}
export async function verifyPassword(hash: string, password: string) {
  try { return await argon2.verify(hash, password); } catch { return false; }
}
const secretKey = (secret: string) => new TextEncoder().encode(secret);
export async function issueAccessToken(config: AuthConfig, userId: string, sessionId: string = randomUUID()) {
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
  async function invitationContext(userId: string, organizationId: string) {
    const membership = await db.query(`SELECT m."id", COALESCE(array_agg(DISTINCT p."key") FILTER (WHERE p."key" IS NOT NULL), ARRAY[]::TEXT[]) AS permissions
      FROM "OrganizationMembership" m
      LEFT JOIN "MembershipRole" mr ON mr."membershipId" = m."id"
      LEFT JOIN "RolePermission" rp ON rp."roleId" = mr."roleId"
      LEFT JOIN "Permission" p ON p."id" = rp."permissionId"
      WHERE m."userId" = $1 AND m."organizationId" = $2 AND m."status" = 'ACTIVE'
      GROUP BY m."id"`, [userId, organizationId]);
    const row = membership.rows[0] as { id: string; permissions: string[] } | undefined;
    if (!row?.permissions.includes('users:manage')) throw new InvitationForbidden();
    const roles = await db.query(`SELECT r."id", r."name", r."description", COALESCE(array_agg(p."key") FILTER (WHERE p."key" IS NOT NULL), ARRAY[]::TEXT[]) AS permissions
      FROM "Role" r LEFT JOIN "RolePermission" rp ON rp."roleId" = r."id" LEFT JOIN "Permission" p ON p."id" = rp."permissionId"
      WHERE r."organizationId" = $1 GROUP BY r."id" ORDER BY r."name"`, [organizationId]);
    return { membershipId: row.id, roles: roles.rows.filter(role => (role.permissions as string[]).every(permission => row.permissions.includes(permission))) as Array<{ id: string; name: string; description: string | null; permissions: string[] }> };
  }
  async function createSession(client: import('pg').PoolClient, user: { id: string; email: string; displayName: string | null }, context?: { ipAddress?: string; userAgent?: string }): Promise<AuthResult> {
    const familyId = randomUUID();
    const tokenId = randomUUID();
    const refreshToken = newRefreshSecret();
    const expiresAt = new Date(Date.now() + config.refreshTtlSeconds * 1000);
    await client.query('INSERT INTO "RefreshTokenFamily" ("id", "userId", "expiresAt", "ipAddress", "userAgent", "activeOrganizationId") VALUES ($1, $2, $3, $4, $5, (SELECT "organizationId" FROM "OrganizationMembership" WHERE "userId" = $2 AND "status" = \'ACTIVE\' ORDER BY "createdAt" LIMIT 1))', [familyId, user.id, expiresAt, context?.ipAddress ?? null, context?.userAgent ?? null]);
    await client.query('INSERT INTO "RefreshToken" ("id", "familyId", "tokenHash", "expiresAt") VALUES ($1, $2, $3, $4)', [tokenId, familyId, refreshHash(refreshToken), expiresAt]);
    return { accessToken: await issueAccessToken(config, user.id, familyId), refreshToken, expiresIn: config.accessTtlSeconds, user };
  }
  return {
    async register(input: { email: string; password: string; displayName: string; organizationName: string }, context?: { ipAddress?: string; userAgent?: string }) {
      await enforcePasswordPolicy(db, input.password);
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
      const enrollment = await db.query('SELECT 1 FROM "MfaEnrollment" WHERE "userId" = $1 AND "status" = \'ACTIVE\'', [user.id]);
      if (enrollment.rowCount) {
        const challengeToken = newRefreshSecret();
        await db.query('INSERT INTO "MfaChallenge" ("id", "userId", "tokenHash", "expiresAt", "ipAddress", "userAgent") VALUES ($1, $2, $3, NOW() + INTERVAL \'5 minutes\', $4, $5)', [randomUUID(), user.id, refreshHash(challengeToken), context?.ipAddress ?? null, context?.userAgent ?? null]);
        return { mfaRequired: true, challengeToken, expiresIn: 300 } satisfies MfaRequiredResult;
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
      const active = await db.query('SELECT "activeOrganizationId" FROM "RefreshTokenFamily" WHERE "id"=$1 AND "userId"=$2', [sessionId, userId]);
      return { ...user.rows[0], activeOrganizationId: active.rows[0]?.activeOrganizationId ?? null, memberships: memberships.rows };
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
    async requestPasswordReset(emailInput: string) {
      const email = normalizeEmail(emailInput);
      const user = await db.query('SELECT "id" FROM "User" WHERE "normalizedEmail" = $1 AND "status" = \'ACTIVE\'', [email]);
      if (!user.rowCount) return;
      const secret = randomBytes(32).toString('base64url');
      await transaction(db, async client => {
        await client.query('UPDATE "PasswordResetToken" SET "consumedAt" = COALESCE("consumedAt", NOW()) WHERE "userId" = $1 AND "consumedAt" IS NULL', [user.rows[0].id]);
        await client.query('INSERT INTO "PasswordResetToken" ("id", "userId", "tokenHash", "expiresAt") VALUES ($1, $2, $3, NOW() + INTERVAL \'1 hour\')', [randomUUID(), user.rows[0].id, refreshHash(secret)]);
      });
      await options.mailer?.send({ to: email, subject: 'Reset your ComplyOS password', text: `${options.webOrigin ?? 'http://127.0.0.1:5173'}/reset-password?token=${encodeURIComponent(secret)}` });
    },
    async completePasswordReset(secret: string, password: string) {
      const resetOwner = await db.query('SELECT t."userId", COALESCE(array_agg(m."organizationId") FILTER (WHERE m."organizationId" IS NOT NULL), ARRAY[]::UUID[]) AS organizations FROM "PasswordResetToken" t LEFT JOIN "OrganizationMembership" m ON m."userId"=t."userId" WHERE t."tokenHash"=$1 GROUP BY t."userId"', [refreshHash(secret)]);
      await enforcePasswordPolicy(db, password, resetOwner.rows[0]?.organizations ?? []);
      const passwordHash = await hashPassword(password);
      return transaction(db, async client => {
        const token = await client.query('SELECT "id", "userId", "expiresAt", "consumedAt" FROM "PasswordResetToken" WHERE "tokenHash" = $1 FOR UPDATE', [refreshHash(secret)]);
        const row = token.rows[0];
        if (!row || row.consumedAt || new Date(row.expiresAt) <= new Date()) throw new InvalidPasswordResetToken();
        await client.query('UPDATE "PasswordResetToken" SET "consumedAt" = NOW() WHERE "id" = $1', [row.id]);
        await client.query('UPDATE "User" SET "passwordHash" = $2, "failedLoginCount" = 0, "lockedUntil" = NULL, "updatedAt" = NOW() WHERE "id" = $1', [row.userId, passwordHash]);
        await client.query('UPDATE "RefreshTokenFamily" SET "revokedAt" = COALESCE("revokedAt", NOW()) WHERE "userId" = $1', [row.userId]);
        return { reset: true } as const;
      });
    },
    async assignableRoles(userId: string, organizationId: string) {
      const context = await invitationContext(userId, organizationId);
      return context.roles.map(({ id, name, description }) => ({ id, name, description }));
    },
    async createInvitation(userId: string, input: { organizationId: string; email: string; roleIds: string[] }) {
      const context = await invitationContext(userId, input.organizationId);
      if (!input.roleIds.length || input.roleIds.some(id => !context.roles.some(role => role.id === id))) throw new InvitationForbidden();
      const secret = randomBytes(32).toString('base64url');
      const invitation = await transaction(db, async client => {
        const id = randomUUID();
        await client.query('INSERT INTO "Invitation" ("id", "organizationId", "email", "tokenHash", "expiresAt", "createdByMembershipId") VALUES ($1, $2, $3, $4, NOW() + INTERVAL \'7 days\', $5)', [id, input.organizationId, input.email, refreshHash(secret), context.membershipId]);
        for (const roleId of [...new Set(input.roleIds)]) await client.query('INSERT INTO "InvitationRole" ("invitationId", "roleId", "organizationId") VALUES ($1, $2, $3)', [id, roleId, input.organizationId]);
        return { id, status: 'PENDING' as const };
      });
      await options.mailer?.send({ to: normalizeEmail(input.email), subject: 'You are invited to ComplyOS', text: `${options.webOrigin ?? 'http://127.0.0.1:5173'}/accept-invitation?token=${encodeURIComponent(secret)}` });
      return invitation;
    },
    async resendInvitation(userId: string, invitationId: string) {
      const invitation = await db.query('SELECT "organizationId", "normalizedEmail" AS email FROM "Invitation" WHERE "id" = $1', [invitationId]);
      if (!invitation.rowCount) throw new InvalidInvitationToken();
      await invitationContext(userId, invitation.rows[0].organizationId);
      const secret = randomBytes(32).toString('base64url');
      const updated = await db.query('UPDATE "Invitation" SET "tokenHash" = $2, "expiresAt" = NOW() + INTERVAL \'7 days\', "status" = \'PENDING\', "updatedAt" = NOW() WHERE "id" = $1 AND "status" = \'PENDING\' RETURNING "id"', [invitationId, refreshHash(secret)]);
      if (!updated.rowCount) throw new InvalidInvitationToken();
      await options.mailer?.send({ to: invitation.rows[0].email, subject: 'Your ComplyOS invitation', text: `${options.webOrigin ?? 'http://127.0.0.1:5173'}/accept-invitation?token=${encodeURIComponent(secret)}` });
      return { resent: true } as const;
    },
    async acceptInvitation(userId: string, secret: string) {
      return transaction(db, async client => {
        const invitation = await client.query('SELECT i."id", i."organizationId", i."normalizedEmail", i."expiresAt", i."status", u."normalizedEmail" AS "userEmail" FROM "Invitation" i CROSS JOIN "User" u WHERE i."tokenHash" = $1 AND u."id" = $2 FOR UPDATE OF i', [refreshHash(secret), userId]);
        const row = invitation.rows[0];
        if (!row || row.status !== 'PENDING' || new Date(row.expiresAt) <= new Date() || row.normalizedEmail !== row.userEmail) throw new InvalidInvitationToken();
        const membershipId = randomUUID();
        const membership = await client.query('INSERT INTO "OrganizationMembership" ("id", "organizationId", "userId") VALUES ($1, $2, $3) ON CONFLICT ("organizationId", "userId") DO UPDATE SET "status" = \'ACTIVE\', "updatedAt" = NOW() RETURNING "id"', [membershipId, row.organizationId, userId]);
        const roles = await client.query('SELECT "roleId" FROM "InvitationRole" WHERE "invitationId" = $1 AND "organizationId" = $2', [row.id, row.organizationId]);
        for (const role of roles.rows) await client.query('INSERT INTO "MembershipRole" ("membershipId", "roleId", "organizationId") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [membership.rows[0].id, role.roleId, row.organizationId]);
        await client.query('UPDATE "Invitation" SET "status" = \'ACCEPTED\', "acceptedAt" = NOW(), "updatedAt" = NOW() WHERE "id" = $1', [row.id]);
        return { accepted: true, organizationId: row.organizationId } as const;
      });
    },
    async invitationDetails(secret: string) {
      const result = await db.query('SELECT i."normalizedEmail" AS email, o."name" AS "organizationName", i."expiresAt", i."status", EXISTS (SELECT 1 FROM "User" u WHERE u."normalizedEmail"=i."normalizedEmail") AS "accountExists" FROM "Invitation" i JOIN "Organization" o ON o."id"=i."organizationId" WHERE i."tokenHash"=$1', [refreshHash(secret)]);
      const row = result.rows[0]; if (!row || row.status !== 'PENDING' || new Date(row.expiresAt) <= new Date()) throw new InvalidInvitationToken();
      return { email: row.email, organizationName: row.organizationName, accountExists: row.accountExists };
    },
    async acceptNewInvitation(secret: string, input: { displayName: string; password: string }, context?: { ipAddress?: string; userAgent?: string }) {
      const preview = await this.invitationDetails(secret); if (preview.accountExists) throw new EmailAlreadyRegistered();
      const invitedOrganization = await db.query('SELECT "organizationId" FROM "Invitation" WHERE "tokenHash"=$1', [refreshHash(secret)]);
      await enforcePasswordPolicy(db, input.password, invitedOrganization.rows[0] ? [invitedOrganization.rows[0].organizationId] : []);
      const passwordHash = await hashPassword(input.password);
      return transaction(db, async client => {
        const invitation = await client.query('SELECT * FROM "Invitation" WHERE "tokenHash"=$1 AND "status"=\'PENDING\' AND "expiresAt">NOW() FOR UPDATE', [refreshHash(secret)]); const row = invitation.rows[0]; if (!row) throw new InvalidInvitationToken();
        const userId = randomUUID(); await client.query('INSERT INTO "User" ("id","email","displayName","passwordHash","emailVerifiedAt") VALUES ($1,$2,$3,$4,NOW())', [userId, row.normalizedEmail, input.displayName.trim(), passwordHash]);
        const membershipId = randomUUID(); await client.query('INSERT INTO "OrganizationMembership" ("id","organizationId","userId") VALUES ($1,$2,$3)', [membershipId, row.organizationId, userId]);
        const roles = await client.query('SELECT "roleId" FROM "InvitationRole" WHERE "invitationId"=$1', [row.id]); for (const role of roles.rows) await client.query('INSERT INTO "MembershipRole" ("membershipId","roleId","organizationId") VALUES ($1,$2,$3)', [membershipId, role.roleId, row.organizationId]);
        await client.query('UPDATE "Invitation" SET "status"=\'ACCEPTED\',"acceptedAt"=NOW(),"updatedAt"=NOW() WHERE "id"=$1', [row.id]);
        return createSession(client, { id: userId, email: row.normalizedEmail, displayName: input.displayName.trim() }, context);
      });
    },
    async completeMfaChallenge(challengeSecret: string, code: string, context?: { ipAddress?: string; userAgent?: string }) {
      return transaction(db, async client => {
        const challenge = await client.query('SELECT c."id", c."userId", c."expiresAt", c."consumedAt", e."encryptedSecret", u."normalizedEmail" AS email, u."displayName" FROM "MfaChallenge" c JOIN "MfaEnrollment" e ON e."userId" = c."userId" AND e."status" = \'ACTIVE\' JOIN "User" u ON u."id" = c."userId" WHERE c."tokenHash" = $1 FOR UPDATE OF c', [refreshHash(challengeSecret)]);
        const row = challenge.rows[0]; if (!row || row.consumedAt || new Date(row.expiresAt) <= new Date()) throw new InvalidCredentials();
        let valid = verifyTotp(decryptSecret(row.encryptedSecret, config.accessSecret), code);
        if (!valid) { const recovery = await client.query('UPDATE "MfaRecoveryCode" SET "usedAt" = NOW() WHERE "userId" = $1 AND "codeHash" = $2 AND "usedAt" IS NULL RETURNING "id"', [row.userId, refreshHash(code.replace(/-/g, '').toUpperCase())]); valid = recovery.rowCount === 1; }
        if (!valid) throw new InvalidCredentials();
        await client.query('UPDATE "MfaChallenge" SET "consumedAt" = NOW() WHERE "id" = $1', [row.id]);
        return createSession(client, { id: row.userId, email: row.email, displayName: row.displayName }, context);
      });
    },
    async switchOrganization(userId: string, sessionId: string, organizationId: string) {
      const result = await db.query('UPDATE "RefreshTokenFamily" f SET "activeOrganizationId" = $3, "lastSeenAt" = NOW() WHERE f."id" = $1 AND f."userId" = $2 AND f."revokedAt" IS NULL AND EXISTS (SELECT 1 FROM "OrganizationMembership" m WHERE m."userId" = $2 AND m."organizationId" = $3 AND m."status" = \'ACTIVE\') RETURNING f."id"', [sessionId, userId, organizationId]);
      if (!result.rowCount) throw new InvitationForbidden();
      return { accessToken: await issueAccessToken(config, userId, sessionId), expiresIn: config.accessTtlSeconds, activeOrganizationId: organizationId };
    },
  };
}
