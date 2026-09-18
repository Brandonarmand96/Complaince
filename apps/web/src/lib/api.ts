import type { ApiErrorResponse } from '@complyos/contracts';
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string[]>, public requestId?: string) { super(message); this.name = 'ApiError'; }
}
function apiBase() {
  const value = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new ApiError(0, 'CONFIGURATION_ERROR', 'The API address is invalid.');
  return url.toString().replace(/\/$/, '');
}
function isErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as ApiErrorResponse;
  return !!candidate.error && typeof candidate.error.code === 'string' && typeof candidate.error.message === 'string' &&
    typeof candidate.requestId === 'string' && (candidate.error.fields === undefined ||
      (!!candidate.error.fields && typeof candidate.error.fields === 'object' && Object.values(candidate.error.fields).every(messages => Array.isArray(messages) && messages.every(message => typeof message === 'string'))));
}
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (options.signal?.aborted) abort();
  else options.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 10000);
  try {
    const headers = new Headers(options.headers);
    if (options.body) headers.set('Content-Type', 'application/json');
    const response = await fetch(apiBase() + path, { ...options, headers, signal: controller.signal });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (isErrorResponse(body)) throw new ApiError(response.status, body.error.code, body.error.message, body.error.fields, body.requestId);
      throw new ApiError(response.status, 'HTTP_ERROR', response.status === 503 ? 'A required service is unavailable. Check PostgreSQL and Redis, then retry.' : 'The request failed. Please retry.');
    }
    if (body === null) throw new ApiError(response.status, 'INVALID_RESPONSE', 'The API returned an unreadable response.');
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted) throw error;
    if (timedOut) throw new ApiError(0, 'TIMEOUT', 'The request timed out. Please retry.');
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the API. Start the API and retry.');
  } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); }
}
