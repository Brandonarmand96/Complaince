import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export function AppShell() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const frame = window.requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('main h1');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
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
