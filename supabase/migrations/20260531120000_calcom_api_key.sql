-- Cal.com personal API key support: hosts can authenticate with a personal
-- API key as an alternative to OAuth. Stored encrypted at rest, used by
-- lib/calcom/api.ts when present (OAuth tokens are the fallback).

alter table public.host_calcom_credentials
  add column if not exists api_key_encrypted text;
