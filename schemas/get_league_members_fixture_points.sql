-- Function to get league members points for a specific fixture
CREATE OR REPLACE FUNCTION public.get_league_members_fixture_points(p_league_id UUID, p_fixture_id INTEGER)
RETURNS TABLE (
  user_id UUID,
  nickname TEXT,
  avatar_url TEXT,
  home_score INTEGER,
  away_score INTEGER,
  winner TEXT,
  points INTEGER,
  is_processed BOOLEAN
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
    p.home_score,
    p.away_score,
    p.winner,
    p.points,
    p.is_processed
  FROM 
    league_members lm
    LEFT JOIN predictions p ON lm.user_id = p.user_id 
                          AND lm.league_id = p.league_id
                          AND p.fixture_id = p_fixture_id
  WHERE 
    lm.league_id = p_league_id
  ORDER BY 
    p.points DESC NULLS LAST, lm.nickname;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.get_league_members_fixture_points IS 'Returns all members of a league with their prediction points for a specific fixture';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_league_members_fixture_points TO authenticated;
