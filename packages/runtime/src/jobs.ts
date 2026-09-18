import { createHash, randomUUID } from 'node:crypto';
import { Queue, Worker, UnrecoverableError } from 'bullmq';
import { Redis } from 'ioredis';
import { transaction, type Database } from './database.js';

export const MAX_ATTEMPTS = 3;
export const QUEUE_NAME = 'health';
export class IdempotencyConflict extends Error {}
export interface HealthInput { label: string; failUntil?: number }
export interface JobPage { page: number; limit: number; sort: 'createdAt' | 'label' | 'status'; direction: 'asc' | 'desc'; status?: string }
export interface HealthRecord { id: string; label: string; scope: string; payloadHash: string; failUntil: number; status: string; attempts: number; lastError: string | null }
export function makeQueue(redisUrl: string, prefix: string) {
  const connection = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 2000, commandTimeout: 3000, retryStrategy: (times) => times < 3 ? 500 : null });
  connection.on('error', () => {});
  const queue = new Queue(QUEUE_NAME, { connection, prefix });
  queue.on('error', () => {});
  return { queue, close: async () => { await queue.close(); connection.disconnect(); } };
}
export function jobStore(db: Database, queue: Queue, scope: string) {
  const enqueueRecord = async (id: string) => queue.add('health', { id, scope }, {
    jobId: id, attempts: MAX_ATTEMPTS, backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 86400, count: 1000 }, removeOnFail: { age: 86400, count: 1000 },
  });
  return {
    async submit(input: HealthInput, key: string) {
      const payloadHash = createHash('sha256').update(JSON.stringify({ label: input.label, failUntil: input.failUntil ?? 0 })).digest('hex');
      const result = await db.query<HealthRecord>(
        'INSERT INTO "JobRecord" ("id", "scope", "idempotencyKey", "payloadHash", "label", "failUntil", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT ("scope", "idempotencyKey") DO UPDATE SET "idempotencyKey" = EXCLUDED."idempotencyKey" RETURNING *',
        [randomUUID(), scope, key, payloadHash, input.label, input.failUntil ?? 0],
      );
      const record = result.rows[0];
      if (record.payloadHash !== payloadHash) throw new IdempotencyConflict('Use a new idempotency key for a different request.');
      // Saved records act as an outbox if Redis is temporarily unavailable.
      if (record.status === 'QUEUED' || record.status === 'RETRYING') {
        try { await enqueueRecord(record.id); } catch { /* The worker will reconcile this durable request. */ }
      }
      return record;
    },
    async list(input: JobPage) {
      const column = { createdAt: '"createdAt"', label: '"label"', status: '"status"' }[input.sort];
      if (!column) throw new Error('Unsupported sort.');
      const direction = input.direction === 'asc' ? 'ASC' : 'DESC';
      return transaction(db, async client => {
        await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        const where = '"scope" = $1 AND ($2::text IS NULL OR "status" = $2)';
        const data = await client.query<HealthRecord>('SELECT "id", "label", "status", "attempts", "lastError" FROM "JobRecord" WHERE ' + where + ' ORDER BY ' + column + ' ' + direction + ', "id" ASC LIMIT $3 OFFSET $4', [scope, input.status ?? null, input.limit, (input.page - 1) * input.limit]);
        const total = await client.query<{ total: string }>('SELECT COUNT(*) AS total FROM "JobRecord" WHERE ' + where, [scope, input.status ?? null]);
        return { data: data.rows, total: Number(total.rows[0].total), page: input.page, limit: input.limit };
      });
    },
    async reconcile() {
      const pending = await db.query<{ id: string }>('SELECT "id" FROM "JobRecord" WHERE "scope" = $1 AND "status" IN ($2, $3) ORDER BY "createdAt" ASC LIMIT 100', [scope, 'QUEUED', 'RETRYING']);
      for (const record of pending.rows) await enqueueRecord(record.id);
    },
  };
}
export function nextHealthAttempt(record: Pick<HealthRecord, 'status' | 'attempts' | 'failUntil'>) {
  if (record.status === 'COMPLETED') return { attempts: record.attempts, status: 'COMPLETED', lastError: null };
  if (record.status === 'FAILED' || record.attempts >= MAX_ATTEMPTS) return { attempts: record.attempts, status: 'FAILED', lastError: 'Health job exhausted its retry limit.' };
  const attempts = record.attempts + 1;
  const failed = attempts <= record.failUntil;
  return { attempts, status: failed ? (attempts >= MAX_ATTEMPTS ? 'FAILED' : 'RETRYING') : 'COMPLETED', lastError: failed ? 'Simulated health job failure.' : null };
}
export async function processHealthJob(db: Database, id: string, scope: string) {
  const outcome = await transaction(db, async client => {
    const result = await client.query<HealthRecord>('SELECT * FROM "JobRecord" WHERE "id" = $1 AND "scope" = $2 FOR UPDATE', [id, scope]);
    const record = result.rows[0];
    if (!record) return 'missing';
    if (record.status === 'COMPLETED') return 'done';
    if (record.status === 'FAILED') return 'failed';
    const next = nextHealthAttempt(record);
    await client.query('UPDATE "JobRecord" SET "attempts" = $2, "status" = $3, "lastError" = $4, "updatedAt" = NOW() WHERE "id" = $1', [id, next.attempts, next.status, next.lastError]);
    if (next.status === 'COMPLETED') {
      await client.query('INSERT INTO "HealthEffect" ("jobId") VALUES ($1) ON CONFLICT ("jobId") DO NOTHING', [id]);
      return 'done';
    }
    return next.status === 'FAILED' ? 'failed' : 'retry';
  });
  if (outcome === 'failed' || outcome === 'missing') throw new UnrecoverableError('Health job cannot be processed.');
  if (outcome === 'retry') throw new Error('Simulated health job failure.');
}
export function makeWorker(db: Database, redisUrl: string, scope: string, onError: () => void) {
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: null, connectTimeout: 2000 });
  connection.on('error', onError);
  const worker = new Worker(QUEUE_NAME, async (job) => {
    if (job.name !== 'health' || job.data.scope !== scope || typeof job.data.id !== 'string') throw new UnrecoverableError('Invalid health job.');
    await processHealthJob(db, job.data.id, scope);
  }, { connection, prefix: scope, concurrency: 2, maxStalledCount: 1 });
  worker.on('error', onError);
  worker.on('failed', (job) => {
    if (job && job.attemptsMade >= MAX_ATTEMPTS) {
      void db.query('UPDATE "JobRecord" SET "status" = $3, "lastError" = $4, "updatedAt" = NOW() WHERE "id" = $1 AND "scope" = $2 AND "status" <> $5',
        [job.data.id, scope, 'FAILED', 'Health job exhausted its retry limit.', 'COMPLETED']).catch(onError);
    }
  });
  return { worker, close: async () => { await worker.close(); connection.disconnect(); } };
}

