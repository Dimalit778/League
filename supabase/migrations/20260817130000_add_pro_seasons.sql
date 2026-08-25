-- Pro season windows: one current season drives the paywall month tier and the
-- fixed calendar expiry stamped onto Pro purchases.
-- Idempotent so a fresh `db reset` replay and a `db push` onto a remote where
-- pro_seasons was created out-of-band (before this migration was tracked) are
-- both safe. The later 20260820124642 catalog migration guarantees the same
-- shape with `if not exists`, so on remote every statement here is a no-op
-- except the seed insert below.
create table if not exists public.pro_seasons (
  id          bigint generated always as identity primary key,
  code        text not null unique,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  constraint pro_seasons_window_valid check (ends_at > starts_at)
);

-- At most one current season at any time.
create unique index if not exists pro_seasons_single_current
  on public.pro_seasons (is_current)
  where is_current;

alter table public.pro_seasons enable row level security;

-- Any signed-in user may read the season window (needed to pick the month tier).
drop policy if exists "pro_seasons_read_authenticated" on public.pro_seasons;
create policy "pro_seasons_read_authenticated"
  on public.pro_seasons for select
  to authenticated
  using (true);

-- Single source of truth for the current season, shared by client and edge fn.
create or replace function public.get_current_season()
returns table (code text, starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.code, s.starts_at, s.ends_at
  from public.pro_seasons s
  where s.is_current
  limit 1;
$$;

revoke all on function public.get_current_season() from public;
grant execute on function public.get_current_season() to authenticated;
grant execute on function public.get_current_season() to service_role;

-- Which season a Pro purchase belongs to (distinguishes past-season restores).
alter table public.user_subscriptions
  add column if not exists season_code text;

-- Seed the first season: 2026-27 (August 2026 -> August 2027).
insert into public.pro_seasons (code, starts_at, ends_at, is_current)
values ('2026-27', '2026-08-01T00:00:00Z', '2027-08-01T00:00:00Z', true)
on conflict (code) do nothing;
