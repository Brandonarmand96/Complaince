import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { useCreateProgram, useProgram, useProgramOptions, useUpdateProgram, type ProgramCreate } from '@/lib/programs';

const initial: ProgramCreate = { name: '', frameworkVersionId: '', ownerMembershipId: '', scope: { dataTypes: [] }, startDate: '', endDate: '', assessmentType: 'INTERNAL', stage: 'PLANNING', status: 'DRAFT' };
const assessments = ['INTERNAL', 'EXTERNAL', 'SELF_ASSESSMENT', 'CERTIFICATION'] as const;
const stages = ['PLANNING', 'READINESS', 'ASSESSMENT', 'REMEDIATION', 'COMPLETE'] as const;
const statuses = ['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'] as const;

export function ProgramFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id = '' } = useParams(), navigate = useNavigate(), query = useProgram(mode === 'edit' ? id : ''), options = useProgramOptions();
  const create = useCreateProgram(), update = useUpdateProgram(id), mutation = mode === 'create' ? create : update;
  const [form, setForm] = useState(initial), [dataTypes, setDataTypes] = useState(''), [errors, setErrors] = useState<Record<string, string[]>>({});
  useEffect(() => { if (query.data) { setForm({ name: query.data.name, frameworkVersionId: query.data.frameworkVersionId, ownerMembershipId: query.data.ownerMembershipId, scope: query.data.scope, startDate: query.data.startDate ?? '', endDate: query.data.endDate ?? '', assessmentType: query.data.assessmentType, stage: query.data.stage, status: query.data.status }); setDataTypes(query.data.scope?.dataTypes?.join(', ') ?? ''); } }, [query.data]);
  if (mode === 'edit' && query.isLoading) return <div aria-label="Loading program" className="h-64 animate-pulse rounded-xl bg-muted"/>;
  if (mode === 'edit' && query.isError) return <div role="alert"><h1 className="text-xl font-semibold">Program could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">Check your connection and try loading the latest program record again.</p><Button className="mt-5" type="button" variant="outline" onClick={() => void query.refetch()}>Try again</Button></div>;
  const message = (name: string) => errors[name]?.[0];
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setErrors({});
    const scope = { ...form.scope, dataTypes: dataTypes.split(',').map(value => value.trim()).filter(Boolean) };
    try {
      const record = mode === 'create'
        ? await create.mutateAsync({ ...form, scope, startDate: form.startDate || undefined, endDate: form.endDate || undefined })
        : await update.mutateAsync({ name: form.name, ownerMembershipId: form.ownerMembershipId, scope, startDate: form.startDate || null, endDate: form.endDate || null, version: query.data!.version, assessmentType: form.assessmentType });
      navigate(`/programs/${record.id}`);
    } catch (error) { if (error instanceof ApiError && error.fields) setErrors(error.fields); }
  };
  const field = (name: 'name' | 'startDate' | 'endDate', label: string, type = 'text') => <label className="block text-sm font-medium" htmlFor={`program-${name}`}>{label}<input id={`program-${name}`} required={name === 'name'} type={type} className="field mt-2 aria-invalid:border-destructive" value={form[name] ?? ''} aria-invalid={Boolean(message(name))} aria-describedby={message(name) ? `program-${name}-error` : undefined} onChange={event => setForm(value => ({ ...value, [name]: event.target.value }))}/>{message(name) && <span id={`program-${name}-error`} className="mt-1 block text-xs text-destructive">{message(name)}</span>}</label>;
  const conflict = mutation.error instanceof ApiError && mutation.error.code === 'CONCURRENCY_CONFLICT';
  return <div className="mx-auto max-w-3xl"><h1 className="text-2xl font-semibold tracking-tight">{mode === 'create' ? 'Create compliance program' : 'Edit compliance program'}</h1><p className="mt-2 text-sm text-muted-foreground">Pin the program to an exact framework edition and accountable owner.</p>
    {options.isError && <div role="alert" className="mt-6 flex items-center justify-between gap-3 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"><span>Framework editions and owners could not be loaded.</span><Button type="button" size="sm" variant="outline" onClick={() => void options.refetch()}>Try again</Button></div>}
    {mutation.isError && <div role="alert" className="mt-6 flex flex-col gap-3 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"><span>{conflict ? 'This program changed after you loaded it. Reload and reapply your changes.' : mutation.error.message}</span>{conflict && <Button type="button" size="sm" variant="outline" onClick={() => window.location.reload()}>Reload latest version</Button>}</div>}
    <form className="mt-8 space-y-6" onSubmit={submit}>{field('name', 'Program name')}<div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-medium" htmlFor="program-framework">Framework edition<select id="program-framework" required disabled={mode === 'edit'} className="field mt-2" value={form.frameworkVersionId} onChange={event => setForm(value => ({ ...value, frameworkVersionId: event.target.value }))}><option value="">Select edition</option>{options.data?.versions.map(version => <option key={version.id} value={version.id}>{version.frameworkName} · {version.versionIdentifier}</option>)}</select>{message('frameworkVersionId') && <span className="mt-1 block text-xs text-destructive">{message('frameworkVersionId')}</span>}</label>
      <label className="text-sm font-medium" htmlFor="program-owner">Owner<select id="program-owner" required className="field mt-2" value={form.ownerMembershipId} onChange={event => setForm(value => ({ ...value, ownerMembershipId: event.target.value }))}><option value="">Select owner</option>{options.data?.owners.map(owner => <option key={owner.id} value={owner.id}>{owner.displayName || owner.email}</option>)}</select>{message('ownerMembershipId') && <span className="mt-1 block text-xs text-destructive">{message('ownerMembershipId')}</span>}</label>
      {field('startDate', 'Start date', 'date')}{field('endDate', 'End date', 'date')}
      <label className="text-sm font-medium" htmlFor="program-assessment">Assessment type<select id="program-assessment" className="field mt-2" value={form.assessmentType} onChange={event => setForm(value => ({ ...value, assessmentType: event.target.value as ProgramCreate['assessmentType'] }))}>{assessments.map(value => <option key={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
      {mode === 'create' && <><label className="text-sm font-medium" htmlFor="program-stage">Stage<select id="program-stage" className="field mt-2" value={form.stage} onChange={event => setForm(value => ({ ...value, stage: event.target.value as ProgramCreate['stage'] }))}>{stages.map(value => <option key={value}>{value}</option>)}</select></label><label className="text-sm font-medium" htmlFor="program-status">Status<select id="program-status" className="field mt-2" value={form.status} onChange={event => setForm(value => ({ ...value, status: event.target.value as ProgramCreate['status'] }))}>{statuses.map(value => <option key={value}>{value.replaceAll('_', ' ')}</option>)}</select></label></>}
    </div><label className="block text-sm font-medium" htmlFor="program-data-types">Data types in scope<input id="program-data-types" className="field mt-2" value={dataTypes} onChange={event => setDataTypes(event.target.value)} placeholder="Customer PII, payment data"/><span className="mt-1 block text-xs text-muted-foreground">Separate values with commas.</span></label><div className="flex gap-3"><Button disabled={mutation.isPending || options.isLoading || options.isError}>{mutation.isPending ? 'Saving…' : mode === 'create' ? 'Create program' : 'Save changes'}</Button><Button asChild variant="ghost"><Link to={mode === 'create' ? '/programs' : `/programs/${id}`}>Cancel</Link></Button></div></form>
  </div>;
}
