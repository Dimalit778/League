// 6. GET FIXTURES THAT NEED UPDATES
// =====================================================
CREATE OR REPLACE FUNCTION get_fixtures_needing_updates(
  hours_back INTEGER DEFAULT 24
) RETURNS TABLE (
  fixture_id BIGINT,
  league_id INTEGER,
  fixture_date TIMESTAMPTZ,
  status_long TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.league_id,
    f.date,
    f.status_long
  FROM fixtures f
  WHERE 
    f.date >= NOW() - (hours_back || ' hours')::INTERVAL
    AND f.date <= NOW() + INTERVAL '2 hours'  -- Include upcoming matches within 2 hours
    AND (
      f.score_fulltime_home IS NULL 
      OR f.score_fulltime_away IS NULL
      OR f.status_long IN ('1st Half', '2nd Half', 'Halftime', 'Extra Time', 'Penalty In Progress')
    )
  ORDER BY f.date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
