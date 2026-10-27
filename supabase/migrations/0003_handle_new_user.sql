-- ============================================================
-- OfficePass — 0003_handle_new_user.sql (Phase 3)
--
-- HOW TO RUN (manual, Supabase Dashboard):
--   1. Dashboard → SQL Editor → New query
--   2. Paste this ENTIRE file
--   3. Run
--
-- Purpose:
--   A trigger on auth.users that provisions tenant data the moment a user
--   signs up. Handles two flows:
--
--   1. Company-admin signup (RegisterCompany page):
--      raw_user_meta_data contains company_name / official_email /
--      contact_number / address / website / full_name / role='company_admin'.
--      → creates companies row (status 'pending'), user_profiles row
--        (role company_admin), company_settings row, and a default
--        office_locations row ("Head Office") so visit requests can be
--        raised immediately.
--
--   2. Invited-employee / plain signup:
--      no company metadata present → creates just a user_profiles row with
--      role 'employee' and no company. A company admin can later attach
--      them to a company (or the profile stays company-less until linked).
--
--   All statements are idempotent-safe (guard on existing rows).
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_meta       jsonb;
  v_role       text;
begin
  v_meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role := lower(coalesce(v_meta->>'role', 'employee'));

  -- ----------------------------------------------------------
  -- Flow 1: company-admin signup — company metadata present
  -- ----------------------------------------------------------
  if v_role = 'company_admin' and coalesce(v_meta->>'company_name', '') <> '' then
    -- Create the tenant company (skip if the official email already exists,
    -- e.g. a retried signup — reuse the existing company instead of failing).
    insert into public.companies (name, official_email, contact_number, address, website, status)
    values (
      v_meta->>'company_name',
      coalesce(v_meta->>'official_email', new.email),
      nullif(v_meta->>'contact_number', ''),
      nullif(v_meta->>'address', ''),
      nullif(v_meta->>'website', ''),
      'pending'
    )
    on conflict (official_email) do nothing;

    select id into v_company_id
    from public.companies
    where official_email = coalesce(v_meta->>'official_email', new.email)
    limit 1;

    -- Default office location so the admin can raise requests right away.
    if v_company_id is not null then
      insert into public.office_locations (company_id, name, address, city, country, is_active)
      values (
        v_company_id,
        'Head Office',
        nullif(v_meta->>'address', ''),
        null, null, true
      )
      on conflict (company_id, name) do nothing;

      -- Per-tenant settings row.
      insert into public.company_settings (company_id)
      values (v_company_id)
      on conflict (company_id) do nothing;
    end if;

    -- Admin profile.
    insert into public.user_profiles (id, company_id, full_name, email, role, status)
    values (
      new.id,
      v_company_id,
      coalesce(v_meta->>'full_name', split_part(new.email, '@', 1)),
      new.email,
      'company_admin',
      'active'
    )
    on conflict (id) do nothing;

  -- ----------------------------------------------------------
  -- Flow 2: invited employee (company pre-assigned by an admin)
  -- ----------------------------------------------------------
  elsif v_role = 'employee' and coalesce(v_meta->>'company_id', '') <> '' then
    insert into public.user_profiles (id, company_id, full_name, email, role, status)
    values (
      new.id,
      (v_meta->>'company_id')::uuid,
      coalesce(v_meta->>'full_name', split_part(new.email, '@', 1)),
      new.email,
      'employee',
      'active'
    )
    on conflict (id) do nothing;

  -- ----------------------------------------------------------
  -- Flow 3: plain signup — profile only, no company yet
  -- ----------------------------------------------------------
  else
    insert into public.user_profiles (id, company_id, full_name, email, role, status)
    values (
      new.id,
      null,
      coalesce(v_meta->>'full_name', split_part(new.email, '@', 1)),
      new.email,
      'employee',
      'active'
    )
    on conflict (id) do nothing;
  end if;

  return new;
exception
  when others then
    -- Never block the auth signup itself; log the failure for debugging.
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Attach the trigger (drop first so re-runs are safe).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- End of 0003_handle_new_user.sql
-- ============================================================
