import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import LoadingState from '../ui/LoadingState'

/**
 * RoleGuard — Phase 2. Route protection driven by the live Supabase session:
 *   - auth still loading → full-page spinner
 *   - no session        → redirect to /login (carrying the attempted location)
 *   - wrong role        → redirect to /unauthorized
 *
 * Usage: <Route element={<RoleGuard allowedRoles={[ROLES.COMPANY_ADMIN]} />}>…
 */
export default function RoleGuard({ allowedRoles }) {
  const { loading, session, role } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingState label="Checking access…" fullPage />
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
