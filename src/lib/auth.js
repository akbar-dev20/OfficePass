import { supabase, isSupabaseConfigured } from './supabase'

export { supabase, isSupabaseConfigured }

export const ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  COMPANY_ADMIN: 'company_admin',
  EMPLOYEE: 'employee',
}

export const ROLE_LABELS = {
  [ROLES.PLATFORM_ADMIN]: 'Platform Admin',
  [ROLES.COMPANY_ADMIN]: 'Company Admin',
  [ROLES.EMPLOYEE]: 'Employee',
}

/** Where each role lands after signing in. */
export function roleHomePath(role) {
  switch (role) {
    case ROLES.PLATFORM_ADMIN:
      return '/platform-admin'
    case ROLES.COMPANY_ADMIN:
      return '/company'
    case ROLES.EMPLOYEE:
      return '/employee'
    default:
      return '/'
  }
}

/**
 * Fetch the user_profiles row (plus the tenant company) for an auth user.
 * Returns null when the profile does not exist yet (e.g. email not confirmed).
 */
export async function fetchProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, role, status, company_id, company:companies(name, status)')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[OfficePass] profile lookup failed:', error.message)
    return null
  }
  return data
}

/** Full auth state: session, resolved role and profile (or all-null). */
export async function getAuthState() {
  if (!isSupabaseConfigured || !supabase) {
    return { session: null, role: null, profile: null }
  }
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { session: null, role: null, profile: null }

  const profile = await fetchProfile(session.user.id)
  return { session, role: profile?.role ?? null, profile }
}

/** Subscribe to Supabase auth events. Returns the subscription object. */
export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe() {} } } }
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session))
}

/** Sign the current user out (no-op when Supabase is not configured). */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/** Map raw Supabase auth errors to friendly copy for toasts. */
export function friendlyAuthError(error) {
  const message = error?.message || ''
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.'
  if (/email not confirmed/i.test(message))
    return 'Please confirm your email first — check your inbox for the verification link.'
  if (/already registered/i.test(message))
    return 'An account with this email already exists. Try signing in instead.'
  if (/rate limit/i.test(message)) return 'Too many attempts — please wait a moment and retry.'
  return message || 'Something went wrong. Please try again.'
}
