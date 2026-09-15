'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/badges';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';
import { cn } from '@/lib/utils';

const HEATMAP_COLORS: Record<string, string> = {
  '1-2': 'hsl(142 71% 45% / 0.15)',
  '3-4': 'hsl(142 71% 45% / 0.3)',
  '5-6': 'hsl(38 92% 50% / 0.3)',
  '7-9': 'hsl(38 92% 50% / 0.5)',
  '10-12': 'hsl(0 72% 51% / 0.4)',
  '13-16': 'hsl(0 72% 51% / 0.6)',
  '17-20': 'hsl(0 72% 51% / 0.8)',
  '21-25': 'hsl(0 72% 51% / 0.95)',
};

function getHeatmapColor(score: number): string {
  if (score <= 2) return HEATMAP_COLORS['1-2'];
  if (score <= 4) return HEATMAP_COLORS['3-4'];
  if (score <= 6) return HEATMAP_COLORS['5-6'];
  if (score <= 9) return HEATMAP_COLORS['7-9'];
  if (score <= 12) return HEATMAP_COLORS['10-12'];
  if (score <= 16) return HEATMAP_COLORS['13-16'];
  if (score <= 20) return HEATMAP_COLORS['17-20'];
  return HEATMAP_COLORS['21-25'];
}

export default function RisksPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [view, setView] = useState<'register' | 'heatmap'>('register');

  useEffect(() => {
    supabase.from('risks').select('*').eq('organization_id', ORG_ID).then(({ data }) => { setRisks(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  const filtered = risks.filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.risk_id.toLowerCase().includes(search.toLowerCase()));

  // Heatmap grid: 5x5 (likelihood x impact)
  const grid: any[][] = [];
  for (let impact = 5; impact >= 1; impact--) {
    const row: any[] = [];
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const cellRisks = risks.filter((r) => r.likelihood === likelihood && r.impact === impact);
      row.push({ likelihood, impact, score: likelihood * impact, risks: cellRisks });
    }
    grid.push(row);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Risk Register</h2>
          <p className="text-sm text-muted-foreground">Risk identification, scoring, and treatment</p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {(['register', 'heatmap'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn('rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors', view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {v === 'register' ? 'Risk Register' : 'Heatmap'}
            </button>
          ))}
        </div>
      </div>

      {view === 'register' && (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search risks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3 font-semibold">ID</th>
                    <th className="p-3 font-semibold">Risk</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Owner</th>
                    <th className="p-3 font-semibold text-center">Inherent</th>
                    <th className="p-3 font-semibold text-center">Residual</th>
                    <th className="p-3 font-semibold">Treatment</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => setSelected(r)}>
                      <td className="p-3 font-mono text-xs text-primary">{r.risk_id}</td>
                      <td className="p-3 max-w-xs"><p className="truncate font-medium">{r.title}</p></td>
                      <td className="p-3 text-xs text-muted-foreground">{r.category}</td>
                      <td className="p-3 text-xs">{r.owner}</td>
                      <td className="p-3 text-center"><span className="inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold" style={{ background: getHeatmapColor(r.inherent_risk), color: r.inherent_risk >= 12 ? 'hsl(0 72% 51%)' : 'inherit' }}>{r.inherent_risk}</span></td>
                      <td className="p-3 text-center"><span className="inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold" style={{ background: getHeatmapColor(r.residual_risk), color: r.residual_risk >= 12 ? 'hsl(0 72% 51%)' : 'inherit' }}>{r.residual_risk}</span></td>
                      <td className="p-3 text-xs">{r.treatment}</td>
                      <td className="p-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {view === 'heatmap' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex">
                  <div className="flex flex-col justify-end pb-8 pr-2">
                    <span className="rotate-180 text-xs font-semibold text-muted-foreground" style={{ writingMode: 'vertical-rl' }}>Impact →</span>
                  </div>
                  <div className="flex-1">
                    <table className="w-full">
                      <tbody>
                        {grid.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell) => (
                              <td key={cell.likelihood} className="p-1">
                                <div
                                  className="flex h-20 items-center justify-center rounded-lg border-2 transition-all hover:scale-105 cursor-pointer relative group"
                                  style={{ background: getHeatmapColor(cell.score), borderColor: cell.risks.length > 0 ? 'hsl(var(--foreground) / 0.3)' : 'transparent' }}
                                >
                                  {cell.risks.length > 0 && (
                                    <div className="flex flex-col items-center">
                                      <span className="text-lg font-bold">{cell.risks.length}</span>
                                      <span className="text-[10px] text-muted-foreground">risk(s)</span>
                                    </div>
                                  )}
                                  {cell.risks.length === 0 && <span className="text-xs text-muted-foreground/40">{cell.score}</span>}
                                  {cell.risks.length > 0 && (
                                    <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-card px-3 py-2 text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                      {cell.risks.map((r) => (<div key={r.id}>{r.risk_id}: {r.title}</div>))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-2 text-center text-xs font-semibold text-muted-foreground">Likelihood →</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md overflow-y-auto scrollbar-thin bg-card shadow-2xl animate-slide-up">
            <div className="sticky top-0 flex items-center justify-between border-b bg-card/95 backdrop-blur p-5">
              <div>
                <span className="text-xs font-mono font-semibold text-primary">{selected.risk_id}</span>
                <h3 className="font-semibold">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Description</p><p className="mt-1">{selected.description}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Category</p><p>{selected.category}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Owner</p><p>{selected.owner}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Threat</p><p>{selected.threat}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Vulnerability</p><p>{selected.vulnerability}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Inherent Risk</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl font-bold" style={{ color: selected.inherent_risk >= 12 ? 'hsl(0 72% 51%)' : 'inherit' }}>{selected.inherent_risk}</span>
                    <span className="text-xs text-muted-foreground">L{selected.likelihood} × I{selected.impact}</span>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Residual Risk</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl font-bold" style={{ color: selected.residual_risk >= 12 ? 'hsl(0 72% 51%)' : 'inherit' }}>{selected.residual_risk}</span>
                    <span className="text-xs text-muted-foreground">L{selected.residual_likelihood} × I{selected.residual_impact}</span>
                  </div>
                </div>
              </div>
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Treatment</p><p className="mt-1 font-medium">{selected.treatment}</p></div>
              {selected.treatment_plan && <div><p className="text-xs font-semibold uppercase text-muted-foreground">Treatment Plan</p><p className="mt-1">{selected.treatment_plan}</p></div>}
              <div><StatusBadge status={selected.status} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
