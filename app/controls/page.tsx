'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Boxes, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/badges';
import { fetchControlsWithMappings } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function ControlsPage() {
  const [controls, setControls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetchControlsWithMappings().then((c) => { setControls(c); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return controls.filter((c) => {
      const matchSearch = !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.control_id.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [controls, search, statusFilter]);

  const statuses = ['all', 'Effective', 'Implemented', 'Partially implemented', 'In progress', 'Not started'];

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Unified Control Library</h2>
          <p className="text-sm text-muted-foreground">One control, mapped to many frameworks — the core differentiator</p>
        </div>
      </div>

      {/* Cross-mapping highlight banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Boxes className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{controls.length} unified controls mapped across 3 frameworks</p>
            <p className="text-xs text-muted-foreground">
              {controls.reduce((acc, c) => acc + (c.mappings?.length || 0), 0)} total mappings · Implement once, satisfy multiple frameworks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search controls by ID, title, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Control list */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <Card key={c.id} className="transition-all hover:shadow-md cursor-pointer" >
            <button onClick={() => setSelected(c)} className="w-full text-left">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-primary">{c.control_id}</span>
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-muted-foreground">· {c.type}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    {c.mappings.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span
                          className="rounded px-2 py-1 text-[10px] font-semibold text-white"
                          style={{ background: m.framework_requirements?.frameworks?.color || '#2563eb' }}
                        >
                          {m.framework_requirements?.ref}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </button>
          </Card>
        ))}
      </div>

      {/* Detail drawer */}
      {selected && (
        <ControlDetailDrawer control={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ControlDetailDrawer({ control, onClose }: { control: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-y-auto scrollbar-thin bg-card shadow-2xl animate-slide-up">
        <div className="sticky top-0 flex items-center justify-between border-b bg-card/95 backdrop-blur p-5">
          <div>
            <span className="text-xs font-mono font-semibold text-primary">{control.control_id}</span>
            <h3 className="text-lg font-semibold">{control.title}</h3>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <StatusBadge status={control.status} />
            <span className="text-xs text-muted-foreground">{control.type} · {control.category}</span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
            <p className="mt-1 text-sm text-foreground">{control.description}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objective</p>
            <p className="mt-1 text-sm text-foreground">{control.objective}</p>
          </div>

          {/* Cross-framework mappings — the key differentiator */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Framework Mappings</p>
            <p className="mt-0.5 text-xs text-primary">One control satisfies {control.mappings.length} framework requirements</p>
            <div className="mt-2 space-y-2">
              {control.mappings.map((m: any, i: number) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: m.framework_requirements?.frameworks?.color }}>
                        {m.framework_requirements?.frameworks?.name}
                      </span>
                      <span className="text-sm font-medium">{m.framework_requirements?.ref}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{m.mapping_strength}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{m.coverage_pct}%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{m.framework_requirements?.title}</p>
                  {m.rationale && <p className="mt-1 text-xs italic text-muted-foreground">{m.rationale}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</p>
              <p className="mt-1 text-sm">{control.owner}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reviewer</p>
              <p className="mt-1 text-sm">{control.reviewer}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequency</p>
              <p className="mt-1 text-sm">{control.frequency}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Maturity</p>
              <p className="mt-1 text-sm">{control.maturity}/5</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Implementation Guidance</p>
            <p className="mt-1 text-sm text-foreground">{control.implementation_guidance}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Testing Procedure</p>
            <p className="mt-1 text-sm text-foreground">{control.testing_procedure}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
