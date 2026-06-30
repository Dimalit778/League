-- PRO access is valid while expires_at is in the future (covers cancelled / billing_issue grace).

CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
BEGIN
  SELECT
    CASE
      WHEN us.plan = 'pro'
        AND (us.expires_at IS NULL OR us.expires_at > now())
      THEN 'pro'
      ELSE 'free'
    END
  INTO v_plan
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;

  RETURN COALESCE(v_plan, 'free');
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_plan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.create_new_league(
  league_name text,
  max_members integer,
  competition_id integer,
  nickname text,
  avatar_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id             uuid;
  v_join_code           text;
  v_league_id           uuid;
  v_plan                text;
  v_max_leagues         int;
  v_max_members_allowed int;
  v_total_leagues       int;
  v_is_free_competition boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  v_plan := public.get_user_plan(v_user_id);

  SELECT l.max_leagues, l.max_members
  INTO v_max_leagues, v_max_members_allowed
  FROM public.get_plan_limits(v_plan) l;

  SELECT COUNT(*) INTO v_total_leagues
  FROM public.league_members
  WHERE user_id = v_user_id;

  IF v_total_leagues >= v_max_leagues THEN
    RAISE EXCEPTION 'Plan limit: you can be in at most % leagues', v_max_leagues;
  END IF;

  IF max_members > v_max_members_allowed THEN
    RAISE EXCEPTION 'Plan limit: max % members per league', v_max_members_allowed;
  END IF;

  SELECT c.is_free INTO v_is_free_competition
  FROM public.competitions c
  WHERE c.id = competition_id;

  IF v_is_free_competition IS NULL THEN
    RAISE EXCEPTION 'Competition not found';
  END IF;

  IF v_plan = 'free' AND NOT v_is_free_competition THEN
    RAISE EXCEPTION 'This competition requires a PRO subscription';
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

CREATE OR REPLACE FUNCTION public.join_league(
  league_join_code text,
  user_nickname text,
  user_avatar_url text DEFAULT NULL
)
RETURNS public.league_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id             uuid;
  v_league_id           uuid;
  v_league_record       public.leagues;
  v_member_count        int;
  v_member_record       public.league_members;
  v_total_leagues       int;
  v_plan                text;
  v_max_leagues         int;
  v_is_free_competition boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  v_plan := public.get_user_plan(v_user_id);

  SELECT l.max_leagues
  INTO v_max_leagues
  FROM public.get_plan_limits(v_plan) l;

  SELECT COUNT(*) INTO v_total_leagues
  FROM public.league_members
  WHERE user_id = v_user_id;

  IF v_total_leagues >= v_max_leagues THEN
    RAISE EXCEPTION 'Plan limit: you can be in at most % leagues', v_max_leagues;
  END IF;

  SELECT l.* INTO v_league_record
  FROM public.leagues l
  WHERE l.join_code = upper(league_join_code);

  IF v_league_record.id IS NULL THEN
    RAISE EXCEPTION 'League not found';
  END IF;

  v_league_id := v_league_record.id;

  SELECT c.is_free INTO v_is_free_competition
  FROM public.competitions c
  WHERE c.id = v_league_record.competition_id;

  IF v_plan = 'free' AND NOT v_is_free_competition THEN
    RAISE EXCEPTION 'This competition requires a PRO subscription';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = v_league_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this league';
  END IF;

  SELECT COUNT(*) INTO v_member_count
  FROM public.league_members
  WHERE league_id = v_league_id;

  IF v_member_count >= v_league_record.max_members THEN
    RAISE EXCEPTION 'League is full';
  END IF;

  INSERT INTO public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  VALUES (v_league_id, v_user_id, user_nickname, user_avatar_url, false)
  RETURNING * INTO v_member_record;

  RETURN v_member_record;

EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;
