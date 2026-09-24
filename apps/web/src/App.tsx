import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { navSections } from '@/components/layout/sidebar';
import { AuthPage } from '@/pages/AuthPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { useAuth } from '@/lib/auth';
function ProtectedShell() { const { user, loading } = useAuth(); if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Restoring your session…</div>; return user ? <AppShell /> : <Navigate to="/login" replace />; }

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="settings/sessions" element={<SessionsPage />} />
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
