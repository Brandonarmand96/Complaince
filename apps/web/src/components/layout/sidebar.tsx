import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  FolderKanban,
  Boxes,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  KanbanSquare,
  FileBarChart,
  Building2,
  Users,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
  Scale,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: '',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Compliance',
    items: [
      { label: 'Programs', href: '/programs', icon: FolderKanban },
      { label: 'Frameworks', href: '/frameworks', icon: ShieldCheck },
      { label: 'Controls', href: '/controls', icon: Boxes },
      { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
      { label: 'Evidence', href: '/evidence', icon: FileText },
    ],
  },
  {
    title: 'Risk & Governance',
    items: [
      { label: 'Risk Register', href: '/risks', icon: ShieldAlert },
      { label: 'Policies', href: '/policies', icon: Scale },
      { label: 'Vendors', href: '/vendors', icon: Building2 },
      { label: 'Assets', href: '/assets', icon: Warehouse },
    ],
  },
  {
    title: 'Audit & Remediation',
    items: [
      { label: 'Findings', href: '/findings', icon: AlertTriangle },
      { label: 'Tasks', href: '/tasks', icon: KanbanSquare },
    ],
  },
  {
    title: 'Reports',
    items: [{ label: 'Reports', href: '/reports', icon: FileBarChart }],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-foreground">ComplyOS</span>
          <span className="text-[11px] text-muted-foreground">Security Compliance</span>
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title || 'main'} className="mb-1">
            {section.title && (
              <button
                type="button"
                aria-expanded={!collapsedSections.has(section.title)}
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {section.title}
                {collapsedSections.has(section.title) ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
            {(!section.title || !collapsedSections.has(section.title)) && (
              <div className="mt-0.5 space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      {item.label}
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg bg-accent/50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            MC
          </div>
          <div className="flex-1 leading-tight">
            <p className="text-sm font-medium text-foreground">Marcus Chen (demo)</p>
            <p className="text-[11px] text-muted-foreground">Compliance Manager</p>
          </div>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border bg-card shadow-sm md:hidden"
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        onKeyDown={(event) => {
          if (event.key === 'Escape') setMobileOpen(false);
        }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : 'hidden md:block'
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
