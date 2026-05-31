# Supabase

## Active project (US East)

- **Name:** `happy-reunion-east`
- **Ref / id:** `itlkgkfzdbxclyrruosb`
- **Region:** `us-east-1`
- **API URL:** `https://itlkgkfzdbxclyrruosb.supabase.co`

## Setup checklist

1. **Project Settings → API:** copy URL, **anon** key, and **service_role** key into `.env.local` (never commit).
2. **Authentication → Providers → Email:** enable for email/password login. For the fastest local loop, you can turn off **Confirm email** under Auth settings (or use the confirmation link flow to `/auth/confirm`).
3. **Authentication → URL configuration**
   - **Site URL (production):** `https://happy-reunion.vercel.app` — dashboard password-reset emails use this; if it points at `localhost`, users see an unavailable/broken page.
   - **Redirect URLs:** add all of:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/confirm`
     - `https://happy-reunion.vercel.app/auth/callback`
     - `https://happy-reunion.vercel.app/auth/confirm`
   - Set `NEXT_PUBLIC_SITE_URL` in Vercel to the same production URL.
4. **Authentication → Email Templates → Reset password** (recommended): point the link at `/auth/confirm` so recovery lands in the app handler:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Reset password</a>
   ```
   The default `{{ .ConfirmationURL }}` also works once Site URL is production; the app handles hash redirects on any page.

## Scheduling (Cal.com)

Scheduling is managed externally via Cal.com. Hosts paste their Cal.com booking URL into settings and configure a webhook pointing at `/api/webhooks/calcom?slug={their-slug}`. The webhook handler creates/updates bookings in Supabase when guests book through Cal.com.
