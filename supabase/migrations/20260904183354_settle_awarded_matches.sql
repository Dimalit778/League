-- AWARDED is an official, terminal result. Settle predictions only when the
-- provider supplied a complete score; CANCELLED and scoreless AWARDED matches
-- remain unscored.
create or replace function public.tg_calc_prediction_points_on_match_finish()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status not in (
       'FINISHED'::public.match_status,
       'AWARDED'::public.match_status
     )
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

drop index if exists public.idx_matches_final_score;
create index idx_matches_final_score
  on public.matches (final_home_score, final_away_score)
  where status in (
    'FINISHED'::public.match_status,
    'AWARDED'::public.match_status
  );
