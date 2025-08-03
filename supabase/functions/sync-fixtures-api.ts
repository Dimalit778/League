// 5. BULK SYNC FIXTURES FUNCTION (Based on API-Football blog)
// =====================================================
CREATE OR REPLACE FUNCTION sync_league_fixtures(
  league_id INTEGER,
  season INTEGER,
  fixtures_data JSONB
) RETURNS INTEGER AS $$
DECLARE
  fixture JSONB;
  fixtures_count INTEGER := 0;
BEGIN
  -- Loop through each fixture in the JSON data
  FOR fixture IN SELECT * FROM jsonb_array_elements(fixtures_data->'response')
  LOOP
    -- First, upsert teams
    PERFORM upsert_team(
      (fixture->'teams'->'home'->>'id')::INTEGER,
      fixture->'teams'->'home'->>'name',
      fixture->'teams'->'home'->>'logo'
    );
    
    PERFORM upsert_team(
      (fixture->'teams'->'away'->>'id')::INTEGER,
      fixture->'teams'->'away'->>'name',
      fixture->'teams'->'away'->>'logo'
    );
    
    -- Then upsert the fixture
    PERFORM upsert_fixture(
      (fixture->'fixture'->>'id')::BIGINT,
      league_id,
      season,
      fixture->'league'->>'round',
      (fixture->'fixture'->>'date')::TIMESTAMPTZ,
      (fixture->'fixture'->>'timestamp')::INTEGER,
      fixture->'fixture'->>'referee',
      fixture->'fixture'->>'timezone',
      fixture->'fixture'->'status'->>'long',
      (fixture->'fixture'->'venue'->>'id')::INTEGER,
      fixture->'fixture'->'venue'->>'name',
      fixture->'fixture'->'venue'->>'city',
      (fixture->'teams'->'home'->>'id')::INTEGER,
      (fixture->'teams'->'away'->>'id')::INTEGER,
      (fixture->'goals'->>'home')::INTEGER,
      (fixture->'goals'->>'away')::INTEGER,
      (fixture->'score'->'halftime'->>'home')::INTEGER,
      (fixture->'score'->'halftime'->>'away')::INTEGER,
      (fixture->'score'->'fulltime'->>'home')::INTEGER,
      (fixture->'score'->'fulltime'->>'away')::INTEGER,
      (fixture->'score'->'extratime'->>'home')::INTEGER,
      (fixture->'score'->'extratime'->>'away')::INTEGER,
      (fixture->'score'->'penalty'->>'home')::INTEGER,
      (fixture->'score'->'penalty'->>'away')::INTEGER
    );
    
    fixtures_count := fixtures_count + 1;
  END LOOP;
  
  RETURN fixtures_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
