'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge, SeverityBadge } from '@/components/shared/badges';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';
import { cn } from '@/lib/utils';

const lifecycleStages = ['Open', 'Assigned', 'Under investigation', 'Corrective action planned', 'Remediation in progress', 'Verification pending', 'Closed'];

export default function FindingsPage() {
  const [findings, setFindings] = useState<any[]>([]);
  const [controls, setControls] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    supabase.from('findings').select('*').eq('organization_id', ORG_ID).then(({ data }) => {
      setFindings(data || []);
      if (data) {
        const ids = [...new Set(data.map((f) => f.control_id).filter(Boolean))];
        if (ids.length) {
          supabase.from('controls').select('*').in('id', ids).then(({ data: cd }) => {
            const map: Record<string, any> = {};
            (cd || []).forEach((c) => { map[c.id] = c; });
            setControls(map);
          });
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  const filtered = findings.filter((f) => {
    const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || f.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const bySeverity = {
    High: findings.filter((f) => f.severity === 'High').length,
    Medium: findings.filter((f) => f.severity === 'Medium').length,
    Low: findings.filter((f) => f.severity === 'Low').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Audit Findings</h2>
        <p className="text-sm text-muted-foreground">Findings and corrective/preventive action tracking</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive"><AlertTriangle className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">High Severity</p><p className="text-xl font-bold">{bySeverity.High}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning"><AlertTriangle className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">Medium Severity</p><p className="text-xl font-bold">{bySeverity.Medium}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><AlertTriangle className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">Low Severity</p><p className="text-xl font-bold">{bySeverity.Low}</p></div></div></CardContent></Card>
      </div>

      {/* Lifecycle tracker */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Finding Lifecycle</p>
          <div className="flex flex-wrap gap-2">
            {lifecycleStages.map((stage) => {
              const count = findings.filter((f) => f.status === stage).length;
              return (
                <div key={stage} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium', count > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                  {stage} {count > 0 && <span className="rounded-full bg-primary/20 px-1.5 text-[10px]">{count}</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search findings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'High', 'Medium', 'Low'].map((s) => (
            <button key={s} onClick={() => setSeverityFilter(s)} className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors', severityFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((f) => (
          <Card key={f.id} className="cursor-pointer transition-all hover:shadow-md" >
            <button onClick={() => setSelected(f)} className="w-full text-left">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{f.title}</p>
                      <SeverityBadge severity={f.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground">{f.type} · Owner: {f.owner} · Due: {f.due_date ? new Date(f.due_date).toLocaleDateString() : '—'}</p>
                    {f.control_id && controls[f.control_id] && <p className="text-xs text-primary">Linked: {controls[f.control_id].control_id} — {controls[f.control_id].title}</p>}
                  </div>
                  <StatusBadge status={f.status} />
                </div>
              </CardContent>
            </button>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg overflow-y-auto scrollbar-thin bg-card shadow-2xl animate-slide-up">
            <div className="sticky top-0 flex items-center justify-between border-b bg-card/95 backdrop-blur p-5">
              <h3 className="font-semibold">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={selected.severity} />
                <StatusBadge status={selected.status} />
                <span className="text-xs text-muted-foreground">{selected.type}</span>
              </div>
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Description</p><p className="mt-1">{selected.description}</p></div>
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Root Cause</p><p className="mt-1">{selected.root_cause}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Owner</p><p>{selected.owner}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Auditor</p><p>{selected.auditor}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Due Date</p><p>{selected.due_date ? new Date(selected.due_date).toLocaleDateString() : '—'}</p></div>
              </div>
              {selected.management_response && <div><p className="text-xs font-semibold uppercase text-muted-foreground">Management Response</p><p className="mt-1 italic">{selected.management_response}</p></div>}
              {selected.corrective_action && <div><p className="text-xs font-semibold uppercase text-muted-foreground">Corrective Action</p><p className="mt-1">{selected.corrective_action}</p></div>}
              {selected.control_id && controls[selected.control_id] && (
                <div className="rounded-lg border p-3"><p className="text-xs font-semibold uppercase text-muted-foreground">Linked Control</p><p className="mt-1 text-primary">{controls[selected.control_id].control_id} — {controls[selected.control_id].title}</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
