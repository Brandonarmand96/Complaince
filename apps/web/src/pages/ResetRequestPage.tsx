import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MailCheck } from 'lucide-react';
import { PublicAuthLayout } from '@/components/auth/PublicAuthLayout';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
export function ResetRequestPage() {
  const [sent, setSent] = useState(false); const [requestError, setRequestError] = useState(''); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>();
  const submit = handleSubmit(async value => { setRequestError(''); try { await apiFetch('/auth/password-reset/request', { method: 'POST', body: JSON.stringify(value) }); setSent(true); } catch { setRequestError('We couldn’t send the request. Please try again.'); } });
  return <PublicAuthLayout eyebrow="Account recovery" title="Reset your password" description="Enter your work email. If it matches an account, we’ll send a time-limited reset link.">
    {sent ? <div role="status" className="rounded-lg bg-primary/10 p-4 text-sm leading-6 text-foreground"><MailCheck className="mb-3 h-6 w-6 text-primary" /><strong className="block">Check your inbox</strong>If an account exists for that address, a reset link is on its way.</div> : <form className="space-y-5" onSubmit={submit}><label className="block text-sm font-medium" htmlFor="reset-email">Work email<input id="reset-email" type="email" autoComplete="email" className="mt-2 h-11 w-full rounded-md border bg-background px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'reset-email-error' : undefined} {...register('email', { required: 'Enter your work email.' })} /></label>{errors.email && <p id="reset-email-error" className="text-xs text-destructive">{errors.email.message}</p>}{requestError && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{requestError}</p>}<Button className="h-11 w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send reset link'}</Button></form>}
    <p className="mt-6 text-center text-sm text-muted-foreground"><Link className="font-medium text-primary hover:underline" to="/login">Back to sign in</Link></p>
  </PublicAuthLayout>;
}
