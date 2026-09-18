import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import { Writable } from 'node:stream';
import { pino } from 'pino';
import { createApp } from '../dist/app.js';
import { validateEnvironment } from '../dist/config/environment.js';
import { assertTestResources } from '@complyos/runtime/testing';
import { hashPassword, InvalidCredentials, issueAccessToken, verifyAccessToken, verifyPassword } from '@complyos/runtime/auth';
const authConfig = { accessSecret: 'test-secret-that-is-at-least-32-characters-long', issuer: 'test-issuer', audience: 'test-audience', accessTtlSeconds: 900, refreshTtlSeconds: 3600 };
function fixture(overrides = {}) {
  const entries = [];
  const logger = pino(new Writable({ write(chunk, _encoding, callback) { entries.push(JSON.parse(chunk.toString())); callback(); } }));
  const authResult = { accessToken: 'access', refreshToken: 'refresh-token-value-long-enough', expiresIn: 900, user: { id: 'user-id', email: 'owner@example.com', displayName: 'Owner' } };
  const deps = { checkDatabase: jest.fn().mockResolvedValue(undefined), checkRedis: jest.fn().mockResolvedValue(undefined), submitJob: jest.fn().mockResolvedValue({ id: 'id', label: 'Check', status: 'QUEUED', attempts: 0, lastError: null }), listJobs: jest.fn().mockResolvedValue({ data: [], page: 1, limit: 20, total: 0 }), webOrigin: 'http://127.0.0.1:5173', nodeEnv: 'test', logger, authConfig, auth: { register: jest.fn().mockResolvedValue(authResult), login: jest.fn().mockResolvedValue(authResult), refresh: jest.fn().mockResolvedValue(authResult) }, ...overrides };
  return { app: createApp(deps), deps, entries };
}
describe('foundation API', () => {
  it('returns liveness with the same generated ID in response and log', async () => {
    const { app, entries } = fixture();
    const response = await request(app).get('/health/live').set('X-Request-Id', 'untrusted');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.headers['x-request-id']).not.toBe('untrusted');
    expect(entries.some(log => log.requestId === response.headers['x-request-id'] && log.status === 200)).toBe(true);
  });
  it('reports dependency outages as 503 without leaking credentials', async () => {
    const { app } = fixture({ checkDatabase: jest.fn().mockRejectedValue(new Error('postgres://secret')) });
    const response = await request(app).get('/health/ready');
    expect(response.status).toBe(503);
    expect(response.body.checks).toEqual({ database: 'unavailable', redis: 'ok' });
    expect(response.text).not.toContain('secret');
  });
  it('reports ready when both checks succeed', async () => {
    const { app } = fixture();
    expect((await request(app).get('/health/ready')).status).toBe(200);
  });
  it('rejects unknown fields and wrong types before submitting jobs', async () => {
    const { app, deps } = fixture();
    const response = await request(app).post('/api/v1/setup/jobs').set('Idempotency-Key', 'validation-case').send({ label: '', failUntil: '2', admin: true });
    expect(response.status).toBe(400);
    expect(Object.keys(response.body.error.fields)).toEqual(expect.arrayContaining(['label', 'failUntil', 'admin']));
    expect(deps.submitJob).not.toHaveBeenCalled();
  });
  it.each(['page=-1', 'limit=101', 'sort=password', 'direction=sideways', 'status=unknown', 'limit=2&limit=3', 'filter[secret]=1'])('rejects unsafe query %s', async query => {
    const { app, deps } = fixture();
    const response = await request(app).get('/api/v1/setup/jobs?' + query);
    expect(response.status).toBe(400);
    expect(deps.listJobs).not.toHaveBeenCalled();
  });
  it('passes only documented pagination and filter values', async () => {
    const { app, deps } = fixture();
    const response = await request(app).get('/api/v1/setup/jobs?page=2&limit=5&sort=label&direction=asc&status=FAILED');
    expect(response.status).toBe(200);
    expect(deps.listJobs).toHaveBeenCalledWith({ page: 2, limit: 5, sort: 'label', direction: 'asc', status: 'FAILED' });
  });
  it('returns a safe envelope for malformed JSON and missing routes', async () => {
    const { app } = fixture();
    const response = await request(app).post('/api/v1/setup/jobs').set('Content-Type', 'application/json').send('{secret');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
    expect(response.text).not.toContain('secret');
    const missing = await request(app).get('/missing');
    expect(missing.status).toBe(404);
    expect(missing.body.requestId).toBe(missing.headers['x-request-id']);
  });
  it('hides unexpected failures and does not log provider error messages', async () => {
    const { app, entries } = fixture({ listJobs: jest.fn().mockRejectedValue(new Error('secret provider url')) });
    const response = await request(app).get('/api/v1/setup/jobs');
    expect(response.status).toBe(503);
    expect(response.text + JSON.stringify(entries)).not.toContain('secret provider url');
    expect(response.body).not.toHaveProperty('stack');
  });
  it('serves health documentation', async () => {
    const { app } = fixture();
    expect((await request(app).get('/api/openapi.json')).body.paths).toHaveProperty('/health/ready');
    expect((await request(app).get('/api/docs/')).status).toBe(200);
  });
  it('rejects foreign origins and disables setup jobs in production', async () => {
    const { app } = fixture();
    expect((await request(app).post('/api/v1/setup/jobs').set('Origin', 'https://attacker.example').send({ label: 'Check' })).status).toBe(403);
    const production = fixture({ nodeEnv: 'production' });
    expect((await request(production.app).get('/api/v1/setup/jobs')).status).toBe(404);
  });
});
describe('configuration and integration guard', () => {
  const env = { DATABASE_URL: 'postgresql://u:p@db.example/dev', REDIS_URL: 'rediss://u:p@cache.example:6379/0', ACCESS_JWT_SECRET: 'test-secret-that-is-at-least-32-characters-long' };
  it('accepts hosted provider URLs and rejects missing, malformed and secret-bearing invalid input safely', () => {
    expect(validateEnvironment(env).port).toBe(4000);
    expect(() => validateEnvironment({ ...env, REDIS_URL: '' })).toThrow('REDIS_URL is required');
    expect(() => validateEnvironment({ ...env, PORT: '65536' })).toThrow('PORT');
    expect(() => validateEnvironment({ ...env, DATABASE_URL: 'secret-value' })).toThrow('DATABASE_URL');
    try { validateEnvironment({ ...env, DATABASE_URL: 'secret-value' }); } catch (error) { expect(error.message).not.toContain('secret-value'); }
  });
  it('refuses non-test databases and shared development Redis', () => {
    expect(() => assertTestResources('postgresql://u:p@remote/dev', 'redis://remote/15')).toThrow();
    expect(() => assertTestResources('postgresql://u:p@remote/complyos_test', 'redis://remote/0', { redisUrl: 'redis://other:password@remote/0' })).toThrow();
    expect(() => assertTestResources('postgresql://u:p@remote/complyos_test', 'rediss://test-cache/0', { redisUrl: 'rediss://app-cache/0' })).not.toThrow();
  });
});

describe('authentication foundation', () => {
  it('hashes passwords with Argon2id and rejects an invalid password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(hash, 'correct horse battery staple')).resolves.toBe(true);
    await expect(verifyPassword(hash, 'incorrect password')).resolves.toBe(false);
  });
  it('issues and verifies constrained access JWTs', async () => {
    const token = await issueAccessToken(authConfig, 'user-id');
    await expect(verifyAccessToken(authConfig, token)).resolves.toMatchObject({ userId: 'user-id' });
    await expect(verifyAccessToken({ ...authConfig, audience: 'wrong' }, token)).rejects.toBeInstanceOf(InvalidCredentials);
    await expect(verifyAccessToken({ ...authConfig, issuer: 'wrong' }, token)).rejects.toBeInstanceOf(InvalidCredentials);
    await expect(verifyAccessToken({ ...authConfig, accessSecret: 'different-secret-that-is-at-least-32-characters' }, token)).rejects.toBeInstanceOf(InvalidCredentials);
    const expired = await issueAccessToken({ ...authConfig, accessTtlSeconds: -1 }, 'user-id');
    await expect(verifyAccessToken(authConfig, expired)).rejects.toBeInstanceOf(InvalidCredentials);
  });
  it('validates registration, keeps login failures generic and authenticates bearer requests', async () => {
    const { app, deps } = fixture();
    const invalid = await request(app).post('/auth/register').send({ email: 'bad', password: 'short', displayName: '', organizationName: '' });
    expect(invalid.status).toBe(400);
    expect(deps.auth.register).not.toHaveBeenCalled();
    const registered = await request(app).post('/auth/register').send({ email: 'Owner@Example.com', password: 'correct horse battery staple', displayName: 'Owner', organizationName: 'Example' });
    expect(registered.status).toBe(201);
    const failing = fixture({ auth: { ...deps.auth, login: jest.fn().mockRejectedValue(new InvalidCredentials()) } });
    const login = await request(failing.app).post('/auth/login').send({ email: 'unknown@example.com', password: 'any password' });
    expect(login.status).toBe(401);
    expect(login.body.error.message).toBe('Email or password is incorrect.');
    expect((await request(app).get('/auth/verify')).status).toBe(401);
    const token = await issueAccessToken(authConfig, 'user-id');
    const verified = await request(app).get('/auth/verify').set('Authorization', `Bearer ${token}`);
    expect(verified.status).toBe(200);
    expect(verified.body.userId).toBe('user-id');
  });
});
