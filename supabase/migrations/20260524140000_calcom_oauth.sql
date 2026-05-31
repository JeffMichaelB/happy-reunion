-- Cal.com OAuth credentials: stores encrypted access/refresh tokens per host.
-- Service role only (no RLS policies for authenticated/anon).

create table public.host_calcom_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  calcom_username text,
  selected_event_type_id integer,
  selected_event_type_slug text,
  webhook_id text,
  updated_at timestamptz not null default now()
);

alter table public.host_calcom_credentials enable row level security;
