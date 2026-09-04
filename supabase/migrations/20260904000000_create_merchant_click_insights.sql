create table public.merchant_click_daily (
  click_date date not null default timezone('utc'::text, now())::date,
  product_id text not null check (char_length(product_id) between 1 and 128),
  product_name text not null check (char_length(product_name) between 1 and 160),
  product_slug text not null check (char_length(product_slug) between 1 and 160),
  merchant_id text not null check (char_length(merchant_id) between 1 and 128),
  merchant_name text not null check (char_length(merchant_name) between 1 and 120),
  affiliate boolean not null,
  surface text not null check (surface in ('hero', 'mobile_tray', 'comparison')),
  click_count bigint not null default 1 check (click_count > 0),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  primary key (click_date, product_id, merchant_id, affiliate, surface)
);

create index merchant_click_daily_date_idx on public.merchant_click_daily (click_date desc);

create table public.merchant_click_hourly_usage (
  visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (visitor_hash, window_start)
);

create index merchant_click_hourly_usage_window_idx
on public.merchant_click_hourly_usage (window_start);

alter table public.merchant_click_daily enable row level security;
alter table public.merchant_click_hourly_usage enable row level security;

revoke all on table public.merchant_click_daily from anon, authenticated;
revoke all on table public.merchant_click_hourly_usage from anon, authenticated;

create or replace function public.record_merchant_click(
  p_visitor_hash text,
  p_product_id text,
  p_product_name text,
  p_product_slug text,
  p_merchant_id text,
  p_merchant_name text,
  p_affiliate boolean,
  p_surface text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_hour timestamptz := date_trunc('hour', now() at time zone 'UTC') at time zone 'UTC';
  current_day date := timezone('utc'::text, now())::date;
  hourly_count integer;
begin
  if p_visitor_hash !~ '^[a-f0-9]{64}$'
    or char_length(p_product_id) not between 1 and 128
    or char_length(p_product_name) not between 1 and 160
    or char_length(p_product_slug) not between 1 and 160
    or char_length(p_merchant_id) not between 1 and 128
    or char_length(p_merchant_name) not between 1 and 120
    or p_surface not in ('hero', 'mobile_tray', 'comparison') then
    raise exception 'Invalid merchant click parameters';
  end if;

  insert into public.merchant_click_hourly_usage (visitor_hash, window_start, request_count)
  values (p_visitor_hash, current_hour, 1)
  on conflict (visitor_hash, window_start) do update
    set request_count = public.merchant_click_hourly_usage.request_count + 1
    where public.merchant_click_hourly_usage.request_count < 60
  returning request_count into hourly_count;

  if hourly_count is null then
    return false;
  end if;

  insert into public.merchant_click_daily (
    click_date,
    product_id,
    product_name,
    product_slug,
    merchant_id,
    merchant_name,
    affiliate,
    surface,
    click_count
  ) values (
    current_day,
    p_product_id,
    p_product_name,
    p_product_slug,
    p_merchant_id,
    p_merchant_name,
    p_affiliate,
    p_surface,
    1
  )
  on conflict (click_date, product_id, merchant_id, affiliate, surface) do update
    set click_count = public.merchant_click_daily.click_count + 1,
        product_name = excluded.product_name,
        product_slug = excluded.product_slug,
        merchant_name = excluded.merchant_name,
        updated_at = timezone('utc'::text, now());

  return true;
end;
$$;

revoke all on function public.record_merchant_click(text, text, text, text, text, text, boolean, text)
from public, anon, authenticated;
grant execute on function public.record_merchant_click(text, text, text, text, text, text, boolean, text)
to service_role;

create or replace function public.get_merchant_click_insights(p_days integer)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  if p_days not in (7, 30, 90) then
    raise exception 'Unsupported reporting period';
  end if;

  with scoped as (
    select *
    from public.merchant_click_daily
    where click_date >= timezone('utc'::text, now())::date - (p_days - 1)
  )
  select jsonb_build_object(
    'totalClicks', coalesce((select sum(click_count) from scoped), 0),
    'productCount', (select count(distinct product_id) from scoped),
    'merchantCount', (select count(distinct merchant_id) from scoped),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('date', click_date, 'clicks', clicks) order by click_date)
      from (
        select click_date, sum(click_count) as clicks
        from scoped
        group by click_date
      ) daily_totals
    ), '[]'::jsonb),
    'topProducts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', product_id,
        'name', product_name,
        'slug', product_slug,
        'clicks', clicks
      ) order by clicks desc, product_name asc)
      from (
        select product_id, max(product_name) as product_name, max(product_slug) as product_slug, sum(click_count) as clicks
        from scoped
        group by product_id
        order by clicks desc
        limit 10
      ) product_totals
    ), '[]'::jsonb),
    'merchants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', merchant_id,
        'name', merchant_name,
        'clicks', clicks
      ) order by clicks desc, merchant_name asc)
      from (
        select merchant_id, max(merchant_name) as merchant_name, sum(click_count) as clicks
        from scoped
        group by merchant_id
      ) merchant_totals
    ), '[]'::jsonb),
    'surfaces', coalesce((
      select jsonb_agg(jsonb_build_object('surface', surface, 'clicks', clicks) order by clicks desc)
      from (
        select surface, sum(click_count) as clicks
        from scoped
        group by surface
      ) surface_totals
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_merchant_click_insights(integer) from public, anon, authenticated;
grant execute on function public.get_merchant_click_insights(integer) to service_role;

create extension if not exists pg_cron with schema extensions;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id from cron.job where jobname = 'purge-merchant-click-insights';
  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end;
$$;

select cron.schedule(
  'purge-merchant-click-insights',
  '37 2 * * *',
  $cleanup$
    delete from public.merchant_click_hourly_usage
    where window_start < timezone('utc'::text, now()) - interval '48 hours';

    delete from public.merchant_click_daily
    where click_date < timezone('utc'::text, now())::date - 730;
  $cleanup$
);
