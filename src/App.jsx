import { Route, Routes } from 'react-router-dom'

import PublicLayout from './components/layouts/PublicLayout'
import VisitorLayout from './components/layouts/VisitorLayout'
import PlatformAdminLayout from './components/layouts/PlatformAdminLayout'
import CompanyAdminLayout from './components/layouts/CompanyAdminLayout'
import EmployeeLayout from './components/layouts/EmployeeLayout'
import RoleGuard from './components/auth/RoleGuard'

import Home from './pages/public/Home'
import Login from './pages/public/Login'
import ForgotPassword from './pages/public/ForgotPassword'
import ResetPassword from './pages/public/ResetPassword'
import RegisterCompany from './pages/public/RegisterCompany'
import RegistrationStatus from './pages/public/RegistrationStatus'
import Unauthorized from './pages/public/Unauthorized'
import NotFound from './pages/public/NotFound'

import VisitorRegistration from './pages/visitor/VisitorRegistration'
import VisitSubmitted from './pages/visitor/VisitSubmitted'
import CheckStatus from './pages/visitor/CheckStatus'
import VerifyVisitorEmail from './pages/visitor/VerifyVisitorEmail'
import VisitorPortal from './pages/visitor/VisitorPortal'
import VisitorRequestDetail from './pages/visitor/VisitorRequestDetail'
import VisitorPass from './pages/visitor/VisitorPass'

import PlatformAdminDashboard from './pages/dashboard/PlatformAdminDashboard'
import CompanyAdminDashboard from './pages/dashboard/CompanyAdminDashboard'
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard'
import PlaceholderPage from './pages/dashboard/PlaceholderPage'

import NewVisitorRequest from './pages/employee/NewVisitorRequest'
import MyVisits from './pages/employee/MyVisits'
import RequestDetail from './pages/visits/RequestDetail'
import ApprovalQueue from './pages/admin/ApprovalQueue'

import { ROLES } from './lib/auth'

/**
 * Phase 1 route skeleton.
 * Public + visitor routes are live UI; dashboard areas are guarded shells
 * (RoleGuard redirects to /login until Supabase Auth is wired in Phase 2).
 */
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register-company" element={<RegisterCompany />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/registration-status" element={<RegistrationStatus />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>
      {/* Visitor routes */}
      <Route element={<VisitorLayout />}>
        <Route path="/visit/:officeCode" element={<VisitorRegistration />} />
        <Route path="/visit/submitted" element={<VisitSubmitted />} />
        <Route path="/check-status" element={<CheckStatus />} />
        <Route path="/verify-visitor-email" element={<VerifyVisitorEmail />} />
        <Route path="/visitor-portal" element={<VisitorPortal />} />
        <Route path="/visitor-portal/requests/:requestId" element={<VisitorRequestDetail />} />
        <Route path="/visitor-portal/pass/:requestId" element={<VisitorPass />} />
      </Route>
      {/* Role-guarded dashboard shells (Phase 1 placeholders) */}
      <Route element={<RoleGuard allowedRoles={[ROLES.PLATFORM_ADMIN]} />}>
        <Route path="/platform-admin" element={<PlatformAdminLayout />}>
          <Route index element={<PlatformAdminDashboard />} />
          <Route path="*" element={<PlaceholderPage section="Platform Admin" />} />
        </Route>
      </Route>
      <Route element={<RoleGuard allowedRoles={[ROLES.COMPANY_ADMIN]} />}>
        <Route path="/company" element={<CompanyAdminLayout />}>
          <Route index element={<CompanyAdminDashboard />} />
          <Route path="approvals" element={<ApprovalQueue />} />
          <Route path="requests/:requestId" element={<RequestDetail />} />
          <Route path="*" element={<PlaceholderPage section="Company Admin" />} />
        </Route>
      </Route>
      <Route element={<RoleGuard allowedRoles={[ROLES.EMPLOYEE]} />}>
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="new-request" element={<NewVisitorRequest />} />
          <Route path="visits" element={<MyVisits />} />
          <Route path="visits/:requestId" element={<RequestDetail />} />
          <Route path="*" element={<PlaceholderPage section="Employee" />} />
        </Route>
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
