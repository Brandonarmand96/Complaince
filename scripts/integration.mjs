import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { assertTestResources } from '@complyos/runtime/testing';
import { createDatabase } from '@complyos/runtime/database';
import { jobStore, makeQueue, makeWorker, processHealthJob, IdempotencyConflict } from '@complyos/runtime/jobs';
import { authStore, InvalidCredentials, InvalidRefreshToken, verifyAccessToken } from '@complyos/runtime/auth';
import { BUILT_IN_ROLES, ROLE_PERMISSION_MATRIX } from '@complyos/runtime/roles';
import { migrate } from './migrations.mjs';
const read = path => existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {};
const env = { ...read('.env.test'), ...process.env };
const app = { ...read('apps/api/.env'), ...process.env };
let db, producer, consumer, scope, authUserId, authOrganizationId;
let failed = false;
let stage = 'configuration guard';
async function expectConstraint(client, savepoint, work, code) {
  await client.query(`SAVEPOINT ${savepoint}`);
  try {
    await work();
    assert.fail(`Expected PostgreSQL constraint ${code}.`);
  } catch (error) {
    assert.equal(error?.code, code);
  } finally {
    await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
  }
}
try {
  if (!env.TEST_DATABASE_URL || !env.TEST_REDIS_URL) throw new Error('Explicit TEST_DATABASE_URL and TEST_REDIS_URL are required. No application URL fallback is allowed.');
  assertTestResources(env.TEST_DATABASE_URL, env.TEST_REDIS_URL, { databaseUrl: app.DATABASE_URL, redisUrl: app.REDIS_URL });
  // Guard precedes all network access and schema writes.
  stage = 'database migration';
  scope = 'test-' + randomUUID();
  db = createDatabase(env.TEST_DATABASE_URL);
  await migrate(db);
  stage = 'queue setup';
  producer = makeQueue(env.TEST_REDIS_URL, scope);
  const store = jobStore(db, producer.queue, scope);
  stage = 'job submission';
  const [first, duplicate] = await Promise.all([store.submit({ label: 'Retry then succeed', failUntil: 2 }, 'retry-case'), store.submit({ label: 'Retry then succeed', failUntil: 2 }, 'retry-case')]);
  assert.equal(first.id, duplicate.id);
  await assert.rejects(() => store.submit({ label: 'Different request' }, 'retry-case'), IdempotencyConflict);
  const permanent = await store.submit({ label: 'Bounded failure', failUntil: 3 }, 'failure-case');
  stage = 'worker processing';
  consumer = makeWorker(db, env.TEST_REDIS_URL, scope, () => { failed = true; });
  const until = Date.now() + 45000;
  while (Date.now() < until) {
    const records = (await db.query('SELECT * FROM "JobRecord" WHERE "scope" = $1', [scope])).rows;
    if (records.length === 2 && records.every(record => ['COMPLETED', 'FAILED'].includes(record.status))) break;
    await delay(250);
  }
  const success = (await db.query('SELECT * FROM "JobRecord" WHERE "id" = $1', [first.id])).rows[0];
  const failure = (await db.query('SELECT * FROM "JobRecord" WHERE "id" = $1', [permanent.id])).rows[0];
  const effects = async id => Number((await db.query('SELECT COUNT(*) AS count FROM "HealthEffect" WHERE "jobId" = $1', [id])).rows[0].count);
  assert.equal(success.status, 'COMPLETED');
  assert.equal(success.attempts, 3);
  assert.equal(failure.status, 'FAILED');
  assert.equal(failure.attempts, 3);
  assert.equal(await effects(success.id), 1);
  // At-least-once redelivery cannot duplicate the durable effect.
  await processHealthJob(db, success.id, scope);
  assert.equal(await effects(success.id), 1);
  assert.equal(await effects(failure.id), 0);
  assert.equal(failed, false);

  stage = 'identity and access constraints';
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const ids = Object.fromEntries(['user', 'organizationA', 'organizationB', 'membershipA', 'membershipB', 'roleA', 'roleB', 'permissionRead', 'permissionWrite'].map(key => [key, randomUUID()]));
    const user = await client.query('INSERT INTO "User" ("id", "email") VALUES ($1, $2) RETURNING "normalizedEmail"', [ids.user, '  Owner@Example.COM  ']);
    assert.equal(user.rows[0].normalizedEmail, 'owner@example.com');
    await expectConstraint(client, 'duplicate_email', () => client.query('INSERT INTO "User" ("id", "email") VALUES ($1, $2)', [randomUUID(), 'owner@example.com']), '23505');

    await client.query('INSERT INTO "Organization" ("id", "name") VALUES ($1, $2), ($3, $4)', [ids.organizationA, 'Tenant A', ids.organizationB, 'Tenant B']);
    await client.query('INSERT INTO "OrganizationMembership" ("id", "organizationId", "userId") VALUES ($1, $2, $3), ($4, $5, $3)', [ids.membershipA, ids.organizationA, ids.user, ids.membershipB, ids.organizationB]);
    await expectConstraint(client, 'duplicate_membership', () => client.query('INSERT INTO "OrganizationMembership" ("id", "organizationId", "userId") VALUES ($1, $2, $3)', [randomUUID(), ids.organizationA, ids.user]), '23505');

    await client.query('INSERT INTO "Role" ("id", "organizationId", "name") VALUES ($1, $2, $3), ($4, $5, $6)', [ids.roleA, ids.organizationA, 'Manager', ids.roleB, ids.organizationB, 'Auditor']);
    await client.query('INSERT INTO "Permission" ("id", "key") VALUES ($1, $2), ($3, $4)', [ids.permissionRead, 'controls:read', ids.permissionWrite, 'controls:write']);
    await client.query('INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES ($1, $2), ($1, $3), ($4, $2)', [ids.roleA, ids.permissionRead, ids.permissionWrite, ids.roleB]);
    await client.query('INSERT INTO "MembershipRole" ("membershipId", "roleId", "organizationId") VALUES ($1, $2, $3), ($4, $5, $6)', [ids.membershipA, ids.roleA, ids.organizationA, ids.membershipB, ids.roleB, ids.organizationB]);
    await expectConstraint(client, 'cross_tenant_role', () => client.query('INSERT INTO "MembershipRole" ("membershipId", "roleId", "organizationId") VALUES ($1, $2, $3)', [ids.membershipA, ids.roleB, ids.organizationA]), '23503');

    const grants = await client.query('SELECT "organizationId", "roleId" FROM "MembershipRole" WHERE "membershipId" IN ($1, $2)', [ids.membershipA, ids.membershipB]);
    assert.equal(grants.rowCount, 2);
    await client.query('ROLLBACK');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  stage = 'authentication flows';
  const authConfig = { accessSecret: 'integration-secret-with-at-least-32-characters', issuer: 'complyos-integration', audience: 'complyos-test', accessTtlSeconds: 300, refreshTtlSeconds: 3600 };
  const auth = authStore(db, authConfig);
  const email = `owner-${randomUUID()}@example.com`;
  const password = 'correct horse battery staple';
  const registration = await auth.register({ email, password, displayName: 'Test Owner', organizationName: 'Isolated Auth Tenant' });
  authUserId = registration.user.id;
  const membership = await db.query('SELECT "organizationId" FROM "OrganizationMembership" WHERE "userId" = $1', [authUserId]);
  authOrganizationId = membership.rows[0].organizationId;
  const storedUser = await db.query('SELECT "passwordHash" FROM "User" WHERE "id" = $1', [authUserId]);
  assert.match(storedUser.rows[0].passwordHash, /^\$argon2id\$/);
  assert.equal(storedUser.rows[0].passwordHash.includes(password), false);

  const seeded = await db.query('SELECT r."name", array_agg(p."key" ORDER BY p."key") AS permissions FROM "Role" r LEFT JOIN "RolePermission" rp ON rp."roleId" = r."id" LEFT JOIN "Permission" p ON p."id" = rp."permissionId" WHERE r."organizationId" = $1 GROUP BY r."id", r."name"', [authOrganizationId]);
  assert.deepEqual(seeded.rows.map(row => row.name).sort(), [...BUILT_IN_ROLES].sort());
  for (const row of seeded.rows) assert.deepEqual(row.permissions.filter(Boolean), [...ROLE_PERMISSION_MATRIX[row.name]].sort());

  await assert.rejects(() => auth.login({ email: 'missing@example.com', password }), InvalidCredentials);
  await assert.rejects(() => auth.login({ email, password: 'wrong password' }), InvalidCredentials);
  const login = await auth.login({ email: email.toUpperCase(), password });
  const loginIdentity = await verifyAccessToken(authConfig, login.accessToken);
  assert.equal(loginIdentity.userId, authUserId);
  const profile = await auth.me(loginIdentity.userId, loginIdentity.sessionId);
  assert.equal(profile.memberships[0].organizationId, authOrganizationId);
  assert.deepEqual(profile.memberships[0].roles, ['Organization Owner']);
  assert.ok((await auth.sessions(authUserId)).length >= 2);
  assert.equal(await auth.revokeSession(authUserId, randomUUID()), false);
  const registrationIdentity = await verifyAccessToken(authConfig, registration.accessToken);
  await auth.logout(registration.refreshToken);
  assert.ok((await auth.sessions(authUserId)).every(session => session.id !== registrationIdentity.sessionId));
  const storedTokens = await db.query('SELECT "tokenHash" FROM "RefreshToken" t JOIN "RefreshTokenFamily" f ON f."id" = t."familyId" WHERE f."userId" = $1', [authUserId]);
  assert.ok(storedTokens.rows.every(row => /^[a-f0-9]{64}$/.test(row.tokenHash) && row.tokenHash !== login.refreshToken));
  const rotated = await auth.refresh(login.refreshToken);
  assert.notEqual(rotated.refreshToken, login.refreshToken);
  await assert.rejects(() => auth.refresh(login.refreshToken), InvalidRefreshToken);
  await assert.rejects(() => auth.refresh(rotated.refreshToken), InvalidRefreshToken);
  const loginTokenHash = createHash('sha256').update(login.refreshToken).digest('hex');
  const revoked = await db.query('SELECT f."revokedAt" FROM "RefreshTokenFamily" f JOIN "RefreshToken" t ON t."familyId" = f."id" WHERE t."tokenHash" = $1', [loginTokenHash]);
  assert.ok(revoked.rows[0].revokedAt);
  console.log('PASS live integration: jobs, tenant-safe identity, ten-role seed, Argon2, login, JWT and refresh replay revocation.');
} catch (error) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'NO_CODE';
  const detail = stage === 'configuration guard' && error instanceof Error ? ` ${error.message}` : '';
  console.error(`Live integration failed during ${stage} (${code}).${detail} Check isolation, connectivity and permissions. Connection details are withheld.`);
  process.exitCode = 1;
} finally {
  try {
    if (consumer) await consumer.close();
    if (producer) { await producer.queue.obliterate({ force: true }); await producer.close(); }
    if (db && scope) await db.query('DELETE FROM "JobRecord" WHERE "scope" = $1', [scope]);
    if (db && authOrganizationId) await db.query('DELETE FROM "Organization" WHERE "id" = $1', [authOrganizationId]);
    if (db && authUserId) await db.query('DELETE FROM "User" WHERE "id" = $1', [authUserId]);
  } catch { console.error('Test resource cleanup failed for this run.'); process.exitCode = 1; }
  finally { if (db) await db.end(); }
}
