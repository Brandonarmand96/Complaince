'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('frameworks').select('*').then(({ data }) => {
      setFrameworks(data || []);
      if (data) {
        Promise.all(data.map((f) => supabase.from('framework_requirements').select('*').eq('framework_id', f.id))).then((res) => {
          const map: Record<string, any[]> = {};
          data.forEach((f, i) => { map[f.id] = res[i].data || []; });
          setRequirements(map);
        });
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Framework Library</h2>
        <p className="text-sm text-muted-foreground">Compliance frameworks and their requirements</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {frameworks.map((f) => {
          const reqs = requirements[f.id] || [];
          const domains = [...new Set(reqs.map((r: any) => r.domain))];
          return (
            <Card key={f.id} className="overflow-hidden">
              <div className="h-1.5" style={{ background: f.color }} />
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: f.color }}>
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{f.name}</h3>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">v{f.version}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{f.publisher}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{reqs.length}</strong> requirements</span>
                  <span><strong className="text-foreground">{domains.length}</strong> domains</span>
                  <span>Effective: <strong className="text-foreground">{new Date(f.effective_date).toLocaleDateString()}</strong></span>
                </div>

                <div className="mt-4 space-y-1">
                  {domains.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.color }} />
                      <span className="text-muted-foreground">{d}</span>
                      <span className="text-muted-foreground/60">({reqs.filter((r: any) => r.domain === d).length})</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 max-h-48 overflow-y-auto scrollbar-thin space-y-1">
                  {reqs.map((r: any) => (
                    <div key={r.id} className="flex items-center gap-2 rounded border p-2 text-xs">
                      <span className="font-mono font-semibold" style={{ color: f.color }}>{r.ref}</span>
                      <span className="text-muted-foreground">{r.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
