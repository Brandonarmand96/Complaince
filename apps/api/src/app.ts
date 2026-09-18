import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import type { HealthResponse, JobSummary, PageResult } from '@complyos/contracts';
import { createLogger } from '@complyos/runtime/logger';
import { IdempotencyConflict, type HealthInput, type JobPage } from '@complyos/runtime/jobs';
import { EmailAlreadyRegistered, InvalidCredentials, InvalidRefreshToken, type AuthConfig, type AuthResult } from '@complyos/runtime/auth';
import { authenticateAccessToken, HttpError, errorHandler, parseJobQuery, requestLogging, validateBody } from './http.js';
import { HealthJobDto, LoginDto, RefreshDto, RegisterDto } from './dto.js';
import { openapi } from './openapi.js';
export interface AppDependencies {
  checkDatabase: () => Promise<unknown>;
  checkRedis: () => Promise<unknown>;
  submitJob: (input: HealthInput, key: string) => Promise<JobSummary>;
  listJobs: (input: JobPage) => Promise<PageResult<JobSummary>>;
  webOrigin: string;
  nodeEnv: string;
  authConfig: AuthConfig;
  auth: {
    register: (input: RegisterDto) => Promise<AuthResult>;
    login: (input: LoginDto) => Promise<AuthResult>;
    refresh: (token: string) => Promise<AuthResult>;
  };
  logger?: ReturnType<typeof createLogger>;
}
export function createApp(deps: AppDependencies) {
  const app = express();
  const logger = deps.logger ?? createLogger();
  app.disable('x-powered-by');
  app.use(requestLogging(logger));
  // Bind loopback at startup, reject DNS rebinding and foreign browser origins.
  app.use((request, response, next) => {
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(request.hostname)) return next(new HttpError(403, 'HOST_REJECTED', 'Use the local API address.'));
    const origin = request.get('Origin');
    if (origin && origin !== deps.webOrigin) return next(new HttpError(403, 'ORIGIN_REJECTED', 'Origin is not allowed.'));
    response.setHeader('Vary', 'Origin');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, Authorization');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    }
    if (request.method === 'OPTIONS') { response.sendStatus(204); return; }
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.get('/health/live', (_request, response) => {
    response.json({ status: 'ok', service: 'complyos-api' } satisfies HealthResponse);
  });
  app.get('/health/ready', async (_request, response) => {
    const results = await Promise.allSettled([deps.checkDatabase(), deps.checkRedis()]);
    const checks = { database: results[0].status === 'fulfilled' ? 'ok' : 'unavailable', redis: results[1].status === 'fulfilled' ? 'ok' : 'unavailable' } as const;
    const ready = checks.database === 'ok' && checks.redis === 'ok';
    response.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable', service: 'complyos-api', checks } satisfies HealthResponse);
  });
  app.get('/api/openapi.json', (_request, response) => response.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { swaggerOptions: { validatorUrl: null } }));
  app.post('/auth/register', validateBody(RegisterDto), async (_request, response) => {
    try { response.status(201).json(await deps.auth.register(response.locals.body as RegisterDto)); }
    catch (error) {
      if (error instanceof EmailAlreadyRegistered) throw new HttpError(409, 'EMAIL_UNAVAILABLE', 'An account cannot be created with those details.');
      throw error;
    }
  });
  app.post('/auth/login', validateBody(LoginDto), async (_request, response) => {
    try { response.json(await deps.auth.login(response.locals.body as LoginDto)); }
    catch (error) {
      if (error instanceof InvalidCredentials) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
      throw error;
    }
  });
  app.post('/auth/refresh', validateBody(RefreshDto), async (_request, response) => {
    try { response.json(await deps.auth.refresh((response.locals.body as RefreshDto).refreshToken)); }
    catch (error) {
      if (error instanceof InvalidRefreshToken) throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'The refresh session is invalid or expired.');
      throw error;
    }
  });
  app.get('/auth/verify', authenticateAccessToken(deps.authConfig), (_request, response) => response.json({ authenticated: true, userId: (response.locals.auth as { userId: string }).userId }));
  // Development plumbing only, never an unauthenticated production job interface.
  if (deps.nodeEnv !== 'production') {
    app.get('/api/v1/setup/jobs', async (request, response) => {
      const query = parseJobQuery(request.query);
      try { response.json(await deps.listJobs(query)); }
      catch { throw new HttpError(503, 'DATABASE_UNAVAILABLE', 'Cannot load jobs. Check PostgreSQL and apply the migration.'); }
    });
    app.post('/api/v1/setup/jobs', validateBody(HealthJobDto), async (request, response) => {
      const key = request.get('Idempotency-Key');
      if (!key || !/^[a-zA-Z0-9_-]{8,100}$/.test(key)) throw new HttpError(400, 'VALIDATION_ERROR', 'Send an Idempotency-Key header containing 8–100 letters, digits, hyphens or underscores.');
      try {
        const { id, label, status, attempts, lastError } = await deps.submitJob(response.locals.body as HealthJobDto, key);
        response.status(202).json({ id, label, status, attempts, lastError } satisfies JobSummary);
      } catch (error) {
        if (error instanceof IdempotencyConflict) throw new HttpError(409, 'IDEMPOTENCY_CONFLICT', error.message);
        throw new HttpError(503, 'DATABASE_UNAVAILABLE', 'Cannot save this job. Check PostgreSQL and apply the migration.');
      }
    });
  }
  app.use((_request, _response, next) => next(new HttpError(404, 'NOT_FOUND', 'Endpoint not found.')));
  app.use(errorHandler(logger));
  return app;
}
