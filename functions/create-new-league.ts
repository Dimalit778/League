DECLARE
  new_league_id UUID;
  result JSON;
BEGIN
  -- Insert the league
  INSERT INTO leagues (name, join_code, competition_id, owner_id)
  VALUES (p_league_name, p_join_code, p_competition_id, p_owner_id)
  RETURNING id INTO new_league_id;
  
  -- Clear all existing primary leagues for this user
  UPDATE league_members 
  SET primary_league = FALSE 
  WHERE user_id = p_owner_id;
  
  -- Insert league member with primary = true
  INSERT INTO league_members (league_id, user_id, primary_league)
  VALUES (new_league_id, p_owner_id, TRUE);
  
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'league_id', new_league_id
  ) INTO result;
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'success', false,
    'error', SQLERRM
  ) INTO result;
  
  RETURN result;