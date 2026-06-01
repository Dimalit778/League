-- Align subscription enforcement with the app model:
-- FREE, BASIC, PREMIUM. Legacy PRO rows are treated as BASIC.

UPDATE public.subscription
SET subscription_type = 'BASIC'
WHERE subscription_type = 'PRO';

CREATE OR REPLACE FUNCTION public.create_new_league(
  league_name text,
  max_members int,
  competition_id int,
  nickname text,
  avatar_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_join_code text;
  v_league_id uuid;
  v_owned_count int;
  v_sub_type text;
  v_is_free_competition boolean;
  v_owned_leagues_limit int;
  v_allowed_member_sizes int[];
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT subscription_type INTO v_sub_type
  FROM public.subscription
  WHERE user_id = v_user_id
    AND end_date >= now()
  ORDER BY end_date DESC
  LIMIT 1;
  v_sub_type := COALESCE(v_sub_type, 'FREE');

  IF v_sub_type = 'PREMIUM' THEN
    v_owned_leagues_limit := 5;
    v_allowed_member_sizes := ARRAY[6, 10, 20];
  ELSIF v_sub_type = 'BASIC' OR v_sub_type = 'PRO' THEN
    v_owned_leagues_limit := 3;
    v_allowed_member_sizes := ARRAY[6, 10];
  ELSE
    v_owned_leagues_limit := 1;
    v_allowed_member_sizes := ARRAY[6];
  END IF;

  SELECT COUNT(*) INTO v_owned_count
  FROM public.leagues
  WHERE owner_id = v_user_id AND status = 'ACTIVE';

  IF v_owned_count >= v_owned_leagues_limit THEN
    RAISE EXCEPTION 'Current plan is limited to % owned league(s)', v_owned_leagues_limit;
  END IF;

  IF NOT max_members = ANY(v_allowed_member_sizes) THEN
    RAISE EXCEPTION 'Current plan does not allow leagues with % members', max_members;
  END IF;

  SELECT c.is_free INTO v_is_free_competition
  FROM public.competitions c
  WHERE c.id = competition_id;

  IF v_is_free_competition IS NULL THEN
    RAISE EXCEPTION 'Competition not found';
  END IF;

  IF v_sub_type = 'FREE' AND NOT v_is_free_competition THEN
    RAISE EXCEPTION 'This competition requires an upgraded subscription';
  END IF;

  LOOP
    v_join_code := upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 7));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.leagues WHERE join_code = v_join_code);
  END LOOP;

  UPDATE public.league_members
  SET is_primary = false
  WHERE user_id = v_user_id;

  INSERT INTO public.leagues (name, max_members, competition_id, owner_id, join_code)
  VALUES (league_name, max_members, competition_id, v_user_id, v_join_code)
  RETURNING id INTO v_league_id;

  INSERT INTO public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  VALUES (v_league_id, v_user_id, nickname, avatar_url, true);

  RETURN v_league_id;
END;
$$;
