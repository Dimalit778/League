// 9. CREATE PREDICTION FUNCTION
// =====================================================
CREATE OR REPLACE FUNCTION create_or_update_prediction(
  user_id UUID,
  fixture_id BIGINT,
  predicted_home INTEGER,
  predicted_away INTEGER
) RETURNS UUID AS $$
DECLARE
  prediction_id UUID;
  fixture_date TIMESTAMPTZ;
BEGIN
  -- Check if fixture hasn't started
  SELECT date INTO fixture_date FROM fixtures WHERE id = fixture_id;
  
  IF fixture_date <= NOW() THEN
    RAISE EXCEPTION 'Cannot predict after fixture has started';
  END IF;
  
  -- Insert or update prediction
  INSERT INTO user_predictions (
    user_id, fixture_id, predicted_home_score, predicted_away_score, updatedAt
  )
  VALUES (user_id, fixture_id, predicted_home, predicted_away, NOW())
  ON CONFLICT (user_id, fixture_id) 
  DO UPDATE SET
    predicted_home_score = EXCLUDED.predicted_home_score,
    predicted_away_score = EXCLUDED.predicted_away_score,
    updatedAt = NOW()
  RETURNING id INTO prediction_id;
  
  RETURN prediction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;