'use client';

import { Search, Bell, HelpCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Compliance posture overview' },
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
  const pathname = usePathname();
  const match = pageTitles[pathname] || pageTitles[`/${pathname.split('/')[1]}`] || { title: 'ComplyOS', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md md:ml-64">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-foreground">{match.title}</h1>
        {match.subtitle && (
          <p className="text-xs text-muted-foreground">{match.subtitle}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search controls, evidence, risks..."
            className="h-9 w-64 rounded-lg border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>
      </div>
    </header>
  );
}
