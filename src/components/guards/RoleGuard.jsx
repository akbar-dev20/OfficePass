import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAuthState } from '../../lib/auth'
import LoadingState from '../ui/LoadingState'

/**
 * RoleGuard — route protection scaffold for Phase 1.
 *
 * Reads the (Phase-1 scaffolded) auth state:
 *   - no session  → redirect to /login (carrying the attempted location)
 *   - wrong role  → redirect to /unauthorized
 * Phase 2 swaps `getAuthState()` internals for real Supabase Auth + a
 * user_profiles role lookup; this component's contract stays identical.
 *
 * Usage: <Route element={<RoleGuard allowedRoles={[ROLES.COMPANY_ADMIN]} />}>…
 */
export default function RoleGuard({ allowedRoles }) {
  const [state, setState] = useState({ loading: true, session: null, role: null })
  const location = useLocation()

  useEffect(() => {
    let active = true
    getAuthState().then((result) => {
      if (active) setState({ loading: false, ...result })
    })
    return () => {
      active = false
    }
  }, [])

  if (state.loading) return <LoadingState label="Checking access…" fullPage />
  if (!state.session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(state.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
