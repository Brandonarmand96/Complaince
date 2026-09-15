import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { navSections } from '@/components/layout/sidebar';

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Session enforcement is added with authentication. This shell contains no tenant data. */}
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          {navSections.flatMap((section) => section.items)
            .filter((item) => item.href !== '/dashboard')
            .map((item) => (
              <Route key={item.href} path={item.href} element={
                <div className="space-y-2">
                  <h1 className="text-xl font-semibold">{item.label}</h1>
                  <p>This module is planned and has not been implemented yet.</p>
                </div>
              } />
            ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
