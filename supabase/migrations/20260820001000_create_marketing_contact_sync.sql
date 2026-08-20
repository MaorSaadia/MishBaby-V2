create table public.marketing_contact_sync (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (char_length(email) between 3 and 320),
  desired_status text not null check (desired_status in ('subscribed', 'unsubscribed')),
  sync_status text not null default 'pending' check (sync_status in ('pending', 'synced', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error_code text,
  last_attempt_at timestamptz,
  synced_at timestamptz,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create unique index marketing_contact_sync_email_idx
on public.marketing_contact_sync (lower(email));

create table public.resend_webhook_events (
  id text primary key check (char_length(id) between 1 and 200),
  event_type text not null check (char_length(event_type) between 1 and 100),
  processed_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.marketing_contact_sync enable row level security;
alter table public.resend_webhook_events enable row level security;

create policy "Users can read their own marketing sync status"
on public.marketing_contact_sync
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.marketing_contact_sync from anon;
revoke insert, update, delete on table public.marketing_contact_sync from authenticated;
grant select on table public.marketing_contact_sync to authenticated;

revoke all on table public.resend_webhook_events from anon, authenticated;
