-- Tighten user-input ranges requested by the product rules. NOT VALID keeps
-- legacy rows from blocking deployment while enforcing the limits on all new
-- and updated rows.

alter table public.leagues
  drop constraint if exists league_name_length;
alter table public.leagues
  add constraint league_name_length
  check (char_length(name) between 2 and 20) not valid;

alter table public.predictions
  drop constraint if exists predictions_home_score_range;
alter table public.predictions
  add constraint predictions_home_score_range
  check (home_score between 0 and 19) not valid;

alter table public.predictions
  drop constraint if exists predictions_away_score_range;
alter table public.predictions
  add constraint predictions_away_score_range
    check (away_score between 0 and 19) not valid;
