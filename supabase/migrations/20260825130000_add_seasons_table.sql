-- Make the football season a first-class entity. Season-specific fields are
-- currently denormalized on public.competitions (season_id, current_matchday,
-- current_stage, total_matchdays, season_start, season_end); when a competition
-- rolls to a new season the row is mutated in place and the prior season's
-- progress/dates are lost, and matches.season_id is a loose integer with no FK.
--
-- This is a STAGED (expand/contract) migration, stage 1 only, matching the
-- pattern used by 20260817120000 (the current_fixture -> current_matchday
-- rename). Deployed mobile builds and the sync edge functions still read/write
-- the competitions columns, so we DO NOT drop them here.
--
-- Stage 1 (this migration):
--   * add a normalized public.seasons table (one row per competition+season)
--   * keep competitions as the canonical writer; a competitions -> seasons
--     trigger maintains seasons as a read-model. Nobody writes seasons directly,
--     so there is no trigger recursion (single direction, unlike the same-table
--     matchday mirror).
--   * a defensive matches -> seasons stub trigger so a match syncing for a brand
--     new season cannot fail the FK if it runs before the competition-progress
--     job, then add matches.season_id -> seasons.id.
--
-- Stage 2 (a LATER migration, only once no deployed build reads the legacy
-- competitions columns): move the edge functions and app to read/write seasons,
-- flip the canonical direction, and drop the competitions season columns and the
-- competitions -> seasons trigger. See the commented template at the bottom.
--
-- Out of scope: no season-scoped leaderboards, predictions or standings; no
-- changes to pro_seasons (the billing/entitlement calendar is a different axis).

-- ---------------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------------
create table if not exists public.seasons (
  id               integer primary key,          -- = football-data season.id
  competition_id   integer not null references public.competitions (id) on delete cascade,
  current_matchday integer,
  current_stage    text,
  total_matchdays  integer,
  season_start     date,
  season_end       date,
  is_current       boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_seasons_competition
  on public.seasons (competition_id);

-- At most one current season per competition.
create unique index if not exists seasons_one_current_per_competition
  on public.seasons (competition_id) where is_current;

-- ---------------------------------------------------------------------------
-- 2. Security: public read reference data, like competitions. Writes only via
--    the SECURITY DEFINER triggers below.
-- ---------------------------------------------------------------------------
alter table public.seasons enable row level security;

revoke all privileges on table public.seasons from public, anon, authenticated;
grant select on table public.seasons to authenticated, service_role;

drop policy if exists seasons_read_authenticated on public.seasons;
create policy seasons_read_authenticated
  on public.seasons
  as permissive
  for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 3. competitions -> seasons sync (one-directional; competitions is canonical)
-- ---------------------------------------------------------------------------
create or replace function public.tg_sync_season_from_competition()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  -- clear-then-set is_current so the partial unique index is never violated
  -- within the statement.
  update public.seasons
    set is_current = false, updated_at = now()
  where competition_id = new.id
    and id <> new.season_id
    and is_current;

  insert into public.seasons as s (
    id, competition_id, current_matchday, current_stage, total_matchdays,
    season_start, season_end, is_current, updated_at
  )
  values (
    new.season_id, new.id, new.current_matchday, new.current_stage,
    new.total_matchdays, new.season_start, new.season_end, true, now()
  )
  on conflict (id) do update set
    competition_id   = excluded.competition_id,
    current_matchday = excluded.current_matchday,
    current_stage    = excluded.current_stage,
    total_matchdays  = excluded.total_matchdays,
    season_start     = excluded.season_start,
    season_end       = excluded.season_end,
    is_current       = true,
    updated_at       = now();

  return null;
end;
$$;

revoke all on function public.tg_sync_season_from_competition()
  from public, anon, authenticated;

drop trigger if exists trg_competitions_sync_season on public.competitions;
create trigger trg_competitions_sync_season
  after insert or update on public.competitions
  for each row
  when (new.season_id is not null)
  execute function public.tg_sync_season_from_competition();

-- ---------------------------------------------------------------------------
-- 4. matches -> seasons stub, so the FK cannot dangle regardless of sync order.
-- ---------------------------------------------------------------------------
create or replace function public.tg_stub_season_for_match()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.season_id is not null and new.competition_id is not null then
    insert into public.seasons (id, competition_id)
    values (new.season_id, new.competition_id)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.tg_stub_season_for_match()
  from public, anon, authenticated;

drop trigger if exists trg_matches_stub_season on public.matches;
create trigger trg_matches_stub_season
  before insert or update of season_id, competition_id on public.matches
  for each row
  when (new.season_id is not null)
  execute function public.tg_stub_season_for_match();

-- ---------------------------------------------------------------------------
-- 5. Backfill: one seasons row per (competition, season).
-- ---------------------------------------------------------------------------
-- Authoritative rows from competitions (carry progress fields, mark current).
insert into public.seasons (
  id, competition_id, current_matchday, current_stage, total_matchdays,
  season_start, season_end, is_current
)
select
  c.season_id, c.id, c.current_matchday, c.current_stage, c.total_matchdays,
  c.season_start, c.season_end, true
from public.competitions c
where c.season_id is not null
on conflict (id) do nothing;

-- Historical/other season ids that appear on matches but not on competitions.
-- season_id is globally unique per season, so a given id maps to one
-- competition; min() is a defensive dedupe.
insert into public.seasons (id, competition_id)
select m.season_id, min(m.competition_id)
from public.matches m
where m.season_id is not null
  and m.competition_id is not null
group by m.season_id
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 6. Referential integrity on matches (NULL still allowed).
-- ---------------------------------------------------------------------------
alter table public.matches
  drop constraint if exists matches_season_id_fkey;
alter table public.matches
  add constraint matches_season_id_fkey
  foreign key (season_id) references public.seasons (id);

-- ---------------------------------------------------------------------------
-- Stage 2 (run in a FUTURE migration once no deployed build reads the legacy
-- competitions season columns). Kept here only as documentation -- do NOT run
-- it now:
--
--   -- move writers (edge functions + app) to seasons first, then:
--   drop trigger if exists trg_competitions_sync_season on public.competitions;
--   drop function if exists public.tg_sync_season_from_competition();
--   alter table public.competitions
--     drop column if exists season_id,
--     drop column if exists current_matchday,
--     drop column if exists current_stage,
--     drop column if exists total_matchdays,
--     drop column if exists season_start,
--     drop column if exists season_end;
--   -- competitions.current season is then seasons.is_current for that competition.
-- ---------------------------------------------------------------------------
