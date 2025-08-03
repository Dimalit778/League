// 8. HELPER FUNCTION: Check if user can predict
// =====================================================
CREATE OR REPLACE FUNCTION can_user_predict(
  user_id UUID,
  fixture_id BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
  fixture_date TIMESTAMPTZ;
BEGIN
  SELECT date INTO fixture_date FROM fixtures WHERE id = fixture_id;
  
  -- Can predict if fixture hasn't started yet
  RETURN fixture_date > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;