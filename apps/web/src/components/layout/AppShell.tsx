import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export function AppShell() {
  return (
    <>
      <Sidebar />
      <div className="min-h-screen md:ml-64">
        <Topbar />
        <main className="p-6 md:p-10">
          <section className="mx-auto max-w-xl space-y-4 rounded-lg border bg-card p-6 text-card-foreground">
            <Outlet />
            <Button
              type="button"
              onClick={() => document.documentElement.classList.toggle('dark')}
            >
              Toggle theme
            </Button>
          </section>
        </main>
      </div>
    </>
  );
}
