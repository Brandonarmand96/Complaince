import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Values = { email: string; password: string; displayName: string; organizationName: string };
export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const auth = useAuth(); const navigate = useNavigate(); const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError: setFieldError } = useForm<Values>();
  if (auth.user) return <Navigate to="/dashboard" replace />;
  const submit = handleSubmit(async values => {
    setError('');
    try { if (mode === 'login') await auth.login(values); else await auth.register(values); navigate('/dashboard', { replace: true }); }
    catch (caught) {
      if (caught instanceof ApiError && caught.fields) for (const [field, messages] of Object.entries(caught.fields)) setFieldError(field as keyof Values, { message: messages[0] });
      setError(caught instanceof Error ? caught.message : 'Authentication failed. Please retry.');
    }
  });
  const field = (name: keyof Values, label: string, type = 'text', autoComplete?: string) => { const inputId = `auth-${name}`; const errorId = `${inputId}-error`; return <label className="block text-sm font-medium" htmlFor={inputId}>{label}<input id={inputId} className="mt-2 h-11 w-full rounded-md border bg-background px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type={type} autoComplete={autoComplete} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? errorId : undefined} {...register(name, { required: `${label} is required.` })} />{errors[name] && <span id={errorId} className="mt-1 block text-xs text-destructive">{errors[name]?.message}</span>}</label>; };
  const isLogin = mode === 'login';
  return <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
    <section className="hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3 text-lg font-semibold"><ShieldCheck className="h-7 w-7 text-primary" /> ComplyOS</div>
      <div className="max-w-xl"><h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.035em]">Compliance work should leave a clear trail.</h1><p className="mt-6 max-w-lg text-lg text-background/70">Build evidence, ownership, and assurance into one accountable operating system.</p><ul className="mt-10 space-y-4 text-sm text-background/80">{['Tenant-isolated access', 'Traceable control ownership', 'Evidence ready for review'].map(item => <li className="flex items-center gap-3" key={item}><Check className="h-4 w-4 text-primary" />{item}</li>)}</ul></div>
      <p className="text-xs text-background/45">Local compliance workspace</p>
    </section>
    <section className="flex min-h-screen items-center justify-center px-6 py-12"><div className="w-full max-w-md"><div className="mb-10 flex items-center gap-3 font-semibold lg:hidden"><ShieldCheck className="h-6 w-6 text-primary" /> ComplyOS</div><h2 className="text-3xl font-semibold tracking-[-0.025em]">{isLogin ? 'Welcome back' : 'Create your workspace'}</h2><p className="mt-2 text-sm text-muted-foreground">{isLogin ? 'Sign in to continue your compliance work.' : 'Start with an owner account and your organization.'}</p>
      <form className="mt-8 space-y-5" onSubmit={submit}>{!isLogin && field('displayName', 'Your name', 'text', 'name')}{!isLogin && field('organizationName', 'Organization name', 'text', 'organization')}{field('email', 'Work email', 'email', 'email')}{field('password', 'Password', 'password', isLogin ? 'current-password' : 'new-password')}{!isLogin && <p className="text-xs text-muted-foreground">Use at least 12 characters. A passphrase is easiest to remember.</p>}{error && <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}<Button className="h-11 w-full" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create workspace'}</Button></form>
      <p className="mt-7 text-center text-sm text-muted-foreground">{isLogin ? 'New to ComplyOS?' : 'Already have an account?'} <Link className="font-medium text-primary underline-offset-4 hover:underline" to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create a workspace' : 'Sign in'}</Link></p></div></section>
  </main>;
}
