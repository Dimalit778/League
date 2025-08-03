-- 4. CALCULATE PREDICTION POINTS FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_fixture_predictions(fixture_id BIGINT)
RETURNS VOID AS $$
DECLARE
  fixture_record RECORD;
  prediction RECORD;
  points_earned INTEGER;
BEGIN
  -- Get fixture details
  SELECT score_fulltime_home, score_fulltime_away 
  INTO fixture_record 
  FROM fixtures 
  WHERE id = fixture_id;
  
  -- Skip if no final scores
  IF fixture_record.score_fulltime_home IS NULL OR fixture_record.score_fulltime_away IS NULL THEN
    RETURN;
  END IF;
  
  -- Update all predictions for this fixture
  FOR prediction IN 
    SELECT id, predicted_home_score, predicted_away_score 
    FROM user_predictions 
    WHERE fixture_id = fixture_id
  LOOP
    -- Calculate points
    IF prediction.predicted_home_score = fixture_record.score_fulltime_home AND 
       prediction.predicted_away_score = fixture_record.score_fulltime_away THEN
      -- BINGO: Exact score match (3 points)
      points_earned := 3;
    ELSIF 
      -- HIT: Correct winner prediction (1 point)
      (prediction.predicted_home_score > prediction.predicted_away_score AND fixture_record.score_fulltime_home > fixture_record.score_fulltime_away) OR
      (prediction.predicted_home_score < prediction.predicted_away_score AND fixture_record.score_fulltime_home < fixture_record.score_fulltime_away) OR
      (prediction.predicted_home_score = prediction.predicted_away_score AND fixture_record.score_fulltime_home = fixture_record.score_fulltime_away)
    THEN
      points_earned := 1;
    ELSE
      -- MISS: Wrong prediction (0 points)
      points_earned := 0;
    END IF;
    
    -- Update prediction points
    UPDATE user_predictions 
    SET points = points_earned, updatedAt = NOW()
    WHERE id = prediction.id;
  END LOOP;
  
  -- Update user total points in profiles table
  UPDATE profiles 
  SET 
    points = (SELECT COALESCE(SUM(points), 0) FROM user_predictions WHERE user_id = profiles.id),
    updatedAt = NOW()
  WHERE id IN (
    SELECT DISTINCT user_id FROM user_predictions WHERE fixture_id = fixture_id
  );
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
