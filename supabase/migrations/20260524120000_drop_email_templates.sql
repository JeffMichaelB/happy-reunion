-- Remove the email_templates feature.
-- The template_id column in email_sends is dropped; historical rows lose
-- the FK but the rest of the send record is preserved.

alter table public.email_sends drop column if exists template_id;

drop trigger if exists email_templates_set_updated_at on public.email_templates;

drop policy if exists "email_templates_delete_own" on public.email_templates;
drop policy if exists "email_templates_update_own" on public.email_templates;
drop policy if exists "email_templates_insert_own" on public.email_templates;
drop policy if exists "email_templates_select_own" on public.email_templates;

drop table if exists public.email_templates;
