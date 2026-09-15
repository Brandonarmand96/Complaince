import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/sidebar';

export function AppShell() {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen px-6 pb-6 pt-20 md:ml-64 md:p-10">
        <section className="mx-auto max-w-xl space-y-4 rounded-lg border bg-card p-6 text-card-foreground">
          <header className="space-y-2">
            <p className="text-2xl font-semibold">ComplyOS</p>
            <p className="text-muted-foreground">Security compliance management platform</p>
          </header>
          <Outlet />
          <Button
            type="button"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            Toggle theme
          </Button>
        </section>
      </main>
    </>
  );
}
