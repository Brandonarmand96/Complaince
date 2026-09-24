import { createApp } from './app.js';
import { ConfigurationError, loadEnvironment } from './config/environment.js';
import { createDatabase } from '@complyos/runtime/database';
import { createLogger } from '@complyos/runtime/logger';
import { checkRedis } from '@complyos/runtime/redis';
import { jobStore, makeQueue } from '@complyos/runtime/jobs';
import { authStore } from '@complyos/runtime/auth';
import { createSmtpMailer } from '@complyos/runtime/mail';
const logger = createLogger();
try {
  const env = loadEnvironment();
  const db = createDatabase(env.databaseUrl);
  const producer = makeQueue(env.redisUrl, env.queuePrefix);
  const store = jobStore(db, producer.queue, env.queuePrefix);
  const auth = authStore(db, env.auth, { mailer: createSmtpMailer(env.smtp), webOrigin: env.webOrigin });
  const app = createApp({
    checkDatabase: () => db.query('SELECT 1'), checkRedis: () => checkRedis(env.redisUrl),
    submitJob: store.submit, listJobs: store.list, logger, webOrigin: env.webOrigin, nodeEnv: env.nodeEnv, auth, authConfig: env.auth,
  });
  const server = app.listen(env.port, '127.0.0.1', () => logger.info({ port: env.port }, 'ComplyOS API started on 127.0.0.1.'));
  let closing = false;
  const shutdown = async () => {
    if (closing) return;
    closing = true;
    const deadline = setTimeout(() => process.exit(1), 10000);
    deadline.unref();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await producer.close();
    await db.end();
    clearTimeout(deadline);
  };
  server.on('error', () => { logger.error('API startup failed. Check the configured port.'); void shutdown(); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void shutdown().catch(() => { logger.error('API shutdown failed.'); process.exitCode = 1; }); });
} catch (error) {
  logger.error(error instanceof ConfigurationError ? error.message : 'API configuration could not be loaded.');
  process.exitCode = 1;
}
