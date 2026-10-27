import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  getAuthState,
  fetchProfile,
  onAuthStateChange,
  ROLES,
  ROLE_LABELS,
} from '../../lib/auth'

/**
 * AuthProvider — Phase 2. Single source of truth for the Supabase session
 * and the user_profiles row. Loads once on mount, then follows auth events
 * (SIGNED_IN / SIGNED_OUT / USER_UPDATED) so guards and layouts stay in sync.
 */
const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, session: null, profile: null, role: null })

  const applyState = useCallback((session, profile) => {
    setState({
      loading: false,
      session: session ?? null,
      profile: profile ?? null,
      role: profile?.role ?? null,
    })
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!state.session?.user?.id) return null
    const profile = await fetchProfile(state.session.user.id)
    applyState(state.session, profile)
    return profile
  }, [state.session, applyState])

  useEffect(() => {
    let active = true
    getAuthState().then((result) => {
      if (active) applyState(result.session, result.profile)
    })
    return () => {
      active = false
    }
  }, [applyState])

  useEffect(() => {
    const { data } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        applyState(null, null)
        return
      }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        const profile = await fetchProfile(session.user.id)
        applyState(session, profile)
      }
    })
    return () => data?.subscription?.unsubscribe?.()
  }, [applyState])

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.session),
      displayName:
        state.profile?.full_name || state.session?.user?.email?.split('@')[0] || 'Signed-in user',
      roleLabel: ROLE_LABELS[state.role] || state.role || '—',
      refreshProfile,
    }),
    [state, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Access the live auth state anywhere inside <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export { ROLES }
