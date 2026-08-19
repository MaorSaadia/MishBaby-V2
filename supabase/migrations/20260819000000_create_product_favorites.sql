create table public.product_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null check (char_length(product_id) between 1 and 200),
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, product_id)
);

alter table public.product_favorites enable row level security;

create policy "Users can read their own product favorites"
on public.product_favorites
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add their own product favorites"
on public.product_favorites
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can remove their own product favorites"
on public.product_favorites
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.product_favorites from anon;
grant select, insert, delete on table public.product_favorites to authenticated;
