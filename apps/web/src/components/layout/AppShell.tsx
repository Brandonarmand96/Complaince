import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export function AppShell() {
  return (
    <>
      <Sidebar />
      <div className="min-h-screen md:ml-64">
        <Topbar />
        <main className="p-6 md:p-10">
          <section className="mx-auto max-w-7xl text-foreground">
            <Outlet />
          </section>
        </main>
      </div>
    </>
  );
}
