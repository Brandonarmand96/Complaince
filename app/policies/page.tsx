'use client';

import { useEffect, useState } from 'react';
import { Scale, Plus, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/badges';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('policies').select('*').eq('organization_id', ORG_ID).then(({ data }) => { setPolicies(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Policy Management</h2>
          <p className="text-sm text-muted-foreground">Policy lifecycle, approval, and acknowledgment tracking</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New Policy</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {policies.map((p) => {
          const ackPct = p.total_acknowledgments_required > 0 ? Math.round((p.acknowledgment_count / p.total_acknowledgments_required) * 100) : 0;
          return (
            <Card key={p.id} className="transition-all hover:shadow-md cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Scale className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{p.number}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="mt-1 text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.category} · v{p.version}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Acknowledgments</span>
                    <span className="font-semibold">{p.acknowledgment_count}/{p.total_acknowledgments_required}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full transition-all ${ackPct >= 90 ? 'bg-success' : ackPct >= 50 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${ackPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Owner: {p.owner}</span>
                    <span>Review: {p.review_date ? new Date(p.review_date).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
