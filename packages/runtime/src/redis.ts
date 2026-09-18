import { Redis } from 'ioredis';
export function createRedis(url: string) {
  const client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 1500, commandTimeout: 2000, retryStrategy: () => null, enableOfflineQueue: false });
  client.on('error', () => { /* Health endpoints surface a safe unavailable state. */ });
  return client;
}
export async function checkRedis(url: string) {
  const client = createRedis(url);
  try { await client.connect(); await client.ping(); }
  finally { client.disconnect(); }
}
