-- Cal.com API-key-only hardening + per-host isolation
-- =============================================================================
-- Context: OAuth is being retired (Cal.com closed new Platform/OAuth signups
-- Dec 15 2025). Every host authenticates to Cal.com with a personal API key,
-- stored encrypted. Each host is fully isolated: their credentials, guests,
-- bookings, and webhook are scoped to their auth.users id.
--
-- This migration:
--   1. Adds a per-host webhook secret (replaces single global env secret).
--   2. Drops dead OAuth columns from host_calcom_credentials.
--   3. Documents the intentionally service-role-only credentials access.
--   4. Re-affirms guest dedup + booking idempotency keys (idempotent).
--   5. Leaves existing per-host RLS on guests/bookings/email_* intact
--      (already correct) and asserts it for safety.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Per-host webhook secret
--    Each host's Cal.com webhook is registered with its own random secret,
--    stored encrypted (AES-256-GCM via lib/crypto/tokens.ts). The webhook
--    handler looks up the host by ?slug= and verifies the x-cal-signature-256
--    HMAC against THIS secret, not a shared env value.
-- ---------------------------------------------------------------------------
alter table public.host_calcom_credentials
  add column if not exists webhook_secret_encrypted text;

-- ---------------------------------------------------------------------------
-- 2. Drop dead OAuth columns (API-key-only going forward)
--    Safe: no new OAuth connections are possible, and these are nullable.
-- ---------------------------------------------------------------------------
alter table public.host_calcom_credentials
  drop column if exists access_token_encrypted,
  drop column if exists refresh_token_encrypted,
  drop column if exists expires_at;

-- ---------------------------------------------------------------------------
-- 3. Credentials access is service-role only (BY DESIGN, not a bug)
--    RLS is enabled with NO policies for authenticated users, so the anon /
--    authenticated clients can never read API keys or webhook secrets. All
--    access goes through createAdminClient() (service role) in server code.
--    Documented here so future readers don't "fix" the missing policies.
-- ---------------------------------------------------------------------------
alter table public.host_calcom_credentials enable row level security;
-- (intentionally no authenticated policies)

-- ---------------------------------------------------------------------------
-- 4. Idempotency / dedup keys (idempotent re-assertion)
--    - bookings.cal_com_booking_uid unique: lets the webhook UPSERT instead of
--      INSERT, so retries / duplicate deliveries can't double-insert.
--    - guests (host_id, lower(email)) unique: findOrCreateGuestId can't create
--      duplicate guests for the same host; cross-host never collides because
--      host_id is part of the key.
-- ---------------------------------------------------------------------------
create unique index if not exists bookings_calcom_uid_unique
  on public.bookings (cal_com_booking_uid)
  where cal_com_booking_uid is not null;

-- Replace the plain (host_id, email) uniqueness with case-insensitive email.
alter table public.guests drop constraint if exists guests_host_id_email_key;
create unique index if not exists guests_host_email_lower_unique
  on public.guests (host_id, lower(email));

-- ---------------------------------------------------------------------------
-- 5. Assert per-host isolation RLS exists (defensive; these were created in
--    earlier migrations — re-create only if missing so a fresh DB is correct).
-- ---------------------------------------------------------------------------
do $$
begin
  -- bookings
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='bookings' and policyname='bookings_select_own') then
    execute 'create policy "bookings_select_own" on public.bookings for select to authenticated using (auth.uid() = host_id)';
  end if;
  -- guests
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='guests' and policyname='guests_select_own') then
    execute 'create policy "guests_select_own" on public.guests for select to authenticated using (auth.uid() = host_id)';
  end if;
end $$;

-- Make sure RLS is on for the host-scoped tables (no-op if already enabled).
alter table public.bookings enable row level security;
alter table public.guests enable row level security;
