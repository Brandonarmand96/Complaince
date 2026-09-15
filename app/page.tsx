'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, AlertTriangle, FileText, CheckCircle2,
  Clock, TrendingUp, ArrowRight, Boxes, ClipboardCheck,
  ShieldAlert, Building2, KanbanSquare,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreRing, StatusBadge, SeverityBadge } from '@/components/shared/badges';
import { fetchDashboardData, calculateComplianceScore, calculateEvidenceHealth, getReadinessScore } from '@/lib/data';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <DashboardSkeleton />;

  const { controls, programs, evidence, findings, risks, tasks, frameworks, policies, vendors, assets } = data;
  const overallScore = calculateComplianceScore(controls);
  const evidenceHealth = calculateEvidenceHealth(evidence);
  const readinessScore = getReadinessScore(controls, evidence, tasks);
  const openFindings = findings.filter((f: any) => !['Closed', 'Verified'].includes(f.status));
  const overdueTasks = tasks.filter((t: any) => t.status !== 'Completed' && new Date(t.due_date) < new Date());
  const highRisks = risks.filter((r: any) => r.inherent_risk >= 12);

  const controlStatusData = [
    { name: 'Effective', value: controls.filter((c: any) => c.status === 'Effective').length, color: 'hsl(142 71% 45%)' },
    { name: 'Implemented', value: controls.filter((c: any) => c.status === 'Implemented').length, color: 'hsl(199 89% 48%)' },
    { name: 'Partial', value: controls.filter((c: any) => c.status === 'Partially implemented').length, color: 'hsl(38 92% 50%)' },
    { name: 'In Progress', value: controls.filter((c: any) => c.status === 'In progress').length, color: 'hsl(27 87% 67%)' },
    { name: 'Not Started', value: controls.filter((c: any) => c.status === 'Not started').length, color: 'hsl(215 16% 47%)' },
  ].filter(d => d.value > 0);

  const programScores = programs.map((p: any) => {
    const programControls = controls; // simplified — all controls apply to all programs in demo
    return {
      name: p.frameworks?.name?.split(' ')[0] || p.name,
      score: calculateComplianceScore(programControls),
      color: p.frameworks?.color || '#2563eb',
    };
  });

  const trendData = [
    { month: 'Jan', score: 42, evidence: 35 },
    { month: 'Feb', score: 48, evidence: 40 },
    { month: 'Mar', score: 55, evidence: 48 },
    { month: 'Apr', score: 58, evidence: 55 },
    { month: 'May', score: 65, evidence: 62 },
    { month: 'Jun', score: 68, evidence: 68 },
    { month: 'Jul', score: Math.round(overallScore), evidence: Math.round(evidenceHealth) },
  ];

  return (
    <div className="space-y-6">
      {/* Hero scores */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex items-center gap-6 p-6">
            <ScoreRing score={overallScore} size={130} label="Overall" />
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organization</p>
                <p className="text-xl font-bold text-foreground">FinSecure Technologies Ltd.</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Controls: </span>
                  <span className="font-semibold">{controls.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Frameworks: </span>
                  <span className="font-semibold">{programs.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Readiness: </span>
                  <span className="font-semibold text-primary">{Math.round(readinessScore)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatCard icon={ShieldCheck} label="Evidence Health" value={`${Math.round(evidenceHealth)}%`} sub={`${evidence.length} items`} color="text-primary" />
        <StatCard icon={AlertTriangle} label="Open Findings" value={openFindings.length} sub={`${findings.filter((f:any)=>f.severity==='High').length} high severity`} color="text-destructive" />
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <MiniStat icon={Boxes} label="Controls" value={controls.length} href="/controls" />
        <MiniStat icon={ClipboardCheck} label="Assessments" value={3} href="/assessments" />
        <MiniStat icon={ShieldAlert} label="Risks" value={risks.length} href="/risks" />
        <MiniStat icon={KanbanSquare} label="Tasks" value={tasks.length} href="/tasks" />
        <MiniStat icon={Building2} label="Vendors" value={vendors.length} href="/vendors" />
        <MiniStat icon={FileText} label="Policies" value={policies.length} href="/policies" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Compliance Trend</CardTitle>
            <CardDescription>Overall compliance and evidence health over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="evidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="hsl(199 89% 48%)" strokeWidth={2} fill="url(#scoreGrad)" name="Compliance %" />
                <Area type="monotone" dataKey="evidence" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="url(#evidenceGrad)" name="Evidence Health %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Controls by Status</CardTitle>
            <CardDescription>Implementation status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={controlStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {controlStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-2">
              {controlStatusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program scores + Critical items */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Framework Scores</CardTitle>
            <CardDescription>Compliance by framework</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={programScores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={60} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} name="Score %">
                  {programScores.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Open Findings</CardTitle>
                <CardDescription>Requires remediation attention</CardDescription>
              </div>
              <Link href="/findings"><Button variant="ghost" size="sm" className="text-primary">View all <ArrowRight className="ml-1 h-3 w-3" /></Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openFindings.slice(0, 4).map((f: any) => (
                <Link key={f.id} href="/findings" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.type} · {f.owner}</p>
                  </div>
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                </Link>
              ))}
              {openFindings.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No open findings</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue tasks + High risks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Overdue Tasks</CardTitle>
                <CardDescription>{overdueTasks.length} task(s) past due date</CardDescription>
              </div>
              <Link href="/tasks"><Button variant="ghost" size="sm" className="text-primary">View all <ArrowRight className="ml-1 h-3 w-3" /></Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.slice(0, 4).map((t: any) => (
                <Link key={t.id} href="/tasks" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <Clock className="h-4 w-4 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.owner} · Due {new Date(t.due_date).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </Link>
              ))}
              {overdueTasks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No overdue tasks</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">High Risks</CardTitle>
                <CardDescription>Inherent risk score ≥ 12</CardDescription>
              </div>
              <Link href="/risks"><Button variant="ghost" size="sm" className="text-primary">View all <ArrowRight className="ml-1 h-3 w-3" /></Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highRisks.slice(0, 4).map((r: any) => (
                <Link key={r.id} href="/risks" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.risk_id} · {r.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">{r.inherent_risk}</span>
                    <StatusBadge status={r.status} />
                  </div>
                </Link>
              ))}
              {highRisks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No high risks</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value, href }: any) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="col-span-1 md:col-span-2 h-36 rounded-lg bg-muted" />
        <div className="h-36 rounded-lg bg-muted" />
        <div className="h-36 rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="col-span-2 h-80 rounded-lg bg-muted" />
        <div className="h-80 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
