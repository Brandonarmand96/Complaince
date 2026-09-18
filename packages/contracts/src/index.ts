export interface ApiErrorResponse {
  error: { code: string; message: string; fields?: Record<string, string[]> };
  requestId: string;
}
export interface HealthResponse {
  status: 'ok' | 'unavailable';
  service: 'complyos-api';
  checks?: { database: 'ok' | 'unavailable'; redis: 'ok' | 'unavailable' };
}
export interface PageResult<T> { data: T[]; page: number; limit: number; total: number }
export interface JobSummary { id: string; label: string; status: string; attempts: number; lastError: string | null }
