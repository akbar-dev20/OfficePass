-- ============================================================
-- OfficePass — 0002_rls_policies.sql (Phase 2)
--
-- HOW TO RUN (manual, Supabase Dashboard):
--   1. Dashboard → SQL Editor → New query
--   2. Paste this ENTIRE file
--   3. Run
--
-- Notes:
--   * All statements are idempotent (drop policy if exists / create policy).
--   * RLS is already ENABLED on every table (0001). This file adds the
--     policies that let authenticated users read/write their own tenant data.
--   * Helper functions use SECURITY DEFINER to avoid RLS recursion when
--     checking the caller's own role/company.
-- ============================================================

-- ------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to bypass RLS on user_profiles)
-- ------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid();
$$;

create or replace function public.current_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.user_profiles where id = auth.uid();
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select true from public.user_profiles where id = auth.uid() and role = 'platform_admin'),
    false
  );
$$;

create or replace function public.is_company_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select true from public.user_profiles where id = auth.uid() and role = 'company_admin'),
    false
  );
$$;

-- ------------------------------------------------------------
-- companies
-- ------------------------------------------------------------
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
  for select using (
    is_platform_admin()
    or id = current_user_company_id()
  );

drop policy if exists companies_insert on public.companies;
create policy companies_insert on public.companies
  for insert with check (is_platform_admin());

drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies
  for update using (is_platform_admin())
  with check (is_platform_admin());

-- ------------------------------------------------------------
-- user_profiles
-- ------------------------------------------------------------
drop policy if exists user_profiles_select on public.user_profiles;
create policy user_profiles_select on public.user_profiles
  for select using (
    id = auth.uid()
    or is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  );

drop policy if exists user_profiles_insert on public.user_profiles;
create policy user_profiles_insert on public.user_profiles
  for insert with check (
    id = auth.uid()
    or is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  );

drop policy if exists user_profiles_update on public.user_profiles;
create policy user_profiles_update on public.user_profiles
  for update using (
    id = auth.uid()
    or is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  )
  with check (
    id = auth.uid()
    or is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  );

-- ------------------------------------------------------------
-- office_locations
-- ------------------------------------------------------------
drop policy if exists office_locations_select on public.office_locations;
create policy office_locations_select on public.office_locations
  for select using (
    is_platform_admin()
    or company_id = current_user_company_id()
  );

drop policy if exists office_locations_write on public.office_locations;
create policy office_locations_write on public.office_locations
  for all using (
    is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  )
  with check (
    is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  );

-- ------------------------------------------------------------
-- employees
-- ------------------------------------------------------------
drop policy if exists employees_select on public.employees;
create policy employees_select on public.employees
  for select using (
    is_platform_admin()
    or company_id = current_user_company_id()
  );

drop policy if exists employees_write on public.employees;
create policy employees_write on public.employees
  for all using (
    is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  )
  with check (
    is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  );

-- ------------------------------------------------------------
-- visitor_requests
-- ------------------------------------------------------------
drop policy if exists visitor_requests_select on public.visitor_requests;
create policy visitor_requests_select on public.visitor_requests
  for select using (
    is_platform_admin()
    or company_id = current_user_company_id()
  );

drop policy if exists visitor_requests_insert on public.visitor_requests;
create policy visitor_requests_insert on public.visitor_requests
  for insert with check (
    is_platform_admin()
    or company_id = current_user_company_id()
  );

drop policy if exists visitor_requests_update on public.visitor_requests;
create policy visitor_requests_update on public.visitor_requests
  for update using (
    is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  )
  with check (
    is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  );

-- ------------------------------------------------------------
-- visitors (scoped via the parent request's company)
-- ------------------------------------------------------------
drop policy if exists visitors_select on public.visitors;
create policy visitors_select on public.visitors
  for select using (
    is_platform_admin()
    or exists (
      select 1 from public.visitor_requests vr
      where vr.id = request_id
        and vr.company_id = current_user_company_id()
    )
  );

drop policy if exists visitors_write on public.visitors;
create policy visitors_write on public.visitors
  for all using (
    is_platform_admin()
    or exists (
      select 1 from public.visitor_requests vr
      where vr.id = request_id
        and vr.company_id = current_user_company_id()
    )
  )
  with check (
    is_platform_admin()
    or exists (
      select 1 from public.visitor_requests vr
      where vr.id = request_id
        and vr.company_id = current_user_company_id()
    )
  );

-- ------------------------------------------------------------
-- visit_approvals
-- ------------------------------------------------------------
drop policy if exists visit_approvals_select on public.visit_approvals;
create policy visit_approvals_select on public.visit_approvals
  for select using (
    is_platform_admin()
    or exists (
      select 1 from public.visitor_requests vr
      where vr.id = request_id
        and vr.company_id = current_user_company_id()
    )
  );

drop policy if exists visit_approvals_insert on public.visit_approvals;
create policy visit_approvals_insert on public.visit_approvals
  for insert with check (
    is_platform_admin()
    or exists (
      select 1 from public.visitor_requests vr
      where vr.id = request_id
        and vr.company_id = current_user_company_id()
    )
  );

-- ------------------------------------------------------------
-- company_settings
-- ------------------------------------------------------------
drop policy if exists company_settings_select on public.company_settings;
create policy company_settings_select on public.company_settings
  for select using (
    is_platform_admin()
    or company_id = current_user_company_id()
  );

drop policy if exists company_settings_write on public.company_settings;
create policy company_settings_write on public.company_settings
  for all using (
    is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  )
  with check (
    is_platform_admin()
    or (is_company_admin() and company_id = current_user_company_id())
  );

-- ------------------------------------------------------------
-- audit_log (read-only for platform admins; inserts allowed for any auth user)
-- ------------------------------------------------------------
drop policy if exists audit_log_select on public.audit_log;
create policy audit_log_select on public.audit_log
  for select using (is_platform_admin());

drop policy if exists audit_log_insert on public.audit_log;
create policy audit_log_insert on public.audit_log
  for insert with check (auth.uid() is not null);

-- ============================================================
-- End of 0002_rls_policies.sql
-- ============================================================
