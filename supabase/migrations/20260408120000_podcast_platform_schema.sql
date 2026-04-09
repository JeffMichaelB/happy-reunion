-- Podcast Platform Schema: guests, episode fields, email templates, profile extensions

-- ---------------------------------------------------------------------------
-- 1. Extend profiles with podcast host fields
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists slug text,
  add column if not exists show_name text,
  add column if not exists show_description text,
  add column if not exists avatar_url text,
  add column if not exists default_calendar_id text;

create unique index if not exists profiles_slug_unique on public.profiles (slug) where slug is not null;

-- ---------------------------------------------------------------------------
-- 2. Extend booking_status enum with recorded + published
-- ---------------------------------------------------------------------------
alter type public.booking_status add value if not exists 'recorded' after 'confirmed';
alter type public.booking_status add value if not exists 'published' after 'recorded';

-- ---------------------------------------------------------------------------
-- 3. Create guests table
-- ---------------------------------------------------------------------------
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  bio text,
  company text,
  website text,
  twitter text,
  linkedin text,
  avatar_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(host_id, email)
);

create index if not exists guests_host_id_idx on public.guests (host_id);

alter table public.guests enable row level security;

create policy "guests_select_own" on public.guests
  for select to authenticated
  using (auth.uid() = host_id);

create policy "guests_insert_own" on public.guests
  for insert to authenticated
  with check (auth.uid() = host_id);

create policy "guests_update_own" on public.guests
  for update to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "guests_delete_own" on public.guests
  for delete to authenticated
  using (auth.uid() = host_id);

create trigger guests_set_updated_at
  before update on public.guests
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Add episode columns to bookings
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column if not exists guest_id uuid references public.guests(id) on delete set null,
  add column if not exists topic text,
  add column if not exists riverside_url text,
  add column if not exists google_event_id text;

create index if not exists bookings_guest_id_idx on public.bookings (guest_id);

-- ---------------------------------------------------------------------------
-- 5. Create email_templates table
-- ---------------------------------------------------------------------------
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  body text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_templates_host_id_idx on public.email_templates (host_id);

alter table public.email_templates enable row level security;

create policy "email_templates_select_own" on public.email_templates
  for select to authenticated
  using (auth.uid() = host_id);

create policy "email_templates_insert_own" on public.email_templates
  for insert to authenticated
  with check (auth.uid() = host_id);

create policy "email_templates_update_own" on public.email_templates
  for update to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "email_templates_delete_own" on public.email_templates
  for delete to authenticated
  using (auth.uid() = host_id);

create trigger email_templates_set_updated_at
  before update on public.email_templates
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Create email_sends audit log
-- ---------------------------------------------------------------------------
create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid references public.bookings(id) on delete set null,
  template_id uuid references public.email_templates(id) on delete set null,
  host_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  gmail_message_id text,
  sent_at timestamptz not null default now()
);

create index if not exists email_sends_host_id_idx on public.email_sends (host_id);
create index if not exists email_sends_episode_id_idx on public.email_sends (episode_id);

alter table public.email_sends enable row level security;

create policy "email_sends_select_own" on public.email_sends
  for select to authenticated
  using (auth.uid() = host_id);

create policy "email_sends_insert_own" on public.email_sends
  for insert to authenticated
  with check (auth.uid() = host_id);

-- ---------------------------------------------------------------------------
-- 7. Anon read policies for public scheduling page
-- ---------------------------------------------------------------------------
create policy "profiles_select_by_slug" on public.profiles
  for select to anon
  using (slug is not null);

create policy "scheduling_defaults_select_by_host" on public.host_scheduling_defaults
  for select to anon
  using (true);

create policy "availability_windows_select_by_host" on public.availability_windows
  for select to anon
  using (true);
