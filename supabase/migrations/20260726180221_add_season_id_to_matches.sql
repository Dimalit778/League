-- Add nullable season_id (football-data season.id) to matches so the app can
-- distinguish matches from different seasons of the same competition.
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS season_id integer;

-- Backfill single-season competitions with their current season id
-- (La Liga 2014 -> 2429, World Cup 2000 -> 2398). Done by competition, not by
-- date, so La Liga's 2025-08-15 matches (before season_start 2025-08-17) are
-- still included.
UPDATE public.matches m
SET season_id = c.season_id
FROM public.competitions c
WHERE m.competition_id = c.id
  AND m.competition_id IN (2014, 2000)
  AND m.season_id IS NULL;

-- Premier League (2021) has two seasons stored. Tag the current season
-- (2026/27 = 2502). No PL matches fall between 2026-07-01 and season start
-- 2026-08-21, so this cleanly selects the current-season rows. The previous
-- 2025/26 season is left NULL and hidden by the app's season filter; it can be
-- backfilled with its real season id via a season-filtered re-sync later.
UPDATE public.matches
SET season_id = 2502
WHERE competition_id = 2021
  AND kick_off >= '2026-07-01'
  AND season_id IS NULL;

-- Composite index for the (competition_id, season_id) filter used by the app.
CREATE INDEX IF NOT EXISTS idx_matches_competition_season
  ON public.matches (competition_id, season_id);
