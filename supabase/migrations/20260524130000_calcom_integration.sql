-- Cal.com integration: add booking URL to profiles, booking UID to bookings.
-- Remove Google-related tables and columns no longer used.

-- ---------------------------------------------------------------------------
-- Add Cal.com columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists cal_com_booking_url text;

alter table public.bookings
  add column if not exists cal_com_booking_uid text;

create unique index if not exists bookings_calcom_uid_unique
  on public.bookings (cal_com_booking_uid)
  where cal_com_booking_uid is not null;

-- ---------------------------------------------------------------------------
-- Drop anon RLS policies for public scheduling (page removed)
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_by_slug" on public.profiles;
drop policy if exists "scheduling_defaults_select_by_host" on public.host_scheduling_defaults;
drop policy if exists "availability_windows_select_by_host" on public.availability_windows;

-- ---------------------------------------------------------------------------
-- Drop Google-related columns
-- ---------------------------------------------------------------------------
alter table public.bookings drop column if exists google_event_id;
alter table public.profiles drop column if exists default_calendar_id;

-- ---------------------------------------------------------------------------
-- Drop tables no longer used
-- ---------------------------------------------------------------------------
drop trigger if exists host_scheduling_defaults_set_updated_at on public.host_scheduling_defaults;
drop policy if exists "host_scheduling_defaults_update_own" on public.host_scheduling_defaults;
drop policy if exists "host_scheduling_defaults_insert_own" on public.host_scheduling_defaults;
drop policy if exists "host_scheduling_defaults_select_own" on public.host_scheduling_defaults;
drop table if exists public.host_scheduling_defaults;

drop policy if exists "availability_windows_delete_own" on public.availability_windows;
drop policy if exists "availability_windows_update_own" on public.availability_windows;
drop policy if exists "availability_windows_insert_own" on public.availability_windows;
drop policy if exists "availability_windows_select_own" on public.availability_windows;
drop table if exists public.availability_windows;

drop table if exists public.host_google_credentials;
