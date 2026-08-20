create table public.amazon_search_cache (
  cache_key text primary key check (cache_key ~ '^[a-f0-9]{64}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz not null
);

create index amazon_search_cache_expires_at_idx
on public.amazon_search_cache (expires_at);

create table public.amazon_search_hourly_usage (
  visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (visitor_hash, window_start)
);

create index amazon_search_hourly_usage_window_idx
on public.amazon_search_hourly_usage (window_start);

create table public.amazon_search_daily_usage (
  usage_date date primary key,
  request_count integer not null default 1 check (request_count > 0)
);

alter table public.amazon_search_cache enable row level security;
alter table public.amazon_search_hourly_usage enable row level security;
alter table public.amazon_search_daily_usage enable row level security;

revoke all on table public.amazon_search_cache from anon, authenticated;
revoke all on table public.amazon_search_hourly_usage from anon, authenticated;
revoke all on table public.amazon_search_daily_usage from anon, authenticated;

create or replace function public.consume_amazon_search_quota(
  p_visitor_hash text,
  p_hourly_limit integer default 10,
  p_daily_limit integer default 250
)
returns table (
  allowed boolean,
  reason text,
  hourly_remaining integer,
  daily_remaining integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_hour timestamptz := date_trunc('hour', now() at time zone 'UTC') at time zone 'UTC';
  current_day date := timezone('utc'::text, now())::date;
  hourly_count integer;
  daily_count integer;
begin
  if p_visitor_hash !~ '^[a-f0-9]{64}$' or p_hourly_limit < 1 or p_daily_limit < 1 then
    raise exception 'Invalid quota parameters';
  end if;

  insert into public.amazon_search_hourly_usage (visitor_hash, window_start, request_count)
  values (p_visitor_hash, current_hour, 1)
  on conflict (visitor_hash, window_start) do update
    set request_count = public.amazon_search_hourly_usage.request_count + 1
    where public.amazon_search_hourly_usage.request_count < p_hourly_limit
  returning request_count into hourly_count;

  if hourly_count is null then
    select request_count into hourly_count
    from public.amazon_search_hourly_usage
    where visitor_hash = p_visitor_hash and window_start = current_hour;

    return query select false, 'hourly_limit'::text, 0, greatest(p_daily_limit - coalesce((
      select request_count from public.amazon_search_daily_usage where usage_date = current_day
    ), 0), 0);
    return;
  end if;

  insert into public.amazon_search_daily_usage (usage_date, request_count)
  values (current_day, 1)
  on conflict (usage_date) do update
    set request_count = public.amazon_search_daily_usage.request_count + 1
    where public.amazon_search_daily_usage.request_count < p_daily_limit
  returning request_count into daily_count;

  if daily_count is null then
    update public.amazon_search_hourly_usage
    set request_count = request_count - 1
    where visitor_hash = p_visitor_hash and window_start = current_hour;

    return query select false, 'daily_limit'::text, greatest(p_hourly_limit - hourly_count + 1, 0), 0;
    return;
  end if;

  return query select true, 'allowed'::text, greatest(p_hourly_limit - hourly_count, 0), greatest(p_daily_limit - daily_count, 0);
end;
$$;

revoke all on function public.consume_amazon_search_quota(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_amazon_search_quota(text, integer, integer) to service_role;

create extension if not exists pg_cron with schema extensions;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id from cron.job where jobname = 'purge-amazon-search-data';
  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end;
$$;

select cron.schedule(
  'purge-amazon-search-data',
  '17 * * * *',
  $cleanup$
    delete from public.amazon_search_cache where expires_at <= timezone('utc'::text, now());
    delete from public.amazon_search_hourly_usage where window_start < timezone('utc'::text, now()) - interval '48 hours';
    delete from public.amazon_search_daily_usage where usage_date < timezone('utc'::text, now())::date - 7;
  $cleanup$
);
