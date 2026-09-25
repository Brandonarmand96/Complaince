import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Link2Off, Loader2 } from 'lucide-react';
import { PublicAuthLayout } from '@/components/auth/PublicAuthLayout';
import { ApiError, apiFetch } from '@/lib/api';
export function VerificationResultPage() {
  const [params] = useSearchParams(); const token = params.get('token');
  const [attempt, setAttempt] = useState(0); const [state, setState] = useState<'loading' | 'success' | 'expired' | 'unavailable'>(token ? 'loading' : 'expired');
  useEffect(() => { if (token) { setState('loading'); void apiFetch('/auth/email-verification/consume', { method: 'POST', body: JSON.stringify({ token }) }).then(() => setState('success')).catch(error => setState(error instanceof ApiError && error.code === 'INVALID_VERIFICATION_TOKEN' ? 'expired' : 'unavailable')); } }, [token, attempt]);
  if (state === 'loading') return <PublicAuthLayout eyebrow="Email verification" title="Checking your link" description="This should only take a moment."><div role="status" className="flex items-center gap-3 rounded-lg bg-muted p-4 text-sm"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Verifying your email…</div></PublicAuthLayout>;
  if (state === 'unavailable') return <PublicAuthLayout eyebrow="Email verification" title="We couldn’t check your link" description="The verification service is temporarily unavailable. Your link may still be valid."><button type="button" className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground" onClick={() => setAttempt(value => value + 1)}>Try again</button></PublicAuthLayout>;
  const success = state === 'success';
  return <PublicAuthLayout eyebrow="Email verification" title={success ? 'Email verified' : 'That link has expired'} description={success ? 'Your email is confirmed. You can now return to your compliance workspace.' : 'Verification links are single-use and time-limited. Sign in to request a fresh link.'}>
    <div className={`flex items-start gap-3 rounded-lg p-4 text-sm ${success ? 'bg-green-500/10 text-green-800 dark:text-green-300' : 'bg-amber-500/10 text-amber-900 dark:text-amber-200'}`}>{success ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <Link2Off className="mt-0.5 h-5 w-5 shrink-0" />}<span>{success ? 'Verification completed successfully.' : 'No account changes were made.'}</span></div>
    <Link className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" to="/login">Continue to sign in</Link>
  </PublicAuthLayout>;
}
