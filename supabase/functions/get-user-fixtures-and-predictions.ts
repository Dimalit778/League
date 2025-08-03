-- 10. GET USER LEAGUE FIXTURES WITH PREDICTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION get_league_fixtures_with_predictions(
  user_id UUID,
  league_id UUID,
  limit_count INTEGER DEFAULT 50
) RETURNS TABLE (
  fixture_id BIGINT,
  fixture_date TIMESTAMPTZ,
  round TEXT,
  status_long TEXT,
  home_team_id INTEGER,
  home_team_name TEXT,
  home_team_logo TEXT,
  away_team_id INTEGER,
  away_team_name TEXT,
  away_team_logo TEXT,
  goals_home INTEGER,
  goals_away INTEGER,
  score_fulltime_home INTEGER,
  score_fulltime_away INTEGER,
  user_predicted_home INTEGER,
  user_predicted_away INTEGER,
  user_points INTEGER,
  can_predict BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.date,
    f.round,
    f.status_long,
    f.home_team_id,
    ht.name,
    ht.logo,
    f.away_team_id,
    at.name,
    at.logo,
    f.goals_home,
    f.goals_away,
    f.score_fulltime_home,
    f.score_fulltime_away,
    up.predicted_home_score,
    up.predicted_away_score,
    up.points,
    (f.date > NOW()) AS can_predict
  FROM fixtures f
  JOIN teams ht ON f.home_team_id = ht.id
  JOIN teams at ON f.away_team_id = at.id
  LEFT JOIN user_predictions up ON f.id = up.fixture_id AND up.user_id = user_id
  JOIN leagues l ON l.id = league_id
  WHERE f.league_id IN (
    -- Get competition IDs for leagues the user is a member of
    SELECT DISTINCT c.id 
    FROM competitions c
    -- This would need a connection between leagues and competitions
    -- For now, assuming league stores competition_id
  )
  ORDER BY f.date ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;