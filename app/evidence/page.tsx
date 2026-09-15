'use client';

import { useEffect, useState, useMemo } from 'react';
import { FileText, Search, Download, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/badges';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [controls, setControls] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    supabase.from('evidence').select('*').eq('organization_id', ORG_ID).then(({ data }) => {
      setEvidence(data || []);
      if (data) {
        const ids = [...new Set(data.map((e) => e.control_id).filter(Boolean))];
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

  const types = useMemo(() => ['all', ...new Set(evidence.map((e) => e.evidence_type))], [evidence]);

  const filtered = useMemo(() => {
    return evidence.filter((e) => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || e.evidence_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [evidence, search, typeFilter]);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Evidence Repository</h2>
        <p className="text-sm text-muted-foreground">Compliance evidence with validation and expiration tracking</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search evidence..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
          {types.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors', typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => {
          const isExpired = e.valid_until && new Date(e.valid_until) < new Date();
          const isExpiringSoon = e.valid_until && !isExpired && (new Date(e.valid_until).getTime() - Date.now()) / (1000*60*60*24) < 30;
          return (
            <Card key={e.id} className="cursor-pointer transition-all hover:shadow-md" >
              <button onClick={() => setSelected(e)} className="w-full text-left">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.evidence_type} · {e.owner}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={e.approval_status} />
                    {isExpired && <span className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> Expired</span>}
                    {isExpiringSoon && <span className="flex items-center gap-1 text-xs text-warning"><Clock className="h-3 w-3" /> Expiring soon</span>}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>v{e.version_number}</span>
                    <span>·</span>
                    <span>{e.file_name}</span>
                  </div>
                </CardContent>
              </button>
            </Card>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md overflow-y-auto scrollbar-thin bg-card shadow-2xl animate-slide-up">
            <div className="sticky top-0 flex items-center justify-between border-b bg-card/95 backdrop-blur p-5">
              <h3 className="font-semibold">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Description</p><p className="mt-1">{selected.description}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Type</p><p>{selected.evidence_type}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Owner</p><p>{selected.owner}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Collected</p><p>{selected.collection_date ? new Date(selected.collection_date).toLocaleDateString() : '—'}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Valid Until</p><p>{selected.valid_until ? new Date(selected.valid_until).toLocaleDateString() : '—'}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Confidentiality</p><p>{selected.confidentiality}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Version</p><p>v{selected.version_number}</p></div>
              </div>
              {selected.control_id && controls[selected.control_id] && (
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Linked Control</p><p className="mt-1 text-primary">{controls[selected.control_id].control_id} — {controls[selected.control_id].title}</p></div>
              )}
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.approval_status} />
                <button className="flex items-center gap-1 text-xs text-primary hover:underline"><Download className="h-3 w-3" /> Download</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
