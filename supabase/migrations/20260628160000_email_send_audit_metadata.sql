alter table public.email_sends
  add column if not exists purpose text not null default 'manual',
  add column if not exists provider_message_id text,
  add column if not exists body_preview text,
  add column if not exists body_hash text;

update public.email_sends
set provider_message_id = gmail_message_id
where provider_message_id is null
  and gmail_message_id is not null;

alter table public.email_sends
  drop constraint if exists email_sends_purpose_check;

alter table public.email_sends
  add constraint email_sends_purpose_check
  check (
    purpose in (
      'manual',
      'host_booking_notification',
      'guest_booking_confirmation',
      'host_booking_rescheduled',
      'guest_booking_rescheduled',
      'host_booking_cancelled',
      'guest_booking_cancelled'
    )
  );

create index if not exists email_sends_purpose_idx
  on public.email_sends (purpose);
