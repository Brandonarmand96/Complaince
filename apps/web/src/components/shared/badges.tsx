import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export interface ScoreRingProps {
  /** Percentage from 0 to 100, supplied by the caller. */
  score: number;
  /** Diameter in pixels. */
  size?: number;
  label?: string;
}

export interface PriorityBadgeProps {
  priority: string;
}

export interface SeverityBadgeProps {
  severity: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariant(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant,
        className
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function statusVariant(status: string): string {
  const s = status.toLowerCase();
  if (['effective', 'implemented', 'approved', 'compliant', 'closed', 'completed', 'published', 'active', 'deployed'].includes(s))
    return 'bg-success/15 text-success';
  if (['partially implemented', 'in progress', 'pending review', 'in review', 'remediation in progress', 'mitigating', 'under investigation'].includes(s))
    return 'bg-warning/15 text-warning';
  if (['not started', 'backlog', 'to do', 'open', 'identified', 'blocked', 'draft', 'rejected', 'created', 'planning', 'gap assessment'].includes(s))
    return 'bg-muted text-muted-foreground';
  if (['not implemented', 'overdue', 'expired', 'major nonconformity', 'high', 'critical', 'suspended', 'locked', 'non-compliant'].includes(s))
    return 'bg-destructive/15 text-destructive';
  if (['corrective action planned', 'verification pending', 'minor nonconformity', 'medium', 'observation', 'low', 'continuous monitoring', 'remediation'].includes(s))
    return 'bg-primary/15 text-primary';
  return 'bg-muted text-muted-foreground';
}

export function ScoreRing({ score, size = 120, label }: ScoreRingProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(142 71% 45%)' : score >= 60 ? 'hsl(38 92% 50%)' : 'hsl(0 72% 51%)';

  return (
    <div role="img" aria-label={`${label || 'Score'}: ${Math.round(score)}%`} className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg aria-hidden="true" focusable="false" width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div aria-hidden="true" className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-foreground">{Math.round(score)}%</span>
        {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const s = priority.toLowerCase();
  const variant =
    s === 'high' ? 'bg-destructive/15 text-destructive' :
    s === 'medium' ? 'bg-warning/15 text-warning' :
    'bg-muted text-muted-foreground';
  return (
    <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', variant)}>
      {priority}
    </span>
  );
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const s = severity.toLowerCase();
  const variant =
    s === 'high' || s === 'critical' ? 'bg-destructive/15 text-destructive' :
    s === 'medium' ? 'bg-warning/15 text-warning' :
    'bg-primary/15 text-primary';
  return (
    <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', variant)}>
      {severity}
    </span>
  );
}
