'use client';

import { useState } from 'react';
import { FileBarChart, Download, FileText, Shield, AlertTriangle, ClipboardCheck, TrendingUp, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const reportTypes = [
  { id: 'gap', title: 'Gap Assessment Report', description: 'Detailed gap analysis against framework requirements.', icon: ClipboardCheck, category: 'Compliance' },
  { id: 'compliance', title: 'Compliance Status Report', description: 'Overall compliance posture across all frameworks.', icon: Shield, category: 'Compliance' },
  { id: 'exec', title: 'Executive Summary', description: 'Board-level compliance and risk overview.', icon: TrendingUp, category: 'Executive' },
  { id: 'risk', title: 'Risk Register & Treatment Report', description: 'All risks with inherent/residual scores and treatment plans.', icon: AlertTriangle, category: 'Risk' },
  { id: 'audit', title: 'Audit Report', description: 'Audit findings, test procedures, and conclusions.', icon: FileText, category: 'Audit' },
  { id: 'findings', title: 'Findings & CAPA Report', description: 'Open and closed findings with corrective actions.', icon: AlertTriangle, category: 'Audit' },
  { id: 'evidence', title: 'Evidence Inventory', description: 'Complete evidence repository with expiration status.', icon: FileText, category: 'Compliance' },
  { id: 'control', title: 'Control Implementation Report', description: 'Control status, maturity, and effectiveness.', icon: Shield, category: 'Compliance' },
  { id: 'vendor', title: 'Vendor Risk Report', description: 'Third-party risk ratings and assessment status.', icon: Building2, category: 'Governance' },
  { id: 'policy', title: 'Policy Status Report', description: 'Policy lifecycle, acknowledgment, and review status.', icon: FileText, category: 'Governance' },
  { id: 'asset', title: 'Asset Inventory Report', description: 'Complete asset inventory with classification.', icon: Building2, category: 'Governance' },
  { id: 'readiness', title: 'Certification Readiness Report', description: 'ISO 27001 certification readiness assessment.', icon: Shield, category: 'Compliance' },
];

const categories = ['All', 'Compliance', 'Risk', 'Audit', 'Executive', 'Governance'];

export default function ReportsPage() {
  const [category, setCategory] = useState('All');
  const [generating, setGenerating] = useState<string | null>(null);

  const filtered = category === 'All' ? reportTypes : reportTypes.filter((r) => r.category === category);

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Reports</h2>
        <p className="text-sm text-muted-foreground">Generate compliance, audit, risk, and executive reports</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.id} className="transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm" variant="default" onClick={() => handleGenerate(r.id)} disabled={generating === r.id}>
                    {generating === r.id ? 'Generating...' : 'Generate PDF'}
                  </Button>
                  <Button size="sm" variant="outline"><Download className="mr-1 h-3 w-3" /> Excel</Button>
                  <Button size="sm" variant="ghost"><Download className="mr-1 h-3 w-3" /> CSV</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Report Generation Pipeline</CardTitle>
          <CardDescription>How reports are generated in the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {['User requests', 'Permission validated', 'Job queued', 'Data retrieved', 'HTML rendered', 'PDF created', 'Uploaded to storage', 'User notified'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">{step}</span>
                {i < 7 && <span>→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
