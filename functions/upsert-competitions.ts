// 1. UPSERT COMPETITION FUNCTION
// =====================================================
CREATE OR REPLACE FUNCTION upsert_competition(
  comp_id INTEGER,
  comp_name TEXT,
  comp_country TEXT,
  comp_logo TEXT,
  comp_flag TEXT,
  comp_season INTEGER,
  comp_round TEXT,
  comp_type TEXT DEFAULT 'League'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO competitions (
    id, name, country, logo, flag, season, round, type, updatedAt
  )
  VALUES (
    comp_id, comp_name, comp_country, comp_logo, comp_flag, 
    comp_season, comp_round, comp_type, NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    name = EXCLUDED.name,
    country = EXCLUDED.country,
    logo = EXCLUDED.logo,
    flag = EXCLUDED.flag,
    season = EXCLUDED.season,
    round = EXCLUDED.round,
    type = EXCLUDED.type,
    updatedAt = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
