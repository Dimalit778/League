-- Denormalized per-member standings so the leaderboard read models stop
-- re-summing predictions on every read. league_leaderboard_view,
-- member_league_summary_view and get_competition_leaderboard all computed
-- sum(predictions.points) (plus a rank() window) on each call, which is the
-- hottest read path in the app and scales O(members x matches). This table
-- holds one row per league member, maintained incrementally by triggers, so
-- reads become O(members) index scans and writes stay O(affected members).
--
-- Points only ever change through two server-owned paths:
--   1. tg_calc_prediction_points_on_match_finish() -- bulk UPDATE of every
--      prediction for a match when it finishes (or is reset).
--   2. deletion of predictions (leave/remove/anonymize member).
-- upsert_own_prediction always writes points = 0 before kickoff and can never
-- touch a finished prediction, so it never changes the stored total.
--
-- We maintain the table with AFTER STATEMENT triggers on predictions using
-- transition tables: a single bulk settlement fires the trigger once and
-- recomputes only the affected members in one set-based statement.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.league_member_standings (
  league_member_id uuid primary key
    references public.league_members (id) on delete cascade,
  league_id        uuid not null
    references public.leagues (id) on delete cascade,
  total_points     integer not null default 0,
  exact_count      integer not null default 0,
  outcome_count    integer not null default 0,
  finished_count   integer not null default 0,
  updated_at       timestamptz not null default now()
);

-- Leaderboard ordering per league is index-served.
create index if not exists idx_league_member_standings_league_points
  on public.league_member_standings (league_id, total_points desc);

-- ---------------------------------------------------------------------------
-- Security: read model only. Writes happen exclusively through the
-- SECURITY DEFINER triggers below, so no client role gets write privileges.
-- The SELECT policy mirrors "Users read visible league predictions" so the
-- security_invoker views expose exactly the same rows they did when they read
-- predictions directly.
-- ---------------------------------------------------------------------------
alter table public.league_member_standings enable row level security;

revoke all privileges on table public.league_member_standings
  from public, anon, authenticated;
grant select on table public.league_member_standings
  to authenticated, service_role;

drop policy if exists "Members read visible league standings"
  on public.league_member_standings;
create policy "Members read visible league standings"
  on public.league_member_standings
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.league_members lm_self
      join public.league_members lm_row
        on lm_self.league_id = lm_row.league_id
      where lm_self.user_id = (select auth.uid())
        and lm_row.id = league_member_standings.league_member_id
        and (
          lm_row.user_id is null
          or lm_row.user_id = (select auth.uid())
          or not public.has_blocked_user(lm_row.user_id)
        )
    )
  );

-- ---------------------------------------------------------------------------
-- Incremental maintenance
-- ---------------------------------------------------------------------------

-- Recompute the standings rows for exactly the members whose predictions
-- changed. Declared once and attached to three triggers; each trigger exposes
-- its transition rows under the same alias `changed_rows` (NEW TABLE for
-- insert/update, OLD TABLE for delete). A member's league_member_id never
-- differs between OLD and NEW of an UPDATE, so NEW TABLE alone is enough there.
create or replace function public.tg_sync_member_standings()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  with affected as (
    select distinct league_member_id from changed_rows
  ),
  agg as (
    select
      a.league_member_id,
      coalesce(sum(p.points), 0)::integer                 as total_points,
      count(*) filter (where p.points = 5)::integer       as exact_count,
      count(*) filter (where p.points = 3)::integer       as outcome_count,
      count(*) filter (where p.is_finished)::integer      as finished_count
    from affected a
    left join public.predictions p
      on p.league_member_id = a.league_member_id
    group by a.league_member_id
  )
  insert into public.league_member_standings as s (
    league_member_id, league_id,
    total_points, exact_count, outcome_count, finished_count, updated_at
  )
  select
    lm.id, lm.league_id,
    coalesce(g.total_points, 0),
    coalesce(g.exact_count, 0),
    coalesce(g.outcome_count, 0),
    coalesce(g.finished_count, 0),
    now()
  from agg g
  -- Join to league_members so a member deleted in the same statement (its
  -- predictions cascade-deleting into this trigger) is skipped: the parent row
  -- is already gone and the standings row cascades away too.
  join public.league_members lm on lm.id = g.league_member_id
  on conflict (league_member_id) do update set
    league_id      = excluded.league_id,
    total_points   = excluded.total_points,
    exact_count    = excluded.exact_count,
    outcome_count  = excluded.outcome_count,
    finished_count = excluded.finished_count,
    updated_at     = now();

  return null;
end;
$$;

revoke all on function public.tg_sync_member_standings()
  from public, anon, authenticated;

drop trigger if exists trg_predictions_standings_ins on public.predictions;
create trigger trg_predictions_standings_ins
  after insert on public.predictions
  referencing new table as changed_rows
  for each statement execute function public.tg_sync_member_standings();

drop trigger if exists trg_predictions_standings_upd on public.predictions;
create trigger trg_predictions_standings_upd
  after update on public.predictions
  referencing new table as changed_rows
  for each statement execute function public.tg_sync_member_standings();

drop trigger if exists trg_predictions_standings_del on public.predictions;
create trigger trg_predictions_standings_del
  after delete on public.predictions
  referencing old table as changed_rows
  for each statement execute function public.tg_sync_member_standings();

-- Seed a zero row the moment a member joins so the leaderboard is fully
-- served from this table (the views still coalesce, so this is belt-and-braces
-- for completeness, not correctness).
create or replace function public.tg_seed_member_standings()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.league_member_standings (league_member_id, league_id)
  values (new.id, new.league_id)
  on conflict (league_member_id) do nothing;
  return new;
end;
$$;

revoke all on function public.tg_seed_member_standings()
  from public, anon, authenticated;

drop trigger if exists trg_league_members_seed_standings on public.league_members;
create trigger trg_league_members_seed_standings
  after insert on public.league_members
  for each row execute function public.tg_seed_member_standings();

-- ---------------------------------------------------------------------------
-- Backfill from existing predictions (one row per current member).
-- ---------------------------------------------------------------------------
insert into public.league_member_standings (
  league_member_id, league_id,
  total_points, exact_count, outcome_count, finished_count, updated_at
)
select
  lm.id,
  lm.league_id,
  coalesce(sum(p.points), 0)::integer,
  count(*) filter (where p.points = 5)::integer,
  count(*) filter (where p.points = 3)::integer,
  count(*) filter (where p.is_finished)::integer,
  now()
from public.league_members lm
left join public.predictions p on p.league_member_id = lm.id
group by lm.id, lm.league_id
on conflict (league_member_id) do update set
  league_id      = excluded.league_id,
  total_points   = excluded.total_points,
  exact_count    = excluded.exact_count,
  outcome_count  = excluded.outcome_count,
  finished_count = excluded.finished_count,
  updated_at     = now();

-- ---------------------------------------------------------------------------
-- Point the read models at the standings table instead of summing predictions.
-- Column shapes are unchanged so CREATE OR REPLACE is safe and existing grants
-- carry over.
-- ---------------------------------------------------------------------------
create or replace view public.league_leaderboard_view
with (security_invoker = true) as
select
  lm.id         as member_id,
  lm.league_id,
  lm.user_id,
  lm.nickname,
  lm.avatar_url,
  coalesce(s.total_points, 0) as total_points
from public.league_members lm
left join public.league_member_standings s on s.league_member_id = lm.id
where public.is_admin()
  or (
    public.is_league_member(lm.league_id)
    and (
      lm.user_id is null
      or lm.user_id = (select auth.uid())
      or not public.has_blocked_user(lm.user_id)
    )
  )
order by coalesce(s.total_points, 0) desc;

create or replace view public.member_league_summary_view
with (security_invoker = true) as
with ranked as (
  select
    lm.id as member_id,
    lm.league_id,
    lm.nickname,
    lm.is_primary,
    lm.active,
    coalesce(s.total_points, 0) as total_points,
    rank() over (
      partition by lm.league_id
      order by coalesce(s.total_points, 0) desc
    ) as rank
  from public.league_members lm
  left join public.league_member_standings s on s.league_member_id = lm.id
)
select
  r.member_id,
  r.league_id,
  r.nickname,
  l.name as league_name,
  c.name as competition_name,
  c.flag as competition_flag,
  r.total_points,
  r.rank,
  (
    select count(*)::integer
    from public.league_members lm2
    where lm2.league_id = r.league_id
      and lm2.active = true
      and lm2.user_id is not null
  ) as members_count,
  r.is_primary,
  r.active,
  l.competition_id,
  c.season_id as competition_season_id,
  c.is_free as competition_is_free
from ranked r
join public.leagues l on l.id = r.league_id
join public.competitions c on c.id = l.competition_id;

revoke all privileges on public.league_leaderboard_view
  from public, anon, authenticated;
revoke all privileges on public.member_league_summary_view
  from public, anon, authenticated;
grant select on public.league_leaderboard_view  to authenticated, service_role;
grant select on public.member_league_summary_view to authenticated, service_role;

-- Cross-league competition leaderboard: same swap, still SECURITY DEFINER so it
-- deliberately crosses leagues (RLS bypassed by design, see original comment).
create or replace function public.get_competition_leaderboard(p_competition_id integer)
returns table (
  member_id uuid,
  league_id uuid,
  user_id uuid,
  nickname text,
  avatar_url text,
  total_points integer
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (ranked.user_id)
    ranked.member_id,
    ranked.league_id,
    ranked.user_id,
    ranked.nickname,
    ranked.avatar_url,
    ranked.total_points
  from (
    select
      lm.id as member_id,
      lm.league_id,
      lm.user_id,
      lm.nickname,
      lm.avatar_url,
      coalesce(s.total_points, 0) as total_points
    from public.league_members lm
    join public.leagues l on l.id = lm.league_id
    left join public.league_member_standings s on s.league_member_id = lm.id
    where l.competition_id = p_competition_id
      and lm.user_id is not null
      and not public.has_blocked_user(lm.user_id)
  ) ranked
  order by ranked.user_id, ranked.total_points desc;
$$;

revoke all on function public.get_competition_leaderboard(integer) from public, anon;
grant execute on function public.get_competition_leaderboard(integer) to authenticated;
