import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

export interface ApiEnvironment {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly port: number;
  readonly databaseUrl: string;
}

export class ConfigurationError extends Error {
  constructor(problems: string[]) {
    super(`API configuration error: ${problems.join('; ')}`);
    this.name = 'ConfigurationError';
  }
}

export function validateEnvironment(env: NodeJS.ProcessEnv): ApiEnvironment {
  const problems: string[] = [];
  const nodeEnv = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    problems.push('NODE_ENV must be development, test or production');
  }

  const portInput = env.PORT ?? '4000';
  const port = Number(portInput);
  if (!/^\d+$/.test(portInput) || !Number.isInteger(port) || port < 1 || port > 65535) {
    problems.push('PORT must be an integer between 1 and 65535');
  }

  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    problems.push('DATABASE_URL is required');
  } else {
    try {
      const url = new URL(databaseUrl);
      if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length <= 1) {
        problems.push('DATABASE_URL must be a PostgreSQL URL with a host and database name');
      }
    } catch {
      // URL parser errors can contain credentials; never forward their message or cause.
      problems.push('DATABASE_URL must be a valid PostgreSQL URL');
    }
  }

  if (problems.length) throw new ConfigurationError(problems);

  return Object.freeze({
    nodeEnv: nodeEnv as ApiEnvironment['nodeEnv'],
    port,
    databaseUrl: databaseUrl!,
  });
}

export function loadEnvironment(
  processEnvironment: NodeJS.ProcessEnv = process.env,
  envFile: URL = new URL('../../.env', import.meta.url),
): ApiEnvironment {
  let fileEnvironment: NodeJS.ProcessEnv = {};
  try {
    fileEnvironment = parseEnv(readFileSync(envFile, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new ConfigurationError(['unable to read the API .env file']);
    }
  }

  // Explicit process variables take precedence, including empty values which must fail validation.
  return validateEnvironment({ ...fileEnvironment, ...processEnvironment });
}
