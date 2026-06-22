-- Local development parity (NOT data — privilege grants).
--
-- The hosted Supabase project grants data access on `public` tables to the
-- `anon`, `authenticated`, and `service_role` roles (the historical Supabase
-- default). Newer local Postgres images ship with hardened default privileges
-- that omit SELECT/INSERT/UPDATE/DELETE for these roles, so the app's
-- RLS-protected tables would otherwise fail with "permission denied for table"
-- under `supabase start`. Re-grant here so local dev matches production.
--
-- Row Level Security still enforces per-row access (policies live in the
-- migrations); these grants only let those policies take effect.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
  on all tables in schema public
  to anon, authenticated, service_role;

grant usage, select
  on all sequences in schema public
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant usage, select on sequences
  to anon, authenticated, service_role;
