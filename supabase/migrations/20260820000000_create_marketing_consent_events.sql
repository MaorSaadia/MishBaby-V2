create table public.marketing_consent_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('subscribed', 'unsubscribed')),
  source text not null check (char_length(source) between 1 and 80),
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  occurred_at timestamptz not null default timezone('utc'::text, now())
);

create index marketing_consent_events_user_history_idx
on public.marketing_consent_events (user_id, occurred_at desc, id desc);

alter table public.marketing_consent_events enable row level security;

create policy "Users can read their own marketing consent history"
on public.marketing_consent_events
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.marketing_consent_events from anon;
revoke insert, update, delete on table public.marketing_consent_events from authenticated;
grant select on table public.marketing_consent_events to authenticated;
