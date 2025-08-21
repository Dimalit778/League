-- Function to generate a unique join code for leagues
CREATE OR REPLACE FUNCTION public.generate_league_join_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  generated_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a random 6-digit number as text
    generated_code := lpad(floor(random() * 1000000)::text, 6, '0');

    -- Check if the code already exists in the leagues table
    SELECT EXISTS (SELECT 1 FROM public.leagues WHERE join_code = generated_code) INTO code_exists;

    -- If the code does not exist, exit the loop
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;

  -- Set the new join_code for the inserted row
  NEW.join_code := generated_code;

  -- Return the modified NEW row
  RETURN NEW;
END;
$$;

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email) 
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$;

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

-- Create trigger for generating join codes
CREATE OR REPLACE TRIGGER set_league_join_code
BEFORE INSERT ON public.leagues
FOR EACH ROW
WHEN (new.join_code IS NULL)
EXECUTE FUNCTION public.generate_league_join_code();

-- Create trigger for handling new users
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_league_member_predictions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_league_members_with_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_league_members_fixture_points TO authenticated;

-- Add comments to functions
COMMENT ON FUNCTION public.get_league_member_predictions IS 'Returns all predictions made by members of a specific league';
COMMENT ON FUNCTION public.get_league_members_with_points IS 'Returns all members of a league with their total prediction points';
COMMENT ON FUNCTION public.get_league_members_fixture_points IS 'Returns all members of a league with their prediction points for a specific fixture';