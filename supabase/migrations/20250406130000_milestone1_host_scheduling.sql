-- Milestone 1: booking pipeline fields, host scheduling defaults, weekly availability windows.
-- Depends on 20250406120000_phase1_schema.sql (bookings, auth.users).

-- ---------------------------------------------------------------------------
-- booking_status — extensible pipeline for guest confirmation flow later
-- ---------------------------------------------------------------------------
create type public.booking_status as enum (
  'draft',
  'pending_guest',
  'confirmed',
  'cancelled',
  'completed'
);

-- ---------------------------------------------------------------------------
-- bookings: richer shape for host-managed pipeline
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column if not exists guest_name text,
  add column if not exists ends_at timestamptz,
  add column if not exists status public.booking_status not null default 'draft',
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger (reusable for host tables)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- host_scheduling_defaults: one row per host
-- ---------------------------------------------------------------------------
create table public.host_scheduling_defaults (
  host_id uuid primary key references auth.users (id) on delete cascade,
  slot_duration_minutes int not null default 30,
  buffer_before_minutes int not null default 0,
  buffer_after_minutes int not null default 0,
  min_notice_hours int not null default 24,
  timezone text not null default 'UTC',
  updated_at timestamptz not null default now()
);

alter table public.host_scheduling_defaults enable row level security;

create policy "host_scheduling_defaults_select_own"
  on public.host_scheduling_defaults
  for select
  to authenticated
  using (auth.uid() = host_id);

create policy "host_scheduling_defaults_insert_own"
  on public.host_scheduling_defaults
  for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "host_scheduling_defaults_update_own"
  on public.host_scheduling_defaults
  for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

drop trigger if exists host_scheduling_defaults_set_updated_at on public.host_scheduling_defaults;
create trigger host_scheduling_defaults_set_updated_at
  before update on public.host_scheduling_defaults
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- availability_windows: recurring weekly windows
-- day_of_week: 0 = Sunday through 6 = Saturday (aligns with JS getDay() in local interpretation)
-- ---------------------------------------------------------------------------
create table public.availability_windows (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint availability_windows_day_range check (day_of_week >= 0 and day_of_week <= 6),
  constraint availability_windows_time_order check (start_time < end_time)
);

create index availability_windows_host_id_idx on public.availability_windows (host_id);

alter table public.availability_windows enable row level security;

create policy "availability_windows_select_own"
  on public.availability_windows
  for select
  to authenticated
  using (auth.uid() = host_id);

create policy "availability_windows_insert_own"
  on public.availability_windows
  for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "availability_windows_update_own"
  on public.availability_windows
  for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "availability_windows_delete_own"
  on public.availability_windows
  for delete
  to authenticated
  using (auth.uid() = host_id);
