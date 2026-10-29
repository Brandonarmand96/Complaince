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
import { ProgramsPage } from '@/pages/ProgramsPage';
import { ProgramFormPage } from '@/pages/ProgramFormPage';
import { ProgramDetailPage } from '@/pages/ProgramDetailPage';
import { RisksPage } from '@/pages/RisksPage';
import { RiskFormPage } from '@/pages/RiskFormPage';
import { RiskDetailPage } from '@/pages/RiskDetailPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { AssetFormPage } from '@/pages/AssetFormPage';
import { AssetDetailPage } from '@/pages/AssetDetailPage';
import { VendorsPage } from '@/pages/VendorsPage';
import { VendorFormPage } from '@/pages/VendorFormPage';
import { VendorDetailPage } from '@/pages/VendorDetailPage';
import { FindingsPage } from '@/pages/FindingsPage';
import { FindingFormPage } from '@/pages/FindingFormPage';
import { FindingDetailPage } from '@/pages/FindingDetailPage';
import { TasksPage } from '@/pages/TasksPage';
import { TaskFormPage } from '@/pages/TaskFormPage';
import { TaskDetailPage } from '@/pages/TaskDetailPage';
import { PoliciesPage } from '@/pages/PoliciesPage';
import { PolicyFormPage } from '@/pages/PolicyFormPage';
import { PolicyDetailPage } from '@/pages/PolicyDetailPage';
import { AuditsPage } from '@/pages/AuditsPage';
import { AuditFormPage } from '@/pages/AuditFormPage';
import { AuditDetailPage } from '@/pages/AuditDetailPage';
import { RolesPage } from '@/pages/RolesPage';
import { UserDirectoryPage } from '@/pages/UserDirectoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PlatformAdministrationPage } from '@/pages/PlatformAdministrationPage';
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
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="programs/new" element={<ProgramFormPage mode="create" />} />
          <Route path="programs/:id" element={<ProgramDetailPage />} />
          <Route path="programs/:id/edit" element={<ProgramFormPage mode="edit" />} />
          <Route path="risks" element={<RisksPage />} />
          <Route path="risks/new" element={<RiskFormPage mode="create" />} />
          <Route path="risks/:id" element={<RiskDetailPage />} />
          <Route path="risks/:id/edit" element={<RiskFormPage mode="edit" />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/new" element={<AssetFormPage mode="create" />} />
          <Route path="assets/:id" element={<AssetDetailPage />} />
          <Route path="assets/:id/edit" element={<AssetFormPage mode="edit" />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="vendors/new" element={<VendorFormPage mode="create" />} />
          <Route path="vendors/:id" element={<VendorDetailPage />} />
          <Route path="vendors/:id/edit" element={<VendorFormPage mode="edit" />} />
          <Route path="findings" element={<FindingsPage />} />
          <Route path="findings/new" element={<FindingFormPage mode="create" />} />
          <Route path="findings/:id" element={<FindingDetailPage />} />
          <Route path="findings/:id/edit" element={<FindingFormPage mode="edit" />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/new" element={<TaskFormPage mode="create" />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="tasks/:id/edit" element={<TaskFormPage mode="edit" />} />
          <Route path="policies" element={<PoliciesPage />} />
          <Route path="policies/new" element={<PolicyFormPage mode="create" />} />
          <Route path="policies/:id" element={<PolicyDetailPage />} />
          <Route path="policies/:id/edit" element={<PolicyFormPage mode="edit" />} />
          <Route path="audits" element={<AuditsPage />} />
          <Route path="audits/new" element={<AuditFormPage mode="create" />} />
          <Route path="audits/:id" element={<AuditDetailPage />} />
          <Route path="audits/:id/edit" element={<AuditFormPage mode="edit" />} />
          <Route path="users" element={<UserDirectoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/roles" element={<RolesPage />} />
          <Route path="platform/organizations" element={<PlatformAdministrationPage />} />
          <Route path="controls" element={<ControlsPage />} />
          <Route path="controls/new" element={<ControlFormPage mode="create" />} />
          <Route path="controls/:id" element={<ControlDetailPage />} />
          <Route path="controls/:id/edit" element={<ControlFormPage mode="edit" />} />
          {navSections.flatMap((section) => section.items)
            .filter((item) => !['/dashboard','/settings/workflows','/approvals','/organizations','/business-units','/departments','/locations','/frameworks','/controls','/programs','/risks','/assets','/vendors','/findings','/tasks','/policies','/audits','/users','/settings'].includes(item.href))
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
