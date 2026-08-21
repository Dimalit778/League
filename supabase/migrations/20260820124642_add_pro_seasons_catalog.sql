-- Recover the Pro season-pass catalog that was applied to the remote database
-- out-of-band (via the dashboard/MCP) and never captured as a migration file.
-- Reconstructed from `supabase db diff` so the repo faithfully reproduces the
-- remote schema. Idempotent so a fresh `db reset` replay is safe.

-- Season catalog for the Pro season pass.
create table if not exists public.pro_seasons (
  id bigint generated always as identity not null,
  code text not null,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone not null,
  is_current boolean not null default false,
  created_at timestamp with time zone not null default now()
);

alter table public.pro_seasons enable row level security;

-- Which season a subscription was purchased against.
alter table public.user_subscriptions
  add column if not exists season_code text;

create unique index if not exists pro_seasons_pkey
  on public.pro_seasons using btree (id);
create unique index if not exists pro_seasons_code_key
  on public.pro_seasons using btree (code);
-- At most one current season at a time.
create unique index if not exists pro_seasons_single_current
  on public.pro_seasons using btree (is_current) where is_current;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pro_seasons_pkey'
  ) then
    alter table public.pro_seasons
      add constraint pro_seasons_pkey primary key using index pro_seasons_pkey;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pro_seasons_code_key'
  ) then
    alter table public.pro_seasons
      add constraint pro_seasons_code_key unique using index pro_seasons_code_key;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pro_seasons_window_valid'
  ) then
    alter table public.pro_seasons
      add constraint pro_seasons_window_valid check (ends_at > starts_at);
  end if;
end $$;

set check_function_bodies = off;

create or replace function public.get_current_season()
returns table(code text, starts_at timestamp with time zone, ends_at timestamp with time zone)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select s.code, s.starts_at, s.ends_at
  from public.pro_seasons s
  where s.is_current
  limit 1;
$function$;

grant delete, insert, references, select, trigger, truncate, update
  on table public.pro_seasons to anon;
grant delete, insert, references, select, trigger, truncate, update
  on table public.pro_seasons to authenticated;
grant delete, insert, references, select, trigger, truncate, update
  on table public.pro_seasons to service_role;

drop policy if exists pro_seasons_read_authenticated on public.pro_seasons;
create policy pro_seasons_read_authenticated
  on public.pro_seasons
  as permissive
  for select
  to authenticated
  using (true);
