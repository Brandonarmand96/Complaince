import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from './api';

export interface AuthUser { id: string; email: string; displayName: string | null; memberships?: Array<{ id: string; organizationId: string; organizationName: string; status: string; roles: string[] }> }
interface AuthResponse { accessToken: string; expiresIn: number; user: AuthUser }
interface AuthContextValue {
  user: AuthUser | null; accessToken: string | null; loading: boolean;
  login(input: { email: string; password: string }): Promise<void>;
  register(input: { email: string; password: string; displayName: string; organizationName: string }): Promise<void>;
  logout(): Promise<void>;
  authenticatedFetch<T>(path: string, options?: RequestInit): Promise<T>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const accept = useCallback(async (session: AuthResponse) => {
    setAccessToken(session.accessToken);
    const me = await apiFetch<AuthUser>('/auth/me', { headers: { Authorization: `Bearer ${session.accessToken}` } });
    setUser(me);
  }, []);
  useEffect(() => { void apiFetch<AuthResponse>('/auth/refresh', { method: 'POST' }).then(accept).catch(() => { setUser(null); setAccessToken(null); }).finally(() => setLoading(false)); }, [accept]);
  const login = useCallback(async (input: { email: string; password: string }) => accept(await apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) })), [accept]);
  const register = useCallback(async (input: { email: string; password: string; displayName: string; organizationName: string }) => accept(await apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) })), [accept]);
  const logout = useCallback(async () => { await apiFetch<unknown>('/auth/logout', { method: 'POST' }).catch(() => undefined); setUser(null); setAccessToken(null); }, []);
  const authenticatedFetch = useCallback(<T,>(path: string, options: RequestInit = {}) => {
    if (!accessToken) return Promise.reject(new Error('Authentication is required.'));
    const headers = new Headers(options.headers); headers.set('Authorization', `Bearer ${accessToken}`);
    return apiFetch<T>(path, { ...options, headers });
  }, [accessToken]);
  const value = useMemo(() => ({ user, accessToken, loading, login, register, logout, authenticatedFetch }), [user, accessToken, loading, login, register, logout, authenticatedFetch]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider is missing.'); return value; }
