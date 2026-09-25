import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from './api';

export interface AuthUser { id: string; email: string; displayName: string | null; activeOrganizationId?: string | null; memberships?: Array<{ id: string; organizationId: string; organizationName: string; status: string; roles: string[] }> }
interface AuthResponse { accessToken: string; expiresIn: number; user: AuthUser }
interface MfaRequired { mfaRequired: true; challengeToken: string; expiresIn: number }
interface AuthContextValue {
  user: AuthUser | null; accessToken: string | null; loading: boolean;
  login(input: { email: string; password: string }): Promise<'authenticated' | 'mfa'>;
  register(input: { email: string; password: string; displayName: string; organizationName: string }): Promise<void>;
  logout(): Promise<void>;
  authenticatedFetch<T>(path: string, options?: RequestInit): Promise<T>;
  completeMfa(code: string): Promise<{ invitationPendingToken?: string }>;
  acceptInvitationWithPassword(input: { email: string; password: string; token: string }): Promise<'accepted' | 'mfa'>;
  acceptNewInvitation(input: { token: string; displayName: string; password: string }): Promise<void>;
  switchOrganization(organizationId: string): Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaChallengeToken, setMfaChallengeToken] = useState<string | null>(null);
  const accept = useCallback(async (session: AuthResponse) => {
    setAccessToken(session.accessToken);
    const me = await apiFetch<AuthUser>('/auth/me', { headers: { Authorization: `Bearer ${session.accessToken}` } });
    setUser(me);
  }, []);
  useEffect(() => { void apiFetch<AuthResponse>('/auth/refresh', { method: 'POST' }).then(accept).catch(() => { setUser(null); setAccessToken(null); }).finally(() => setLoading(false)); }, [accept]);
  const login = useCallback(async (input: { email: string; password: string }) => { sessionStorage.removeItem('pendingInvitationMfa'); const result = await apiFetch<AuthResponse | MfaRequired>('/auth/login', { method: 'POST', body: JSON.stringify(input) }); if ('mfaRequired' in result) { setMfaChallengeToken(result.challengeToken); return 'mfa'; } await accept(result); return 'authenticated'; }, [accept]);
  const register = useCallback(async (input: { email: string; password: string; displayName: string; organizationName: string }) => accept(await apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) })), [accept]);
  const logout = useCallback(async () => { await apiFetch<unknown>('/auth/logout', { method: 'POST' }).catch(() => undefined); setUser(null); setAccessToken(null); }, []);
  const authenticatedFetch = useCallback(<T,>(path: string, options: RequestInit = {}) => {
    if (!accessToken) return Promise.reject(new Error('Authentication is required.'));
    const headers = new Headers(options.headers); headers.set('Authorization', `Bearer ${accessToken}`);
    return apiFetch<T>(path, { ...options, headers });
  }, [accessToken]);
  const completeMfa = useCallback(async (code: string) => { if (!mfaChallengeToken) throw new Error('The MFA challenge has expired.'); const result = await apiFetch<AuthResponse>('/auth/mfa/challenge', { method: 'POST', body: JSON.stringify({ challengeToken: mfaChallengeToken, code }) }); await accept(result); setMfaChallengeToken(null); const pending = sessionStorage.getItem('pendingInvitationMfa'); if (pending) { const parsed = JSON.parse(pending) as { challengeToken: string; invitationToken: string }; if (parsed.challengeToken === mfaChallengeToken) { try { await apiFetch('/invitations/accept', { method: 'POST', headers: { Authorization: `Bearer ${result.accessToken}` }, body: JSON.stringify({ token: parsed.invitationToken }) }); sessionStorage.removeItem('pendingInvitationMfa'); } catch { return { invitationPendingToken: parsed.invitationToken }; } } } return {}; }, [accept, mfaChallengeToken]);
  const acceptInvitationWithPassword = useCallback(async (input: { email: string; password: string; token: string }) => { sessionStorage.removeItem('pendingInvitationMfa'); const result = await apiFetch<AuthResponse | MfaRequired>('/auth/login', { method: 'POST', body: JSON.stringify({ email: input.email, password: input.password }) }); if ('mfaRequired' in result) { setMfaChallengeToken(result.challengeToken); sessionStorage.setItem('pendingInvitationMfa', JSON.stringify({ challengeToken: result.challengeToken, invitationToken: input.token })); return 'mfa'; } await apiFetch('/invitations/accept', { method: 'POST', headers: { Authorization: `Bearer ${result.accessToken}` }, body: JSON.stringify({ token: input.token }) }); await accept(result); return 'accepted'; }, [accept]);
  const acceptNewInvitation = useCallback(async (input: { token: string; displayName: string; password: string }) => accept(await apiFetch<AuthResponse>('/invitations/accept-new', { method: 'POST', body: JSON.stringify(input) })), [accept]);
  const switchOrganization = useCallback(async (organizationId: string) => { if (!accessToken) throw new Error('Authentication is required.'); const result = await apiFetch<{ accessToken: string }>('/auth/switch-organization', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ organizationId }) }); setAccessToken(result.accessToken); setUser(await apiFetch<AuthUser>('/auth/me', { headers: { Authorization: `Bearer ${result.accessToken}` } })); }, [accessToken]);
  const value = useMemo(() => ({ user, accessToken, loading, login, register, logout, authenticatedFetch, completeMfa, acceptInvitationWithPassword, acceptNewInvitation, switchOrganization }), [user, accessToken, loading, login, register, logout, authenticatedFetch, completeMfa, acceptInvitationWithPassword, acceptNewInvitation, switchOrganization]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider is missing.'); return value; }
