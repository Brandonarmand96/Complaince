export function assertTestResources(databaseUrl: string, redisUrl: string, application: { databaseUrl?: string; redisUrl?: string } = {}) {
  let database: URL;
  let redis: URL;
  try {
    database = new URL(databaseUrl);
    redis = new URL(redisUrl);
  } catch {
    throw new Error('Integration tests require valid TEST_DATABASE_URL and TEST_REDIS_URL values.');
  }
  if (!['postgres:', 'postgresql:'].includes(database.protocol) || !database.hostname || database.pathname !== '/complyos_test') {
    throw new Error('Integration tests require a separate database named complyos_test. Hosted endpoints are supported.');
  }
  if (!['redis:', 'rediss:'].includes(redis.protocol) || !redis.hostname || !/^\/(\d+)?$|^$/.test(redis.pathname)) {
    throw new Error('Integration tests require a valid Redis protocol URL.');
  }
  const identity = (url: URL, kind: 'database' | 'redis') => {
    const host = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ? 'loopback' : url.hostname;
    const port = url.port || (kind === 'database' ? '5432' : '6379');
    const path = kind === 'redis' ? String(Number(url.pathname.slice(1) || 0)) : url.pathname;
    return [host, port, path].join('|');
  };
  for (const [kind, test, live] of [['database', database, application.databaseUrl], ['redis', redis, application.redisUrl]] as const) {
    if (live) {
      let configured: URL;
      try { configured = new URL(live); } catch { throw new Error('Application resource configuration is invalid; tests refused.'); }
      if (identity(test, kind) === identity(configured, kind)) throw new Error('Integration tests refuse the configured application ' + kind + '.');
    }
  }
}
