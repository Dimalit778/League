-- 1. Remove old column from users (if exists from previous migration)
ALTER TABLE public.users DROP COLUMN IF EXISTS subscription_tier;

-- 2. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'inactive',
  entitlement_id text,
  product_id text,
  revenuecat_app_user_id text,
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_plan_check
    CHECK (plan IN ('free', 'pro')),
  CONSTRAINT user_subscriptions_status_check
    CHECK (status IN ('active', 'inactive', 'expired', 'cancelled', 'billing_issue'))
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Trigger: auto-create subscription row on new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'inactive')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- 4. get_plan_limits() — returns limits per plan
CREATE OR REPLACE FUNCTION public.get_plan_limits(p_plan text)
RETURNS TABLE (max_leagues int, max_members int)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF p_plan = 'pro' THEN
    RETURN QUERY SELECT 5, 12;
  ELSE
    RETURN QUERY SELECT 2, 6;
  END IF;
END;
$$;

-- 5. create_new_league — uses user_subscriptions + get_plan_limits
-- Keep the existing RPC name so current clients get server-side plan enforcement.
CREATE OR REPLACE FUNCTION public.create_new_league(
  league_name    text,
  max_members    int,
  competition_id int,
  nickname       text,
  avatar_url     text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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

  SELECT COALESCE(us.plan, 'free') INTO v_plan
  FROM public.user_subscriptions us
  WHERE us.user_id = v_user_id;

  v_plan := COALESCE(v_plan, 'free');

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
