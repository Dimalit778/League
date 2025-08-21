-- Function to get league members with sum of their prediction points
CREATE OR REPLACE FUNCTION public.get_league_members_with_points(p_league_id UUID)
RETURNS TABLE (
  user_id UUID,
  nickname TEXT,
  avatar_url TEXT,
  total_points INTEGER,
  predictions_count INTEGER
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
    COALESCE(SUM(p.points), 0)::INTEGER AS total_points,
    COUNT(p.id)::INTEGER AS predictions_count
  FROM 
    league_members lm
    LEFT JOIN predictions p ON lm.user_id = p.user_id AND lm.league_id = p.league_id
  WHERE 
    lm.league_id = p_league_id
  GROUP BY 
    lm.user_id, lm.nickname, lm.avatar_url
  ORDER BY 
    total_points DESC, predictions_count DESC, lm.nickname;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.get_league_members_with_points IS 'Returns all members of a league with their total prediction points';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_league_members_with_points TO authenticated;
