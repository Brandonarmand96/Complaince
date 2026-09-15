'use client';

import { useEffect, useState } from 'react';
import { ClipboardCheck, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, ScoreRing } from '@/components/shared/badges';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('assessments')
      .select('*, programs(name, frameworks(name, color))')
      .eq('organization_id', ORG_ID)
      .then(({ data }) => { setAssessments(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Assessments</h2>
        <p className="text-sm text-muted-foreground">Gap, readiness, and internal assessments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((a) => (
          <Card key={a.id} className="transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ background: a.programs?.frameworks?.color || '#2563eb' }}>
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.type}</p>
                  </div>
                </div>
                {a.score != null && <ScoreRing score={Number(a.score)} size={56} />}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground"><User className="h-3 w-3" /> Assessor: {a.assessor}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3 w-3" /> Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}</div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  <span className="text-muted-foreground">{a.programs?.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
