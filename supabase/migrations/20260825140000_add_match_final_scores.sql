-- Promote the full-time result out of the matches.score JSON blob into two
-- explicit integer columns so results can be indexed and aggregated, and so the
-- point-settlement path reads plain columns instead of digging through JSON on
-- every finished match.
--
-- score stays the source of truth for the rich breakdown (halfTime, winner,
-- duration). final_home_score / final_away_score are a derived, indexed cache of
-- score->'fullTime', kept in sync by a BEFORE trigger. Behaviour-neutral: the
-- settlement trigger reads the same values it used to extract inline.

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------
alter table public.matches
  add column if not exists final_home_score integer,
  add column if not exists final_away_score integer;

-- ---------------------------------------------------------------------------
-- 2. Keep the columns in sync with score->'fullTime' (both casings, matching
--    the existing settlement extraction). Only mutates NEW, so no privileges
--    needed. Runs BEFORE the AFTER settlement trigger, so the derived values are
--    already present when points are calculated.
-- ---------------------------------------------------------------------------
create or replace function public.tg_derive_match_final_score()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.final_home_score := coalesce(
    (new.score->'fullTime'->>'home')::integer,
    (new.score->'fulltime'->>'home')::integer
  );
  new.final_away_score := coalesce(
    (new.score->'fullTime'->>'away')::integer,
    (new.score->'fulltime'->>'away')::integer
  );
  return new;
end;
$$;

drop trigger if exists trg_matches_derive_final_score on public.matches;
create trigger trg_matches_derive_final_score
  before insert or update of score on public.matches
  for each row
  execute function public.tg_derive_match_final_score();

-- ---------------------------------------------------------------------------
-- 3. Backfill from existing score JSON.
-- ---------------------------------------------------------------------------
update public.matches
set
  final_home_score = coalesce(
    (score->'fullTime'->>'home')::integer,
    (score->'fulltime'->>'home')::integer
  ),
  final_away_score = coalesce(
    (score->'fullTime'->>'away')::integer,
    (score->'fulltime'->>'away')::integer
  )
where score is not null
  and final_home_score is null
  and final_away_score is null;

-- ---------------------------------------------------------------------------
-- 4. Index for querying / aggregating finished results.
-- ---------------------------------------------------------------------------
create index if not exists idx_matches_final_score
  on public.matches (final_home_score, final_away_score)
  where status = 'FINISHED'::public.match_status;

-- ---------------------------------------------------------------------------
-- 5. Refactor settlement to read the columns instead of re-parsing JSON.
--    Same 5/3/0 scoring and reset semantics as before.
-- ---------------------------------------------------------------------------
create or replace function public.tg_calc_prediction_points_on_match_finish()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status is distinct from 'FINISHED'::public.match_status
     or new.final_home_score is null
     or new.final_away_score is null then
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
        when p.home_score = new.final_home_score and p.away_score = new.final_away_score then 5
        when (p.home_score = p.away_score and new.final_home_score = new.final_away_score)
          or (p.home_score > p.away_score and new.final_home_score > new.final_away_score)
          or (p.home_score < p.away_score and new.final_home_score < new.final_away_score)
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
