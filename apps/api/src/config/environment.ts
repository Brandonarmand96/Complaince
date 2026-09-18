import { ConfigurationError, connectionEnvironment, readEnvironment } from '@complyos/runtime/environment';
export { ConfigurationError } from '@complyos/runtime/environment';
export function validateEnvironment(env: NodeJS.ProcessEnv) {
  const connections = connectionEnvironment(env);
  const portInput = env.PORT ?? '4000';
  const port = Number(portInput);
  if (!/^\d+$/.test(portInput) || port < 1 || port > 65535) throw new ConfigurationError(['PORT must be an integer between 1 and 65535']);
  const webOrigin = env.WEB_ORIGIN ?? 'http://127.0.0.1:5173';
  try {
    const url = new URL(webOrigin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== webOrigin) throw new Error();
  } catch { throw new ConfigurationError(['WEB_ORIGIN must be an HTTP(S) origin without a path']); }
  const accessSecret = env.ACCESS_JWT_SECRET ?? '';
  if (accessSecret.length < 32) throw new ConfigurationError(['ACCESS_JWT_SECRET must contain at least 32 characters']);
  const accessTtlSeconds = Number(env.ACCESS_JWT_TTL_SECONDS ?? '900');
  const refreshTtlSeconds = Number(env.REFRESH_TOKEN_TTL_SECONDS ?? '2592000');
  if (!Number.isInteger(accessTtlSeconds) || accessTtlSeconds < 60 || accessTtlSeconds > 3600) throw new ConfigurationError(['ACCESS_JWT_TTL_SECONDS must be an integer from 60 to 3600']);
  if (!Number.isInteger(refreshTtlSeconds) || refreshTtlSeconds < 3600 || refreshTtlSeconds > 7776000) throw new ConfigurationError(['REFRESH_TOKEN_TTL_SECONDS must be an integer from 3600 to 7776000']);
  const auth = { accessSecret, issuer: env.ACCESS_JWT_ISSUER ?? 'complyos-api', audience: env.ACCESS_JWT_AUDIENCE ?? 'complyos-web', accessTtlSeconds, refreshTtlSeconds };
  return Object.freeze({ ...connections, port, webOrigin, auth: Object.freeze(auth) });
}
export type ApiEnvironment = ReturnType<typeof validateEnvironment>;
export function loadEnvironment(overrides: NodeJS.ProcessEnv = process.env, file = new URL('../../.env', import.meta.url)) {
  return validateEnvironment(readEnvironment(file, overrides));
}
