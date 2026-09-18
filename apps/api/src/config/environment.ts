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
  return Object.freeze({ ...connections, port, webOrigin });
}
export type ApiEnvironment = ReturnType<typeof validateEnvironment>;
export function loadEnvironment(overrides: NodeJS.ProcessEnv = process.env, file = new URL('../../.env', import.meta.url)) {
  return validateEnvironment(readEnvironment(file, overrides));
}
