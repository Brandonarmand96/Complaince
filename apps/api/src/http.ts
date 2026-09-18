import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import type { ApiErrorResponse } from '@complyos/contracts';
import type { createLogger } from '@complyos/runtime/logger';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string[]>) { super(message); }
}
export function requestLogging(logger: ReturnType<typeof createLogger>): RequestHandler {
  return (request, response, next) => {
    const requestId = randomUUID();
    response.locals.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);
    const start = performance.now();
    response.on('finish', () => logger.info({ requestId, method: request.method, route: request.route?.path ?? 'unmatched', status: response.statusCode, durationMs: Math.round(performance.now() - start) }, 'request completed'));
    next();
  };
}
export function errorHandler(logger: ReturnType<typeof createLogger>): ErrorRequestHandler {
  return (error: unknown, _request, response, _next) => {
    let safe = error instanceof HttpError ? error : new HttpError(500, 'INTERNAL_ERROR', 'Something went wrong. Please retry.');
    const type = (error as { type?: string } | null)?.type;
    if (type === 'entity.parse.failed') safe = new HttpError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
    if (type === 'entity.too.large') safe = new HttpError(413, 'BODY_TOO_LARGE', 'Request body exceeds 16 KB.');
    if (safe.status >= 500) logger.error({ requestId: response.locals.requestId, code: safe.code }, 'request failed');
    const body: ApiErrorResponse = { error: { code: safe.code, message: safe.message, ...(safe.fields ? { fields: safe.fields } : {}) }, requestId: response.locals.requestId };
    response.status(safe.status).json(body);
  };
}
function fieldsFor(errors: ValidationError[], parent = ''): Record<string, string[]> {
  return errors.reduce<Record<string, string[]>>((fields, error) => {
    const name = parent ? parent + '.' + error.property : error.property;
    if (error.constraints) fields[name] = Object.values(error.constraints);
    return Object.assign(fields, fieldsFor(error.children ?? [], name));
  }, Object.create(null) as Record<string, string[]>);
}
export function validateBody<T extends object>(Dto: ClassConstructor<T>): RequestHandler {
  return async (request, response, next) => {
    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) throw new HttpError(400, 'VALIDATION_ERROR', 'Send a JSON object.');
    const body = plainToInstance(Dto, request.body);
    const errors = await validate(body, { whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true, validationError: { target: false, value: false } });
    if (errors.length) throw new HttpError(400, 'VALIDATION_ERROR', 'Check the highlighted fields.', fieldsFor(errors));
    response.locals.body = body;
    next();
  };
}
export function parseJobQuery(query: Record<string, unknown>) {
  const allowed = ['page', 'limit', 'sort', 'direction', 'status'];
  const fields: Record<string, string[]> = Object.create(null);
  for (const key of Object.keys(query)) if (!allowed.includes(key)) fields[key] = ['Unknown query parameter.'];
  const integer = (key: string, fallback: number, max: number) => {
    const input = query[key];
    if (input === undefined) return fallback;
    if (typeof input !== 'string' || !/^[1-9]\d*$/.test(input) || Number(input) > max) { fields[key] = ['Must be an integer from 1 to ' + max + '.']; return fallback; }
    return Number(input);
  };
  const page = integer('page', 1, 10000);
  const limit = integer('limit', 20, 100);
  const sort = query.sort ?? 'createdAt';
  const direction = query.direction ?? 'desc';
  const status = query.status;
  if (!['createdAt', 'label', 'status'].includes(sort as string)) fields.sort = ['Choose createdAt, label or status.'];
  if (!['asc', 'desc'].includes(direction as string)) fields.direction = ['Choose asc or desc.'];
  if (status !== undefined && !['QUEUED', 'RETRYING', 'COMPLETED', 'FAILED'].includes(status as string)) fields.status = ['Unknown job status.'];
  if (Object.keys(fields).length) throw new HttpError(400, 'VALIDATION_ERROR', 'Invalid query parameters.', fields);
  return { page, limit, sort: sort as 'createdAt' | 'label' | 'status', direction: direction as 'asc' | 'desc', status: status as string | undefined };
}
