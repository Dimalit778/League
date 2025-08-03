//  -- 2. UPSERT TEAM FUNCTION
// =====================================================
CREATE OR REPLACE FUNCTION upsert_team(
  team_id INTEGER,
  team_name TEXT,
  team_logo TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO teams (id, name, logo, updatedAt)
  VALUES (team_id, team_name, team_logo, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET
    name = EXCLUDED.name,
    logo = EXCLUDED.logo,
    updatedAt = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
