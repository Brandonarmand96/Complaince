import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { assertTestResources } from '@complyos/runtime/testing';
import { createDatabase } from '@complyos/runtime/database';
import { jobStore, makeQueue, makeWorker, processHealthJob, IdempotencyConflict } from '@complyos/runtime/jobs';
import { migrate } from './migrations.mjs';
const read = path => existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {};
const env = { ...read('.env.test'), ...process.env };
const app = { ...read('apps/api/.env'), ...process.env };
let db, producer, consumer, scope;
let failed = false;
try {
  if (!env.TEST_DATABASE_URL || !env.TEST_REDIS_URL) throw new Error('Explicit TEST_DATABASE_URL and TEST_REDIS_URL are required. No application URL fallback is allowed.');
  assertTestResources(env.TEST_DATABASE_URL, env.TEST_REDIS_URL, { databaseUrl: app.DATABASE_URL, redisUrl: app.REDIS_URL });
  // Guard precedes all network access and schema writes.
  scope = 'test-' + randomUUID();
  db = createDatabase(env.TEST_DATABASE_URL);
  await migrate(db);
  producer = makeQueue(env.TEST_REDIS_URL, scope);
  const store = jobStore(db, producer.queue, scope);
  const [first, duplicate] = await Promise.all([store.submit({ label: 'Retry then succeed', failUntil: 2 }, 'retry-case'), store.submit({ label: 'Retry then succeed', failUntil: 2 }, 'retry-case')]);
  assert.equal(first.id, duplicate.id);
  await assert.rejects(() => store.submit({ label: 'Different request' }, 'retry-case'), IdempotencyConflict);
  const permanent = await store.submit({ label: 'Bounded failure', failUntil: 3 }, 'failure-case');
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
  console.log('PASS live integration: retries, final failure, deduplication and one durable effect.');
} catch {
  console.error('Live integration failed or refused. Check explicit test URLs, isolation, connectivity and migration permissions. Connection details are withheld.');
  process.exitCode = 1;
} finally {
  try {
    if (consumer) await consumer.close();
    if (producer) { await producer.queue.obliterate({ force: true }); await producer.close(); }
    if (db && scope) await db.query('DELETE FROM "JobRecord" WHERE "scope" = $1', [scope]);
  } catch { console.error('Test resource cleanup failed for this run.'); process.exitCode = 1; }
  finally { if (db) await db.end(); }
}
