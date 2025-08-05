// 7. SYNC COMPETITION DATA
// =====================================================
CREATE OR REPLACE FUNCTION sync_competition_data(
  competition_data JSONB
) RETURNS VOID AS $$
DECLARE
  comp JSONB;
BEGIN
  -- Loop through competitions data
  FOR comp IN SELECT * FROM jsonb_array_elements(competition_data->'response')
  LOOP
    PERFORM upsert_competition(
      (comp->'league'->>'id')::INTEGER,
      comp->'league'->>'name',
      comp->'country'->>'name',
      comp->'league'->>'logo',
      comp->'country'->>'flag',
      (comp->'seasons'->0->>'year')::INTEGER, -- Current season
      comp->'seasons'->0->>'current'::TEXT,
      comp->'league'->>'type'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;