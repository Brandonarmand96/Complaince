'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Boxes, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, ScoreRing } from '@/components/shared/badges';
import { fetchProgramDetail, calculateComplianceScore } from '@/lib/data';

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgramDetail(params.id).then((p) => { setProgram(p); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  if (!program) return <p className="text-muted-foreground">Program not found.</p>;

  const controls = program.program_controls.map((pc: any) => pc.controls).filter(Boolean);
  const score = calculateComplianceScore(controls);
  const implemented = controls.filter((c: any) => ['Effective', 'Implemented'].includes(c.status)).length;
  const partial = controls.filter((c: any) => c.status === 'Partially implemented').length;
  const inProgress = controls.filter((c: any) => c.status === 'In progress').length;
  const notStarted = controls.filter((c: any) => c.status === 'Not started').length;

  const stages = ['Planning', 'Scoping', 'Gap assessment', 'Remediation', 'Internal assessment', 'External audit', 'Certification', 'Continuous monitoring'];
  const currentStageIdx = stages.indexOf(program.stage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/programs"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{program.name}</h2>
          <p className="text-sm text-muted-foreground">{program.frameworks?.name} {program.frameworks?.version} · Owner: {program.owner}</p>
        </div>
        <ScoreRing score={score} size={100} label="Score" />
      </div>

      {/* Stage tracker */}
      <Card>
        <CardHeader><CardTitle className="text-base">Program Stages</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stages.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${i < currentStageIdx ? 'bg-success/15 text-success' : i === currentStageIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i < currentStageIdx && <CheckCircle2 className="h-3 w-3" />}
                  {stage}
                </div>
                {i < stages.length - 1 && <div className={`h-0.5 w-4 ${i < currentStageIdx ? 'bg-success' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Implemented</p><p className="text-2xl font-bold text-success">{implemented}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Partial</p><p className="text-2xl font-bold text-warning">{partial}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-primary">{inProgress}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Not Started</p><p className="text-2xl font-bold text-muted-foreground">{notStarted}</p></CardContent></Card>
      </div>

      {/* Controls list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Control Implementation Status</CardTitle>
          <CardDescription>{controls.length} controls linked to this program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {controls.map((c: any) => (
              <Link key={c.id} href="/controls" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                <Boxes className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{c.control_id} — {c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.category} · {c.owner}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
