import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { HealthResponse, JobSummary, PageResult } from '@complyos/contracts';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/shared/AsyncState';
import { FormField, applyServerErrors } from '@/components/shared/FormField';
const schema = z.object({ label: z.string().trim().min(2, 'Enter at least 2 characters.').max(80, 'Use 80 characters or fewer.') });
type FormValues = z.infer<typeof schema>;
export function SetupPanel() {
  const queryClient = useQueryClient();
  const health = useQuery({ queryKey: ['health'], queryFn: ({ signal }) => apiFetch<HealthResponse>('/health/ready', { signal }) });
  const jobs = useQuery({
    queryKey: ['setup-jobs'], queryFn: ({ signal }) => apiFetch<PageResult<JobSummary>>('/api/v1/setup/jobs?limit=5', { signal }),
    refetchInterval: (query) => query.state.data?.data.some(job => ['QUEUED', 'RETRYING'].includes(job.status)) ? 2000 : false,
  });
  const { register, handleSubmit, setError, clearErrors, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { label: '' } });
  const submission = useRef<{ label: string; key: string } | null>(null);
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (submission.current?.label !== values.label) submission.current = { label: values.label, key: crypto.randomUUID() };
      return apiFetch<JobSummary>('/api/v1/setup/jobs', { method: 'POST', headers: { 'Idempotency-Key': submission.current.key }, body: JSON.stringify(values) });
    },
    onSuccess: () => { reset(); submission.current = null; void queryClient.invalidateQueries({ queryKey: ['setup-jobs'] }); },
    onError: (error) => applyServerErrors(error, setError, ['label']),
  });
  return <section aria-labelledby="setup-title" className="space-y-5 border-t pt-5">
    <div className="space-y-2"><h2 id="setup-title" className="font-semibold">Application setup</h2><p className="text-sm text-muted-foreground">Check service connections and send a sample job to the worker.</p></div>
    {health.isPending ? <LoadingState label="Checking service connections…" /> : health.isError ?
      <ErrorState message={health.error.message} retry={() => { void health.refetch(); }} pending={health.isFetching} /> :
      <div className="flex flex-wrap items-center gap-3"><p role="status" className="text-sm">PostgreSQL and Redis are connected.</p><Button variant="outline" disabled={health.isFetching} onClick={() => { void health.refetch(); }}>{health.isFetching ? 'Checking…' : 'Check again'}</Button></div>}
    <form className="space-y-3" noValidate onSubmit={handleSubmit(values => { clearErrors(); mutation.mutate(values); })}>
      <FormField id="job-label" label="Sample job label" placeholder="Connection check" autoComplete="off" maxLength={80} error={errors.label?.message} {...register('label')} />
      {errors.root?.server && <p role="alert" className="text-sm text-destructive">{errors.root.server.message}</p>}
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Sending…' : 'Send sample job'}</Button>
      {mutation.isSuccess && <p role="status" className="text-sm">Job saved. The worker will process it when connected.</p>}
    </form>
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Recent sample jobs</h3>
      {jobs.isPending ? <LoadingState label="Loading recent jobs…" /> : jobs.isError ?
        <ErrorState message={jobs.error.message} retry={() => { void jobs.refetch(); }} pending={jobs.isFetching} /> :
        jobs.data.data.length === 0 ? <p className="text-sm text-muted-foreground">No sample jobs yet. Send one above to check worker processing.</p> :
        <ul className="divide-y">{jobs.data.data.map(job => <li key={job.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="min-w-0 break-words">{job.label}</span><span className="text-muted-foreground">{job.status.toLowerCase()} · {job.attempts} attempts</span>{job.lastError && <p className="w-full text-destructive">{job.lastError}</p>}</li>)}</ul>}</div>
  </section>;
}
