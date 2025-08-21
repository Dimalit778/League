-- Function to get all predictions for members of a specific league
CREATE OR REPLACE FUNCTION public.get_league_member_predictions(p_league_id UUID)
RETURNS TABLE (
  user_id UUID,
  nickname TEXT,
  avatar_url TEXT,
  fixture_id INTEGER,
  home_score INTEGER,
  away_score INTEGER,
  winner TEXT,
  points INTEGER,
  is_processed BOOLEAN,
  created_at TIMESTAMPTZ,
  prediction_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lm.user_id,
    lm.nickname,
    lm.avatar_url,
    p.fixture_id,
    p.home_score,
    p.away_score,
    p.winner,
    p.points,
    p.is_processed,
    p.created_at,
    p.id AS prediction_id
  FROM 
    league_members lm
    JOIN predictions p ON lm.user_id = p.user_id AND lm.league_id = p.league_id
  WHERE 
    lm.league_id = p_league_id
  ORDER BY 
    lm.nickname, p.fixture_id;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.get_league_member_predictions IS 'Returns all predictions made by members of a specific league';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_league_member_predictions TO authenticated;
