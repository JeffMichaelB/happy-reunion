# AGENTS.md

## Cursor Cloud specific instructions

This is **happy-reunion** ("The Reunion Projects"), a single Next.js 16 (App Router,
React 19, Turbopack) + TypeScript + Tailwind v4 app backed by **Supabase**
(Postgres + Auth). Package manager is **npm**. Standard scripts live in
`package.json` (`dev`, `build`, `start`, `lint`, `typecheck`, `format`).

### Running locally (self-contained, no external secrets)

Production points at a hosted Supabase project, but the cloud VM runs a **local
Supabase stack** via Docker + the Supabase CLI so no external credentials are
needed. Docker and the Supabase CLI are preinstalled in the VM snapshot.

Start order (services are NOT auto-started by the update script):

1. **Docker daemon** — must be running before Supabase. If `docker ps` fails,
   start it: `sudo dockerd` (run in a background tmux session). The daemon is
   configured for `fuse-overlayfs` with the containerd snapshotter disabled
   (`/etc/docker/daemon.json`) and `iptables-legacy`; this is required for
   Docker-in-Docker here.
2. **Local Supabase** — from the repo root run `supabase start` (first run pulls
   images; subsequent runs are fast). It applies `supabase/migrations/*` and runs
   `supabase/seed.sql`. Get keys with `supabase status -o env`.
3. **`.env.local`** — point the app at local Supabase. It is gitignored and must
   be recreated per VM (values come from `supabase status -o env`):
   - `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>`
   - `SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>`
   - `TOKEN_ENCRYPTION_KEY=<any 32+ char string>` (required; encrypts Cal.com keys)
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
4. **Dev server** — `npm run dev` (Turbopack) serves http://localhost:3000.

### Non-obvious gotchas

- **Table-grant parity (critical):** the app's RLS-protected tables require
  `SELECT/INSERT/UPDATE/DELETE` grants for the `anon`/`authenticated` roles. The
  hosted Supabase project has these (historical Supabase default), but newer
  local Postgres images ship hardened default privileges that omit them, so
  queries fail with `permission denied for table ...`. `supabase/seed.sql`
  re-grants them on every `supabase start` / `supabase db reset`. If you add
  tables/migrations and hit `permission denied`, re-run `supabase db reset` (or
  re-apply `seed.sql`) so the grants cover the new tables.
- **Auth confirmations are off locally** (`supabase/config.toml`), so signup
  logs the user in immediately — no email step. (Mailpit is at
  http://127.0.0.1:54324 if you need to inspect outgoing email.)
- **New hosts are gated to `/host/onboarding`** (Cal.com connect) until they
  connect or click "I'll do this later" (sets a skip cookie → dashboard).
- **Cal.com and Resend are optional.** The app runs without them; Cal.com is
  configured per-host in Settings, and the in-app email composer is disabled
  unless `RESEND_API_KEY` is set.
- `middleware.ts` runs Supabase on every request, so the dev server needs valid
  `NEXT_PUBLIC_SUPABASE_*` env vars or all routes error.
