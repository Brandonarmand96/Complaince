import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { navSections } from '@/components/layout/sidebar';
import { AuthPage } from '@/pages/AuthPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { InviteUserPage } from '@/pages/InviteUserPage';
import { NewPasswordPage } from '@/pages/NewPasswordPage';
import { ResetRequestPage } from '@/pages/ResetRequestPage';
import { VerificationResultPage } from '@/pages/VerificationResultPage';
import { InvitationAcceptancePage } from '@/pages/InvitationAcceptancePage';
import { MfaChallengePage } from '@/pages/MfaChallengePage';
import { MfaSetupPage } from '@/pages/MfaSetupPage';
import { useAuth } from '@/lib/auth';
import { WorkflowSettingsPage } from '@/pages/WorkflowSettingsPage';
import { ApprovalsPage } from '@/pages/ApprovalsPage';
import { CommentsPage } from '@/pages/CommentsPage';
import { ResourceReviewPage } from '@/pages/ResourceReviewPage';
import { OrganizationsPage } from '@/pages/OrganizationsPage';
import { OrganizationCreatePage } from '@/pages/OrganizationCreatePage';
import { OrganizationDetailPage } from '@/pages/OrganizationDetailPage';
function ProtectedShell() { const { user, loading } = useAuth(); if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Restoring your session…</div>; return user ? <AppShell /> : <Navigate to="/login" replace />; }

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="verify-email" element={<VerificationResultPage />} />
        <Route path="forgot-password" element={<ResetRequestPage />} />
        <Route path="reset-password" element={<NewPasswordPage />} />
        <Route path="accept-invitation" element={<InvitationAcceptancePage />} />
        <Route path="mfa-challenge" element={<MfaChallengePage />} />
        <Route element={<ProtectedShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="settings/sessions" element={<SessionsPage />} />
          <Route path="users/invite" element={<InviteUserPage />} />
          <Route path="settings/mfa" element={<MfaSetupPage />} />
          <Route path="settings/workflows" element={<WorkflowSettingsPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="comments/:resourceType/:resourceId" element={<CommentsPage />} />
          <Route path="reviews/:resourceType/:resourceId" element={<ResourceReviewPage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="organizations/new" element={<OrganizationCreatePage />} />
          <Route path="organizations/:id" element={<OrganizationDetailPage />} />
          {navSections.flatMap((section) => section.items)
            .filter((item) => !['/dashboard','/settings/workflows','/approvals','/organizations'].includes(item.href))
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
