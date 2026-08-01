alter table public.predictions
  drop constraint if exists predictions_home_score_range,
  drop constraint if exists predictions_away_score_range;

alter table public.predictions
  add constraint predictions_home_score_range
    check (home_score between 0 and 9) not valid,
  add constraint predictions_away_score_range
    check (away_score between 0 and 9) not valid;
