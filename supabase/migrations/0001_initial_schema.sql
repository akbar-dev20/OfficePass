-- ============================================================
-- OfficePass — 0001_initial_schema.sql (Phase 1)
--
-- HOW TO RUN (manual, Supabase Dashboard):
--   1. Dashboard → SQL Editor → New query
--   2. Paste this ENTIRE file
--   3. Run
--
-- Notes:
--   * Tables/indexes use IF NOT EXISTS so accidental re-runs are safe.
--   * Status domains use CHECK constraints (no enums) to keep migrations
--     easy to evolve.
--   * RLS is ENABLED on every table at the end of this file, but NO
--     policies are created yet (Phase 2). With RLS on and zero policies,
--     anon/authenticated clients can read nothing by design — server-side
--     work uses the service-role key via Edge Functions in the interim.
--   * Secrets (SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY) live in Edge
--     Function secrets — never in the frontend or this repo.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- companies — tenant root
-- ------------------------------------------------------------
create table if not exists public.companies (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 120),
  official_email  text not null unique,
  contact_number  text,
  address         text,
  website         text,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected', 'suspended')),
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- user_profiles — app-level profile for every auth user (1:1 auth.users)
-- ------------------------------------------------------------
create table if not exists public.user_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  company_id  uuid references public.companies (id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  role        text not null default 'employee'
              check (role in ('platform_admin', 'company_admin', 'employee')),
  status      text not null default 'active'
              check (status in ('active', 'invited', 'suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- platform admins are global; every other role must belong to a company
  constraint user_profiles_company_required
    check (role = 'platform_admin' or company_id is not null)
);

create index if not exists idx_user_profiles_company on public.user_profiles (company_id);
create index if not exists idx_user_profiles_role    on public.user_profiles (role);

-- ------------------------------------------------------------
-- office_locations — physical venues a company operates
-- ------------------------------------------------------------
create table if not exists public.office_locations (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete cascade,
  name        text not null,
  address     text,
  city        text,
  country     text,
  timezone    text not null default 'UTC',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);

create index if not exists idx_office_locations_company on public.office_locations (company_id);

-- ------------------------------------------------------------
-- employees — staff directory per company (visitors reference these)
-- ------------------------------------------------------------
create table if not exists public.employees (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references public.companies (id) on delete cascade,
  user_id            uuid references public.user_profiles (id) on delete set null,
  employee_code      text not null,
  full_name          text not null,
  email              text,
  phone              text,
  department         text,
  designation        text,
  office_location_id uuid references public.office_locations (id) on delete set null,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- an employee code is unique within its company
  unique (company_id, employee_code)
);

create index if not exists idx_employees_company on public.employees (company_id);
create index if not exists idx_employees_user    on public.employees (user_id);

-- ------------------------------------------------------------
-- visitor_requests — one pre-registration request per visit
-- ------------------------------------------------------------
create table if not exists public.visitor_requests (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references public.companies (id) on delete cascade,
  office_location_id uuid not null references public.office_locations (id) on delete restrict,
  employee_id        uuid not null references public.employees (id) on delete restrict,
  purpose            text not null
                     check (purpose in ('business_meeting', 'interview', 'delivery',
                                        'contractor_work', 'client_visit', 'other')),
  purpose_notes      text,
  visit_date         date not null,
  start_time         time not null,
  duration           text not null default '2_hours'
                     check (duration in ('30_minutes', '1_hour', '2_hours',
                                         '4_hours', 'full_day')),
  status             text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected', 'cancelled',
                                       'checked_in', 'checked_out', 'expired', 'no_show')),
  pass_code          text unique,            -- short human-readable code for reception
  pass_token         text unique,            -- opaque token embedded in the QR payload
  checked_in_at      timestamptz,
  checked_out_at     timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- a visit cannot be scheduled in the past
  constraint visitor_requests_future_date check (visit_date >= current_date)
);

create index if not exists idx_visitor_requests_company  on public.visitor_requests (company_id);
create index if not exists idx_visitor_requests_employee on public.visitor_requests (employee_id);
create index if not exists idx_visitor_requests_date     on public.visitor_requests (visit_date);
create index if not exists idx_visitor_requests_status   on public.visitor_requests (status);

-- ------------------------------------------------------------
-- visitors — people attached to a request (1 primary + up to 5 additional)
-- ------------------------------------------------------------
create table if not exists public.visitors (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.visitor_requests (id) on delete cascade,
  full_name   text not null,
  email       text not null,
  phone       text not null,
  organisation text,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now(),
  -- at most one primary visitor per request
  unique (request_id, email)
);

create index if not exists idx_visitors_request on public.visitors (request_id);
create unique index if not exists idx_visitors_primary
  on public.visitors (request_id) where is_primary;

-- ------------------------------------------------------------
-- visit_approvals — audit trail of approve/reject decisions
-- ------------------------------------------------------------
create table if not exists public.visit_approvals (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.visitor_requests (id) on delete cascade,
  decided_by  uuid not null references public.user_profiles (id) on delete restrict,
  decision    text not null check (decision in ('approved', 'rejected')),
  reason      text,
  decided_at  timestamptz not null default now()
);

create index if not exists idx_visit_approvals_request on public.visit_approvals (request_id);

-- ------------------------------------------------------------
-- visitor_email_verifications — magic-link style email confirmation
-- ------------------------------------------------------------
create table if not exists public.visitor_email_verifications (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.visitor_requests (id) on delete cascade,
  email       text not null,
  token       text not null unique,
  expires_at  timestamptz not null,
  verified_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_visitor_verif_request on public.visitor_email_verifications (request_id);

-- ------------------------------------------------------------
-- reception_sessions — front-desk check-in/out sessions (audit)
-- ------------------------------------------------------------
create table if not exists public.reception_sessions (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.visitor_requests (id) on delete cascade,
  action      text not null check (action in ('check_in', 'check_out')),
  acted_by    uuid references public.user_profiles (id) on delete set null,
  acted_at    timestamptz not null default now(),
  notes       text
);

create index if not exists idx_reception_sessions_request on public.reception_sessions (request_id);

-- ------------------------------------------------------------
-- notification_log — every outbound email (audit + retry bookkeeping)
-- ------------------------------------------------------------
create table if not exists public.notification_log (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid references public.visitor_requests (id) on delete set null,
  recipient     text not null,
  template      text not null,
  payload       jsonb not null default '{}'::jsonb,
  status        text not null default 'queued'
                check (status in ('queued', 'sent', 'failed')),
  sent_at       timestamptz,
  error         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_notification_log_request on public.notification_log (request_id);

-- ------------------------------------------------------------
-- audit_log — security-relevant events across the platform
-- ------------------------------------------------------------
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.user_profiles (id) on delete set null,
  company_id  uuid references public.companies (id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_log_company on public.audit_log (company_id);
create index if not exists idx_audit_log_actor   on public.audit_log (actor_id);

-- ------------------------------------------------------------
-- company_settings — per-tenant configuration
-- ------------------------------------------------------------
create table if not exists public.company_settings (
  company_id              uuid primary key references public.companies (id) on delete cascade,
  auto_approve_visits     boolean not null default false,
  require_email_verification boolean not null default true,
  max_visitors_per_request   integer not null default 5 check (max_visitors_per_request between 1 and 20),
  pass_validity_hours     integer not null default 24,
  notify_admin_emails     text[] not null default '{}',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ------------------------------------------------------------
-- email_outbox — transactional email queue drained by a cron/Edge Function
-- ------------------------------------------------------------
create table if not exists public.email_outbox (
  id          uuid primary key default gen_random_uuid(),
  to_email    text not null,
  template    text not null,
  payload     jsonb not null default '{}'::jsonb,
  status      text not null default 'pending'
              check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts    integer not null default 0,
  last_error  text,
  created_at  timestamptz not null default now(),
  sent_at     timestamptz
);

create index if not exists idx_email_outbox_status on public.email_outbox (status);

-- ------------------------------------------------------------
-- updated_at trigger — keep updated_at honest on mutable tables
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'companies', 'user_profiles', 'office_locations', 'employees',
    'visitor_requests', 'company_settings'
  ]
  loop
    execute format('drop trigger if exists trg_set_updated_at on public.%I', t);
    execute format(
      'create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- Row Level Security — ENABLED everywhere, policies arrive in Phase 2.
-- With RLS on and no policies, anon/authenticated clients see nothing;
-- server-side code uses the service-role key (Edge Functions only).
-- ------------------------------------------------------------
alter table public.companies                    enable row level security;
alter table public.user_profiles                enable row level security;
alter table public.office_locations             enable row level security;
alter table public.employees                    enable row level security;
alter table public.visitor_requests             enable row level security;
alter table public.visitors                     enable row level security;
alter table public.visit_approvals              enable row level security;
alter table public.visitor_email_verifications  enable row level security;
alter table public.reception_sessions           enable row level security;
alter table public.notification_log             enable row level security;
alter table public.audit_log                    enable row level security;
alter table public.company_settings             enable row level security;
alter table public.email_outbox                 enable row level security;

-- ============================================================
-- End of 0001_initial_schema.sql — RLS policies ship in Phase 2.
-- ============================================================
