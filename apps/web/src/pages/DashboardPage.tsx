import { PriorityBadge, ScoreRing, SeverityBadge, StatusBadge } from '@/components/shared/badges';
import { SetupPanel } from '@/components/setup/SetupPanel';

export function DashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>The local application is running. Compliance features are coming next.</p>
      <SetupPanel />
      <section aria-labelledby="component-preview-title" className="space-y-4 border-t pt-4">
        <h2 id="component-preview-title" className="text-sm font-semibold">Component preview — sample values</h2>
        <p className="text-sm text-muted-foreground">These examples are not live compliance results.</p>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="Approved" />
          <StatusBadge status="Pending review" />
          <StatusBadge status="Expired" />
          <StatusBadge status="Draft" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Priority:</span><PriorityBadge priority="High" />
          <span>Severity:</span><SeverityBadge severity="Critical" />
        </div>
        <div className="flex flex-wrap gap-4">
          <ScoreRing score={45} label="Sample low" />
          <ScoreRing score={65} label="Sample medium" />
          <ScoreRing score={85} label="Sample high" />
        </div>
      </section>
    </div>
  );
}
