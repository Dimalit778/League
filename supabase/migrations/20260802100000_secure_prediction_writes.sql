-- Authenticated clients must never be able to award their own points or mark
-- predictions as finished. All user writes go through a narrow RPC that only
-- accepts the two predicted scores and verifies ownership and kickoff rules.

drop policy if exists "Users: Insert predictions" on public.predictions;
drop policy if exists "Users: Update predictions" on public.predictions;
drop policy if exists "Users: Delete predictions" on public.predictions;

revoke insert, update, delete, truncate on table public.predictions
  from anon, authenticated;

create or replace function public.upsert_own_prediction(
  p_league_member_id uuid,
  p_match_id integer,
  p_home_score integer,
  p_away_score integer
)
returns public.predictions
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_league_competition_id integer;
  v_match public.matches%rowtype;
  v_prediction public.predictions%rowtype;
begin
  if v_user_id is null then
    raise exception 'User not authenticated' using errcode = '28000';
  end if;

  if p_league_member_id is null or p_match_id is null then
    raise exception 'League member and match are required' using errcode = '22004';
  end if;

  if p_home_score is null or p_home_score not between 0 and 9
    or p_away_score is null or p_away_score not between 0 and 9 then
    raise exception 'Prediction scores must be between 0 and 9'
      using errcode = '22003';
  end if;

  select l.competition_id
  into v_league_competition_id
  from public.league_members lm
  join public.leagues l on l.id = lm.league_id
  where lm.id = p_league_member_id
    and lm.user_id = v_user_id
    and lm.active = true;

  if not found then
    raise exception 'Active league membership not found'
      using errcode = '42501';
  end if;

  select m.*
  into v_match
  from public.matches m
  where m.id = p_match_id
  for share;

  if not found then
    raise exception 'Match not found' using errcode = 'P0002';
  end if;

  if v_match.competition_id is distinct from v_league_competition_id then
    raise exception 'Match does not belong to the league competition'
      using errcode = '42501';
  end if;

  if v_match.status is null or v_match.status not in (
      'SCHEDULED'::public.match_status,
      'TIMED'::public.match_status
    ) then
    raise exception 'Predictions are closed for this match'
      using errcode = '55000';
  end if;

  if v_match.kick_off <= clock_timestamp() then
    raise exception 'Predictions are locked at kickoff'
      using errcode = '55000';
  end if;

  insert into public.predictions (
    league_member_id,
    match_id,
    home_score,
    away_score
  )
  values (
    p_league_member_id,
    p_match_id,
    p_home_score,
    p_away_score
  )
  on conflict on constraint predictions_league_member_match_key
  do update set
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    points = 0,
    is_finished = false,
    updated_at = clock_timestamp()
  returning * into v_prediction;

  return v_prediction;
end;
$$;

revoke all on function public.upsert_own_prediction(uuid, integer, integer, integer)
  from public, anon;
grant execute on function public.upsert_own_prediction(uuid, integer, integer, integer)
  to authenticated;

-- Point calculation is server-owned. SECURITY DEFINER lets the match-sync
-- trigger update predictions even though authenticated table writes are
-- revoked. Recalculate every row so a previously forged is_finished flag can
-- never prevent canonical scoring.
create or replace function public.tg_calc_prediction_points_on_match_finish()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  ft_home integer;
  ft_away integer;
begin
  if new.status is distinct from 'FINISHED'::public.match_status then
    update public.predictions
    set points = 0,
        is_finished = false,
        updated_at = clock_timestamp()
    where match_id = new.id
      and (points <> 0 or is_finished = true);

    return new;
  end if;

  ft_home := coalesce(
    (new.score->'fullTime'->>'home')::integer,
    (new.score->'fulltime'->>'home')::integer
  );
  ft_away := coalesce(
    (new.score->'fullTime'->>'away')::integer,
    (new.score->'fulltime'->>'away')::integer
  );

  if ft_home is null or ft_away is null then
    update public.predictions
    set points = 0,
        is_finished = false,
        updated_at = clock_timestamp()
    where match_id = new.id
      and (points <> 0 or is_finished = true);

    return new;
  end if;

  update public.predictions p
  set points = case
        when p.home_score = ft_home and p.away_score = ft_away then 5
        when (p.home_score = p.away_score and ft_home = ft_away)
          or (p.home_score > p.away_score and ft_home > ft_away)
          or (p.home_score < p.away_score and ft_home < ft_away)
          then 3
        else 0
      end,
      is_finished = true,
      updated_at = clock_timestamp()
  where p.match_id = new.id;

  return new;
end;
$$;

revoke all on function public.tg_calc_prediction_points_on_match_finish()
  from public, anon, authenticated;

-- Repair any values that may have been written before the table was locked.
with match_scores as (
  select
    p.id,
    p.home_score,
    p.away_score,
    m.status,
    coalesce(
      (m.score->'fullTime'->>'home')::integer,
      (m.score->'fulltime'->>'home')::integer
    ) as ft_home,
    coalesce(
      (m.score->'fullTime'->>'away')::integer,
      (m.score->'fulltime'->>'away')::integer
    ) as ft_away
  from public.predictions p
  join public.matches m on m.id = p.match_id
),
canonical as (
  select
    id,
    coalesce(
      status = 'FINISHED'::public.match_status
        and ft_home is not null
        and ft_away is not null,
      false
    ) as should_be_finished,
    case
      when status is distinct from 'FINISHED'::public.match_status
        or ft_home is null
        or ft_away is null then 0
      when home_score = ft_home and away_score = ft_away then 5
      when (home_score = away_score and ft_home = ft_away)
        or (home_score > away_score and ft_home > ft_away)
        or (home_score < away_score and ft_home < ft_away) then 3
      else 0
    end as canonical_points
  from match_scores
)
update public.predictions p
set points = c.canonical_points,
    is_finished = c.should_be_finished,
    updated_at = clock_timestamp()
from canonical c
where c.id = p.id
  and (
    p.points is distinct from c.canonical_points
    or p.is_finished is distinct from c.should_be_finished
  );

alter table public.predictions
  drop constraint if exists predictions_points_canonical;
alter table public.predictions
  add constraint predictions_points_canonical
  check (points in (0, 3, 5));
