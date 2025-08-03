// 3. UPSERT FIXTURE FUNCTION (Main Function)
// =====================================================
CREATE OR REPLACE FUNCTION upsert_fixture(
  fixture_id BIGINT,
  league_id INTEGER,
  season INTEGER,
  round TEXT,
  fixture_date TIMESTAMPTZ,
  timestamp_val INTEGER DEFAULT NULL,
  referee TEXT DEFAULT NULL,
  timezone TEXT DEFAULT NULL,
  status_long TEXT DEFAULT NULL,
  venue_id INTEGER DEFAULT NULL,
  venue_name TEXT DEFAULT NULL,
  venue_city TEXT DEFAULT NULL,
  home_team_id INTEGER,
  away_team_id INTEGER,
  goals_home INTEGER DEFAULT NULL,
  goals_away INTEGER DEFAULT NULL,
  score_halftime_home INTEGER DEFAULT NULL,
  score_halftime_away INTEGER DEFAULT NULL,
  score_fulltime_home INTEGER DEFAULT NULL,
  score_fulltime_away INTEGER DEFAULT NULL,
  score_extratime_home INTEGER DEFAULT NULL,
  score_extratime_away INTEGER DEFAULT NULL,
  score_penalty_home INTEGER DEFAULT NULL,
  score_penalty_away INTEGER DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  was_finished BOOLEAN;
  is_now_finished BOOLEAN;
BEGIN
  -- Check if fixture was previously finished
  SELECT (score_fulltime_home IS NOT NULL AND score_fulltime_away IS NOT NULL) 
  INTO was_finished 
  FROM fixtures WHERE id = fixture_id;
  
  is_now_finished := (score_fulltime_home IS NOT NULL AND score_fulltime_away IS NOT NULL);
  
  INSERT INTO fixtures (
    id, league_id, season, round, date, timestamp, referee, timezone,
    status_long, venue_id, venue_name, venue_city, home_team_id, away_team_id,
    goals_home, goals_away, score_halftime_home, score_halftime_away,
    score_fulltime_home, score_fulltime_away, score_extratime_home, 
    score_extratime_away, score_penalty_home, score_penalty_away, updatedAt
  )
  VALUES (
    fixture_id, league_id, season, round, fixture_date, timestamp_val, referee, 
    timezone, status_long, venue_id, venue_name, venue_city, home_team_id, 
    away_team_id, goals_home, goals_away, score_halftime_home, score_halftime_away,
    score_fulltime_home, score_fulltime_away, score_extratime_home, 
    score_extratime_away, score_penalty_home, score_penalty_away, NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    league_id = EXCLUDED.league_id,
    season = EXCLUDED.season,
    round = EXCLUDED.round,
    date = EXCLUDED.date,
    timestamp = EXCLUDED.timestamp,
    referee = EXCLUDED.referee,
    timezone = EXCLUDED.timezone,
    status_long = EXCLUDED.status_long,
    venue_id = EXCLUDED.venue_id,
    venue_name = EXCLUDED.venue_name,
    venue_city = EXCLUDED.venue_city,
    home_team_id = EXCLUDED.home_team_id,
    away_team_id = EXCLUDED.away_team_id,
    goals_home = EXCLUDED.goals_home,
    goals_away = EXCLUDED.goals_away,
    score_halftime_home = EXCLUDED.score_halftime_home,
    score_halftime_away = EXCLUDED.score_halftime_away,
    score_fulltime_home = EXCLUDED.score_fulltime_home,
    score_fulltime_away = EXCLUDED.score_fulltime_away,
    score_extratime_home = EXCLUDED.score_extratime_home,
    score_extratime_away = EXCLUDED.score_extratime_away,
    score_penalty_home = EXCLUDED.score_penalty_home,
    score_penalty_away = EXCLUDED.score_penalty_away,
    updatedAt = NOW();
    
  -- Trigger points calculation if fixture just finished
  IF NOT COALESCE(was_finished, FALSE) AND is_now_finished THEN
    PERFORM calculate_fixture_predictions(fixture_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;