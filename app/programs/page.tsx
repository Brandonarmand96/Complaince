'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, ArrowRight, Plus, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, ScoreRing } from '@/components/shared/badges';
import { fetchDashboardData, calculateComplianceScore } from '@/lib/data';

export default function ProgramsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  const { programs, controls } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Compliance Programs</h2>
          <p className="text-sm text-muted-foreground">Active framework adoption and progress tracking</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New Program</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((p: any) => {
          const score = calculateComplianceScore(controls);
          const stageColors: Record<string, string> = {
            'Planning': 'bg-muted text-muted-foreground',
            'Gap assessment': 'bg-warning/15 text-warning',
            'Remediation': 'bg-primary/15 text-primary',
            'Continuous monitoring': 'bg-success/15 text-success',
          };
          return (
            <Link key={p.id} href={`/programs/${p.id}`}>
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ background: p.frameworks?.color || '#2563eb' }}>
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.frameworks?.name} {p.frameworks?.version}</p>
                      </div>
                    </div>
                    <ScoreRing score={score} size={64} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" /> {p.owner}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Target: {new Date(p.target_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${stageColors[p.stage] || 'bg-muted'}`}>{p.stage}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{p.scope}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
