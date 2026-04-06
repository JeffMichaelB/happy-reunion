-- Phase 1: profiles, host Google credentials (server-only access), booking stub, storage buckets + RLS

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('host', 'guest');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'host',
  display_name text,
  workspace_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup (runs as definer; bypasses RLS)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, workspace_email)
  values (
    new.id,
    'host',
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- host_google_credentials: no policies for authenticated/anon — service_role only
-- ---------------------------------------------------------------------------
create table public.host_google_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token_encrypted text not null,
  access_token_encrypted text,
  expires_at timestamptz,
  scopes text,
  updated_at timestamptz not null default now()
);

alter table public.host_google_credentials enable row level security;

-- No policies: authenticated/anon cannot read or write; service_role bypasses RLS for server routes.

-- ---------------------------------------------------------------------------
-- bookings stub (host-only; guest token access comes later)
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  guest_email text not null,
  starts_at timestamptz,
  created_at timestamptz not null default now()
);

create index bookings_host_id_idx on public.bookings (host_id);

alter table public.bookings enable row level security;

create policy "bookings_select_own"
  on public.bookings
  for select
  to authenticated
  using (auth.uid() = host_id);

create policy "bookings_insert_own"
  on public.bookings
  for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "bookings_update_own"
  on public.bookings
  for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "bookings_delete_own"
  on public.bookings
  for delete
  to authenticated
  using (auth.uid() = host_id);

-- ---------------------------------------------------------------------------
-- Storage buckets (private)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false),
  ('episode-assets', 'episode-assets', false)
on conflict (id) do nothing;

-- Avatars: objects live under `${auth.uid()}/...`
create policy "avatars_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "avatars_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Episode assets: same prefix pattern
create policy "episode_assets_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'episode-assets'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "episode_assets_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'episode-assets'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "episode_assets_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'episode-assets'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "episode_assets_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'episode-assets'
    and split_part(name, '/', 1) = auth.uid()::text
  );
