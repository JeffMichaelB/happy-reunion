# Supabase (Phase 1)

## Active project (US East)

- **Name:** `happy-reunion-east`
- **Ref / id:** `itlkgkfzdbxclyrruosb`
- **Region:** `us-east-1`
- **API URL:** `https://itlkgkfzdbxclyrruosb.supabase.co`

Migrations `phase1_schema_core` and `phase1_schema_storage` were applied via Supabase MCP (same schema as `migrations/20250406120000_phase1_schema.sql`).

The older **`happy-reunion`** project in **`us-west-1`** was **paused** to stay within the free-tier project limit. You can **delete** it in the dashboard if you no longer need it.

## Setup checklist

1. **Project Settings → API:** copy URL, **anon** key, and **service_role** key into `.env.local` (never commit).
2. **Authentication → Providers → Email:** enable for email/password testing. For the fastest local loop, you can turn off **Confirm email** under Auth settings (or use the confirmation link flow to `/auth/confirm`).
3. **Authentication → Providers → Google:** enable; Web client ID/secret from Google Cloud.
4. Under Google provider, add the same scopes as `lib/google-scopes.ts` (Calendar events + Gmail send + openid/email/profile).
5. **Authentication → URL configuration:** Site URL + Redirect URLs — e.g. `http://localhost:3000/auth/callback`, `http://localhost:3000/auth/confirm`, and your Vercel URLs.

`host_google_credentials` has RLS enabled with **no** policies for `authenticated` / `anon`, so only the **service role** (used in `/auth/callback` and `/api/google/verify`) can read/write encrypted tokens.
