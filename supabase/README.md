# Supabase

## Active project (US East)

- **Name:** `happy-reunion-east`
- **Ref / id:** `itlkgkfzdbxclyrruosb`
- **Region:** `us-east-1`
- **API URL:** `https://itlkgkfzdbxclyrruosb.supabase.co`

## Setup checklist

1. **Project Settings → API:** copy URL, **anon** key, and **service_role** key into `.env.local` (never commit).
2. **Authentication → Providers → Email:** enable for email/password login. For the fastest local loop, you can turn off **Confirm email** under Auth settings (or use the confirmation link flow to `/auth/confirm`).
3. **Authentication → URL configuration:** Site URL + Redirect URLs — e.g. `http://localhost:3000/auth/callback`, `http://localhost:3000/auth/confirm`, and your Vercel URLs.

## Scheduling (Cal.com)

Scheduling is managed externally via Cal.com. Hosts paste their Cal.com booking URL into settings and configure a webhook pointing at `/api/webhooks/calcom?slug={their-slug}`. The webhook handler creates/updates bookings in Supabase when guests book through Cal.com.
