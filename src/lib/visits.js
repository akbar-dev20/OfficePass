import { supabase } from './supabase'

/**
 * Phase 3 data layer — visit request lifecycle.
 *
 * Status flow: pending -> approved | rejected -> checked_in -> checked_out
 * (cancelled / expired / no_show are terminal side-states set by admins or
 * future Edge Functions; the UI only drives the happy path above.)
 *
 * All queries run with the caller's JWT, so RLS (0002) scopes every result
 * to the caller's company automatically.
 */

export const VISIT_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'checked_in',
  'checked_out',
  'expired',
  'no_show',
]

export const PURPOSES = [
  { value: 'business_meeting', label: 'Business meeting' },
  { value: 'interview', label: 'Interview' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'contractor_work', label: 'Contractor work' },
  { value: 'client_visit', label: 'Client visit' },
  { value: 'other', label: 'Other' },
]

export const DURATIONS = [
  { value: '30_minutes', label: '30 minutes' },
  { value: '1_hour', label: '1 hour' },
  { value: '2_hours', label: '2 hours' },
  { value: '4_hours', label: '4 hours' },
  { value: 'full_day', label: 'Full day' },
]

export function purposeLabel(value) {
  return PURPOSES.find((p) => p.value === value)?.label ?? value
}

export function durationLabel(value) {
  return DURATIONS.find((d) => d.value === value)?.label ?? value
}

/** Short human-readable code for reception, e.g. "OP-7K3QX9". */
export function generatePassCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `OP-${code}`
}

/** Opaque token embedded in the QR payload. */
export function generatePassToken() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * The signed-in user's employees row (host record). Employees and company
 * admins both get one via the signup trigger / admin screens.
 */
export async function fetchMyEmployeeRecord() {
  const { data, error } = await supabase
    .from('employees')
    .select('id, company_id, employee_code, full_name, office_location_id')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Office locations for the caller's company (RLS-scoped). */
export async function fetchOfficeLocations() {
  const { data, error } = await supabase
    .from('office_locations')
    .select('id, name, address, city, country')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

/**
 * Create a visitor request + its primary visitor in one round trip.
 * `payload` = { office_location_id, purpose, purpose_notes, visit_date,
 *               start_time, duration, visitor: { full_name, email, phone, organisation } }
 */
export async function createVisitorRequest(payload) {
  const me = await fetchMyEmployeeRecord()
  if (!me) throw new Error('No employee record is linked to your account yet. Ask your company admin to add you to the team directory.')

  const { visitor, ...request } = payload
  const { data, error } = await supabase
    .from('visitor_requests')
    .insert({
      ...request,
      company_id: me.company_id,
      employee_id: me.id,
      status: 'pending',
    })
    .select('id, pass_code, status')
    .single()
  if (error) throw error

  const { error: visitorError } = await supabase.from('visitors').insert({
    request_id: data.id,
    full_name: visitor.full_name,
    email: visitor.email,
    phone: visitor.phone,
    organisation: visitor.organisation || null,
    is_primary: true,
  })
  if (visitorError) {
    // Roll the request back so no orphan pending request lingers.
    await supabase.from('visitor_requests').delete().eq('id', data.id)
    throw visitorError
  }
  return data
}

/**
 * Requests visible to the caller (RLS scopes to their company).
 * `filters` = { status?, mine? } — `mine` restricts to the caller's host record.
 */
export async function fetchVisitorRequests(filters = {}) {
  let query = supabase
    .from('visitor_requests')
    .select(
      `id, purpose, purpose_notes, visit_date, start_time, duration, status,
       pass_code, pass_token, checked_in_at, checked_out_at, created_at,
       office_location:office_locations (name, city),
       employee:employees (full_name, employee_code),
       visitors (full_name, email, phone, organisation, is_primary)`,
    )
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.mine) {
    const me = await fetchMyEmployeeRecord()
    if (me) query = query.eq('employee_id', me.id)
  }
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/** Single request with everything needed for the detail / pass screens. */
export async function fetchVisitorRequest(requestId) {
  const { data, error } = await supabase
    .from('visitor_requests')
    .select(
      `id, purpose, purpose_notes, visit_date, start_time, duration, status,
       pass_code, pass_token, checked_in_at, checked_out_at, created_at,
       office_location:office_locations (name, address, city),
       employee:employees (full_name, employee_code, email),
       visitors (full_name, email, phone, organisation, is_primary),
       approvals:visit_approvals (decision, reason, decided_at)`,
    )
    .eq('id', requestId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Approve a pending request — stamps pass codes and writes the audit row. */
export async function approveVisitorRequest(requestId, reason = null) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle()

  const { error } = await supabase
    .from('visitor_requests')
    .update({ status: 'approved', pass_code: generatePassCode(), pass_token: generatePassToken() })
    .eq('id', requestId)
    .eq('status', 'pending')
  if (error) throw error

  const { error: approvalError } = await supabase.from('visit_approvals').insert({
    request_id: requestId,
    decided_by: profile?.id,
    decision: 'approved',
    reason,
  })
  if (approvalError) throw approvalError
}

/** Reject a pending request with an optional reason. */
export async function rejectVisitorRequest(requestId, reason = null) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle()

  const { error } = await supabase
    .from('visitor_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('status', 'pending')
  if (error) throw error

  const { error: approvalError } = await supabase.from('visit_approvals').insert({
    request_id: requestId,
    decided_by: profile?.id,
    decision: 'rejected',
    reason,
  })
  if (approvalError) throw approvalError
}

/** Cancel a pending request (host or admin). */
export async function cancelVisitorRequest(requestId) {
  const { error } = await supabase
    .from('visitor_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('status', 'pending')
  if (error) throw error
}

/** Reception actions — only valid from the approved state. */
export async function checkInVisitor(requestId) {
  const { error } = await supabase
    .from('visitor_requests')
    .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('status', 'approved')
  if (error) throw error
}

export async function checkOutVisitor(requestId) {
  const { error } = await supabase
    .from('visitor_requests')
    .update({ status: 'checked_out', checked_out_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('status', 'checked_in')
  if (error) throw error
}

/** Dashboard counters for the caller's company. */
export async function fetchDashboardStats() {
  const today = new Date().toISOString().slice(0, 10)
  const [pending, todays, checkedIn] = await Promise.all([
    supabase.from('visitor_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('visitor_requests').select('id', { count: 'exact', head: true }).eq('visit_date', today),
    supabase.from('visitor_requests').select('id', { count: 'exact', head: true }).eq('status', 'checked_in'),
  ])
  return {
    pending: pending.count ?? 0,
    today: todays.count ?? 0,
    checkedIn: checkedIn.count ?? 0,
  }
}
