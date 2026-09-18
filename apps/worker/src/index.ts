import { ConfigurationError } from '@complyos/runtime/environment';
import { createDatabase } from '@complyos/runtime/database';
import { createLogger } from '@complyos/runtime/logger';
import { checkRedis } from '@complyos/runtime/redis';
import { jobStore, makeQueue, makeWorker } from '@complyos/runtime/jobs';
import { loadEnvironment } from './config.js';
const logger = createLogger();
async function main() {
  const env = loadEnvironment();
  const db = createDatabase(env.databaseUrl);
  try { await db.query('SELECT 1'); await checkRedis(env.redisUrl); }
  catch { await db.end(); throw new Error('Worker cannot reach PostgreSQL or Redis. Check the server environment URLs.'); }
  const producer = makeQueue(env.redisUrl, env.queuePrefix);
  const consumer = makeWorker(db, env.redisUrl, env.queuePrefix, () => logger.error('Worker dependency unavailable. Check PostgreSQL and Redis connectivity.'));
  const store = jobStore(db, producer.queue, env.queuePrefix);
  let reconciling = false;
  const reconcile = async () => {
    if (reconciling) return;
    reconciling = true;
    try { await store.reconcile(); }
    catch { logger.error('Could not dispatch saved health jobs. Will retry in 10 seconds.'); }
    finally { reconciling = false; }
  };
  await reconcile();
  const timer = setInterval(() => { void reconcile(); }, 10000);
  logger.info('ComplyOS worker started.');
  let closing = false;
  const shutdown = async () => {
    if (closing) return;
    closing = true;
    clearInterval(timer);
    const deadline = setTimeout(() => process.exit(1), 10000);
    deadline.unref();
    await consumer.close();
    await producer.close();
    await db.end();
    clearTimeout(deadline);
  };
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void shutdown().catch(() => { logger.error('Worker shutdown failed.'); process.exitCode = 1; }); });
}
main().catch((error: unknown) => {
  logger.error(error instanceof ConfigurationError ? error.message : 'Worker startup failed. Check the PostgreSQL/Redis URLs and apply the database migration.');
  process.exitCode = 1;
});

