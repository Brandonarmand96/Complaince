import { Search, Bell, HelpCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Compliance posture overview' },
  '/programs': { title: 'Compliance Programs', subtitle: 'Framework adoption and progress' },
  '/frameworks': { title: 'Framework Library', subtitle: 'Compliance frameworks and requirements' },
  '/controls': { title: 'Unified Control Library', subtitle: 'One control, many frameworks' },
  '/assessments': { title: 'Assessments', subtitle: 'Gap and readiness assessments' },
  '/evidence': { title: 'Evidence Repository', subtitle: 'Compliance evidence and validation' },
  '/risks': { title: 'Risk Register', subtitle: 'Risk identification and treatment' },
  '/policies': { title: 'Policy Management', subtitle: 'Policy lifecycle and acknowledgment' },
  '/vendors': { title: 'Vendor Management', subtitle: 'Third-party risk and assessments' },
  '/assets': { title: 'Asset Inventory', subtitle: 'Hardware, software, and cloud assets' },
  '/findings': { title: 'Audit Findings', subtitle: 'Findings and corrective actions' },
  '/tasks': { title: 'Tasks', subtitle: 'Remediation and work tracking' },
  '/reports': { title: 'Reports', subtitle: 'Compliance and audit reporting' },
  '/users': { title: 'Users', subtitle: 'Team members and access' },
  '/settings': { title: 'Settings', subtitle: 'Organization configuration' },
};

export function Topbar() {
  const { pathname } = useLocation();
  const match = pageTitles[pathname] || pageTitles[`/${pathname.split('/')[1]}`] || { title: 'ComplyOS', subtitle: '' };

  useEffect(() => {
    document.title = match.title === 'ComplyOS' ? 'ComplyOS' : `${match.title} | ComplyOS`;
  }, [match.title]);

  return (
    <header aria-label="Page header" className="sticky top-0 z-30 flex min-h-[4rem] items-center gap-3 border-b bg-background/80 py-3 pl-20 pr-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-lg font-semibold text-foreground">{match.title}</p>
        {match.subtitle && (
          <p className="truncate text-xs text-muted-foreground">{match.subtitle}</p>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            disabled
            aria-label="Global search (not available yet)"
            title="Global search is planned and not available yet"
            placeholder="Search controls, evidence, risks..."
            className="h-9 w-64 rounded-lg border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="button" disabled aria-label="Help (not available yet)" title="Help is not available yet" className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground disabled:opacity-50">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button type="button" disabled aria-label="Notifications (not available yet)" title="Notifications are not available yet" className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground disabled:opacity-50">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
