import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

export class ConfigurationError extends Error {
  constructor(problems: string[]) {
    super(`Configuration error: ${problems.join('; ')}`);
    this.name = 'ConfigurationError';
  }
}
export function readEnvironment(file: URL, overrides: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  try { return { ...parseEnv(readFileSync(file, 'utf8')), ...overrides }; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return overrides;
    throw new ConfigurationError(['unable to read workspace .env']);
  }
}
export function connectionEnvironment(env: NodeJS.ProcessEnv) {
  const problems: string[] = [];
  const databaseUrl = env.DATABASE_URL?.trim() ?? '';
  const redisUrl = env.REDIS_URL?.trim() ?? '';
  for (const [field, value, protocols] of [
    ['DATABASE_URL', databaseUrl, ['postgres:', 'postgresql:']],
    ['REDIS_URL', redisUrl, ['redis:', 'rediss:']],
  ] as const) {
    if (!value) { problems.push(`${field} is required`); continue; }
    try {
      const parsed = new URL(value);
      if (!(protocols as readonly string[]).includes(parsed.protocol) || !parsed.hostname || parsed.hash ||
        (field === 'DATABASE_URL' ? parsed.pathname.length <= 1 : !/^\/(\d+)?$|^$/.test(parsed.pathname))) {
        problems.push(`${field} has an invalid protocol, host or database`);
      }
    } catch { problems.push(`${field} must be a valid connection URL`); }
  }
  const queuePrefix = env.QUEUE_PREFIX ?? 'complyos';
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(queuePrefix)) problems.push('QUEUE_PREFIX must contain 1–64 letters, digits, underscores or hyphens');
  const nodeEnv = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) problems.push('NODE_ENV must be development, test or production');
  if (problems.length) throw new ConfigurationError(problems);
  return { databaseUrl, redisUrl, queuePrefix, nodeEnv: nodeEnv as 'development' | 'test' | 'production' };
}
