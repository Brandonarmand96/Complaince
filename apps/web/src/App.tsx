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
import { OrganizationEditPage } from '@/pages/OrganizationEditPage';
import { BusinessUnitsPage } from '@/pages/BusinessUnitsPage';
import { BusinessUnitFormPage } from '@/pages/BusinessUnitFormPage';
import { BusinessUnitDetailPage } from '@/pages/BusinessUnitDetailPage';
import { DepartmentsPage } from '@/pages/DepartmentsPage';
import { DepartmentFormPage } from '@/pages/DepartmentFormPage';
import { DepartmentDetailPage } from '@/pages/DepartmentDetailPage';
import { LocationsPage } from '@/pages/LocationsPage';
import { LocationCreatePage } from '@/pages/LocationCreatePage';
import { LocationDetailPage } from '@/pages/LocationDetailPage';
import { LocationEditPage } from '@/pages/LocationEditPage';
import { FrameworksPage } from '@/pages/FrameworksPage';
import { FrameworkFormPage } from '@/pages/FrameworkFormPage';
import { FrameworkDetailPage } from '@/pages/FrameworkDetailPage';
import { ControlsPage } from '@/pages/ControlsPage';
import { ControlFormPage } from '@/pages/ControlFormPage';
import { ControlDetailPage } from '@/pages/ControlDetailPage';
import { FrameworkMigrationPage } from '@/pages/FrameworkMigrationPage';
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
          <Route path="organizations/:id/edit" element={<OrganizationEditPage />} />
          <Route path="business-units" element={<BusinessUnitsPage />} />
          <Route path="business-units/new" element={<BusinessUnitFormPage mode="create" />} />
          <Route path="business-units/:id" element={<BusinessUnitDetailPage />} />
          <Route path="business-units/:id/edit" element={<BusinessUnitFormPage mode="edit" />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="departments/new" element={<DepartmentFormPage mode="create" />} />
          <Route path="departments/:id" element={<DepartmentDetailPage />} />
          <Route path="departments/:id/edit" element={<DepartmentFormPage mode="edit" />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="locations/new" element={<LocationCreatePage />} />
          <Route path="locations/:id" element={<LocationDetailPage />} />
          <Route path="locations/:id/edit" element={<LocationEditPage />} />
          <Route path="frameworks" element={<FrameworksPage />} />
          <Route path="frameworks/new" element={<FrameworkFormPage mode="create" />} />
          <Route path="frameworks/:id" element={<FrameworkDetailPage />} />
          <Route path="frameworks/:id/edit" element={<FrameworkFormPage mode="edit" />} />
          <Route path="framework-migrations" element={<FrameworkMigrationPage />} />
          <Route path="controls" element={<ControlsPage />} />
          <Route path="controls/new" element={<ControlFormPage mode="create" />} />
          <Route path="controls/:id" element={<ControlDetailPage />} />
          <Route path="controls/:id/edit" element={<ControlFormPage mode="edit" />} />
          {navSections.flatMap((section) => section.items)
            .filter((item) => !['/dashboard','/settings/workflows','/approvals','/organizations','/business-units','/departments','/locations','/frameworks','/controls'].includes(item.href))
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
