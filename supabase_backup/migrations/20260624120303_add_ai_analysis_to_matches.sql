alter table public.matches
  add column if not exists ai_summary_en text,
  add column if not exists ai_summary_he text,
  add column if not exists ai_predicted_home_score smallint,
  add column if not exists ai_predicted_away_score smallint,
  add column if not exists ai_generated_at timestamptz;
