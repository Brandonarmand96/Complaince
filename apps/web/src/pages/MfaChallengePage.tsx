import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { KeyRound } from 'lucide-react';
import { PublicAuthLayout } from '@/components/auth/PublicAuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
export function MfaChallengePage() {
  const auth = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(''); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ code: string }>();
  const submit = handleSubmit(async ({ code }) => { setError(''); try { const outcome = await auth.completeMfa(code); navigate(outcome.invitationPendingToken ? `/accept-invitation?token=${encodeURIComponent(outcome.invitationPendingToken)}` : '/dashboard', { replace: true }); } catch (caught) { setError(caught instanceof Error ? caught.message : 'The code is invalid.'); } });
  return <PublicAuthLayout eyebrow="Two-step verification" title="Confirm it’s you" description="Enter the six-digit code from your authenticator, or one unused recovery code."><form className="space-y-5" onSubmit={submit}><div className="flex justify-center"><KeyRound className="h-8 w-8 text-primary" /></div><label className="block text-sm font-medium" htmlFor="mfa-code">Authentication or recovery code<input id="mfa-code" autoComplete="one-time-code" inputMode="text" autoCapitalize="characters" className="mt-2 h-12 w-full rounded-md border bg-background px-3 text-center font-mono text-xl tracking-[0.2em]" aria-invalid={!!errors.code} aria-describedby={errors.code ? 'mfa-code-error' : undefined} {...register('code', { required: 'Enter an authentication or recovery code.' })} /></label>{errors.code && <p id="mfa-code-error" className="text-sm text-destructive">{errors.code.message}</p>}{error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Button className="h-11 w-full" disabled={isSubmitting}>{isSubmitting ? 'Verifying…' : 'Verify'}</Button></form></PublicAuthLayout>;
}
