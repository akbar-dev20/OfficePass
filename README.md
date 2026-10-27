# OfficePass

Multi-company office visitor management web app.

**Phase 1 scope (this codebase):** UI foundation — full route skeleton, design
tokens, reusable component library, layouts and key public/visitor pages.
Supabase Auth, database wiring and Edge Functions are **not** active yet; every
page that will need them is scaffolded and clearly marked for Phase 2+.

## Stack

- React 18 + Vite (JavaScript/JSX — no TypeScript)
- React Router v6
- React Hook Form + Zod
- Lucide React icons
- Plain CSS driven centrally by `src/styles/tokens.css` (Tropical Heat palette)
- Supabase JS client (`src/lib/supabase.js`, wired from Phase 2)

## Getting started

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev            # http://localhost:5173
npm run build          # production build
```

## Environment variables (frontend, browser-safe only)

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (RLS is the real guard) |

Never put secrets in `VITE_` variables — they are embedded in the shipped bundle.

## Secrets to configure outside the repo

| Secret | Where it goes |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **Edge Function secret** (`supabase secrets set ...`) — server-side only |
| `RESEND_API_KEY` | Supabase **Edge Function secret** — transactional email |
| Site / redirect URLs | Supabase Dashboard → Authentication → URL Configuration (add prod URL + `http://localhost:5173`) |

## Database

`supabase/migrations/0001_initial_schema.sql` — Phase 1 initial schema:
15 tables, constraints (unique QR token, exactly-one-primary-visitor, unique
employee code per company), foreign keys and indexes. Run it manually:

1. Supabase Dashboard → **SQL Editor** → **New query**
2. Paste the entire file → **Run**

RLS is **enabled** on every table, but **no policies** are created yet —
policies ship in Phase 2. Until then only the service-role key can touch data.

## Phase 1 dev preview of guarded dashboards

Role guards currently redirect to `/login` (no auth yet). For local layout
preview only, you can simulate a role — **dev scaffold, removed in Phase 2**:

```js
localStorage.setItem('op_dev_role', 'platform_admin' | 'company_admin' | 'employee')
localStorage.removeItem('op_dev_role') // clear
```

## Roadmap

- **Phase 2** — Supabase Auth wiring, RLS policies, company registration + login flows
- **Phase 3** — visit request lifecycle, approvals, QR passes, Edge Functions (Resend email)
