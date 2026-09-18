const errorResponse = { description: 'Safe error with request correlation ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } };
const healthSchema = { type: 'object', required: ['status', 'service'], properties: { status: { type: 'string', enum: ['ok', 'unavailable'] }, service: { type: 'string', enum: ['complyos-api'] }, checks: { type: 'object', properties: { database: { type: 'string', enum: ['ok', 'unavailable'] }, redis: { type: 'string', enum: ['ok', 'unavailable'] } } } } };
const jobSchema = { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, label: { type: 'string' }, status: { type: 'string', enum: ['QUEUED', 'RETRYING', 'COMPLETED', 'FAILED'] }, attempts: { type: 'integer' }, lastError: { type: 'string', nullable: true } } };
const jsonBody = (schema: object) => ({ required: true, content: { 'application/json': { schema } } });
const authResponse = { description: 'Access and rotating refresh credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResult' } } } };
export const openapi = {
  openapi: '3.0.3', info: { title: 'ComplyOS API', version: '0.2.0', description: 'Local foundation with database-backed identity and rotating authentication credentials. Setup jobs are unavailable in production.' },
  servers: [{ url: '/' }],
  paths: {
    '/health/live': { get: { summary: 'Process liveness', responses: { '200': { description: 'Process is running', content: { 'application/json': { schema: healthSchema } } } } } },
    '/health/ready': { get: { summary: 'PostgreSQL and Redis readiness', responses: { '200': { description: 'Dependencies reachable', content: { 'application/json': { schema: healthSchema } } }, '503': { description: 'One or more dependencies unavailable', content: { 'application/json': { schema: healthSchema } } } } } },
    '/auth/register': { post: { summary: 'Create an identity and initial organization', requestBody: jsonBody({ type: 'object', additionalProperties: false, required: ['email', 'password', 'displayName', 'organizationName'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 12, maxLength: 128 }, displayName: { type: 'string', minLength: 2, maxLength: 100 }, organizationName: { type: 'string', minLength: 2, maxLength: 120 } } }), responses: { '201': authResponse, '400': errorResponse, '409': errorResponse } } },
    '/auth/login': { post: { summary: 'Authenticate with email and password', requestBody: jsonBody({ type: 'object', additionalProperties: false, required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 1, maxLength: 128 } } }), responses: { '200': authResponse, '400': errorResponse, '401': errorResponse } } },
    '/auth/refresh': { post: { summary: 'Rotate a refresh token', requestBody: jsonBody({ type: 'object', additionalProperties: false, required: ['refreshToken'], properties: { refreshToken: { type: 'string', minLength: 20, maxLength: 200 } } }), responses: { '200': authResponse, '400': errorResponse, '401': errorResponse } } },
    '/auth/verify': { get: { summary: 'Verify an access token', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Verified identity' }, '401': errorResponse } } },
    '/api/v1/setup/jobs': {
      get: { summary: 'List system health jobs (development only)', parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 10000, default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt', 'label', 'status'], default: 'createdAt' } },
        { name: 'direction', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['QUEUED', 'RETRYING', 'COMPLETED', 'FAILED'] } },
      ], responses: { '200': { description: 'Paginated jobs', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: jobSchema }, page: { type: 'integer' }, limit: { type: 'integer' }, total: { type: 'integer' } } } } } }, '400': errorResponse, '503': errorResponse } },
      post: { summary: 'Persist and enqueue one health job (development only)', parameters: [{ name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', pattern: '^[a-zA-Z0-9_-]{8,100}$' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, required: ['label'], properties: { label: { type: 'string', minLength: 2, maxLength: 80, pattern: '\\S' }, failUntil: { type: 'integer', minimum: 0, maximum: 3, description: 'Simulate failures for the first N attempts; default 0.' } } } } } },
        responses: { '202': { description: 'Saved. Queued requests are retried after Redis recovers.', content: { 'application/json': { schema: jobSchema } } }, '400': errorResponse, '409': errorResponse, '503': errorResponse },
      },
    },
  },
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }, schemas: { ApiError: { type: 'object', required: ['error', 'requestId'], properties: { requestId: { type: 'string' }, error: { type: 'object', required: ['code', 'message'], properties: { code: { type: 'string' }, message: { type: 'string' }, fields: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } } } } } }, AuthResult: { type: 'object', required: ['accessToken', 'refreshToken', 'expiresIn', 'user'], properties: { accessToken: { type: 'string' }, refreshToken: { type: 'string' }, expiresIn: { type: 'integer' }, user: { type: 'object', required: ['id', 'email'], properties: { id: { type: 'string', format: 'uuid' }, email: { type: 'string', format: 'email' }, displayName: { type: 'string', nullable: true } } } } } } },
};
