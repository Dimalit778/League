-- ============================================================================
-- Migration: subscription_security_fixes
-- Fixes 6 security vulnerabilities:
-- VULN-1: Block client-side subscription type escalation
-- VULN-2: Enforce ownership limits in create_new_league
-- VULN-3: Block joining locked leagues via join_league (SECURITY DEFINER bypasses RLS)
-- VULN-4: Enforce is_free competition gate in create_new_league
-- VULN-6: Fix choose_active_league — skip locking for non-FREE users
-- VULN-7: Fix prevent_league_status_client_update NULL-unsafe JWT check
-- ============================================================================

-- ============================================================================
-- VULN-7: Rewrite league status trigger with NULL-safe JWT role check
-- Original used `!= 'service_role'` which evaluates to NULL when claims are
-- absent (non-PostgREST callers), silently allowing the update.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_league_status_client_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claims_raw text;
  v_role       text;
BEGIN
  IF (NEW.status IS DISTINCT FROM OLD.status OR NEW.locked_reason IS DISTINCT FROM OLD.locked_reason) THEN
    v_claims_raw := current_setting('request.jwt.claims', true);
    IF v_claims_raw IS NOT NULL AND v_claims_raw <> '' THEN
      v_role := v_claims_raw::json->>'role';
    END IF;
    v_role := COALESCE(v_role, 'anon');
    IF v_role <> 'service_role' THEN
      RAISE EXCEPTION 'Unauthorized: league status can only be changed by the system';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- VULN-1: Prevent clients from writing subscription_type != 'FREE'
-- Any authenticated request coming through PostgREST has role = 'authenticated'
-- (not 'service_role'), so this trigger blocks direct PRO escalation via the
-- REST API while still allowing the RevenueCat webhook (service_role) to write
-- any value.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_subscription_type_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claims_raw text;
  v_role       text;
BEGIN
  v_claims_raw := current_setting('request.jwt.claims', true);
  IF v_claims_raw IS NOT NULL AND v_claims_raw <> '' THEN
    v_role := v_claims_raw::json->>'role';
  END IF;
  v_role := COALESCE(v_role, 'anon');
  IF v_role <> 'service_role' THEN
    IF NEW.subscription_type IS DISTINCT FROM 'FREE' THEN
      RAISE EXCEPTION 'Unauthorized: subscription type can only be set by the system';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_subscription_type_escalation ON public.subscription;
CREATE TRIGGER prevent_subscription_type_escalation
  BEFORE INSERT OR UPDATE ON public.subscription
  FOR EACH ROW EXECUTE FUNCTION public.prevent_subscription_type_escalation();

-- ============================================================================
-- VULN-2 + VULN-4: Enforce subscription limits and is_free gate in
-- create_new_league. The client-side guard in subscriptionGuards.ts is
-- bypassable via direct RPC calls — limits must be enforced here.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_new_league(
  league_name   text,
  max_members   int,
  competition_id int,
  nickname      text,
  avatar_url    text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id              uuid;
  v_join_code            text;
  v_league_id            uuid;
  v_owned_count          int;
  v_sub_type             text;
  v_is_free_competition  boolean;
  v_free_limit  CONSTANT int := 1;
  v_pro_limit   CONSTANT int := 3;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Resolve caller's current subscription plan
  SELECT subscription_type INTO v_sub_type
  FROM public.subscription
  WHERE user_id = v_user_id
  ORDER BY end_date DESC
  LIMIT 1;
  v_sub_type := COALESCE(v_sub_type, 'FREE');

  -- Count ACTIVE owned leagues (locked ones don't count against the limit)
  SELECT COUNT(*) INTO v_owned_count
  FROM public.leagues
  WHERE owner_id = v_user_id AND status = 'ACTIVE';

  -- Enforce per-plan ownership limit
  IF v_sub_type = 'FREE' AND v_owned_count >= v_free_limit THEN
    RAISE EXCEPTION 'Free plan is limited to % owned league', v_free_limit;
  ELSIF v_sub_type <> 'FREE' AND v_owned_count >= v_pro_limit THEN
    RAISE EXCEPTION 'Pro plan is limited to % owned leagues', v_pro_limit;
  END IF;

  -- Enforce is_free competition gate
  SELECT c.is_free INTO v_is_free_competition
  FROM public.competitions c
  WHERE c.id = competition_id;

  IF v_is_free_competition IS NULL THEN
    RAISE EXCEPTION 'Competition not found';
  END IF;

  IF v_sub_type = 'FREE' AND NOT v_is_free_competition THEN
    RAISE EXCEPTION 'This competition requires a Pro subscription';
  END IF;

  -- Generate unique join code
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

EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- ============================================================================
-- VULN-3: Block joining locked leagues inside join_league.
-- The RLS policy "block_members_on_locked_leagues" only applies to direct
-- INSERT statements. SECURITY DEFINER RPCs bypass RLS entirely, so this check
-- must live inside the function body.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.join_league(
  league_join_code  text,
  user_nickname     text,
  user_avatar_url   text DEFAULT NULL
)
RETURNS public.league_members
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id      uuid;
  v_league_id    uuid;
  v_league_record public.leagues;
  v_member_count int;
  v_member_record public.league_members;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT l.* INTO v_league_record
  FROM public.leagues l
  WHERE l.join_code = upper(league_join_code);

  IF v_league_record.id IS NULL THEN
    RAISE EXCEPTION 'League not found';
  END IF;

  -- Block joins to locked leagues (SECURITY DEFINER bypasses the RLS policy)
  IF v_league_record.status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'This league is currently locked and not accepting new members';
  END IF;

  v_league_id := v_league_record.id;

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

-- ============================================================================
-- VULN-6: Fix choose_active_league — PRO users must not have their leagues
-- locked. The function previously locked all other leagues unconditionally;
-- now it exits early for non-FREE subscribers.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.choose_active_league(p_league_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  uuid := auth.uid();
  v_sub_type text;
BEGIN
  -- Verify caller owns this league
  IF NOT EXISTS (
    SELECT 1 FROM leagues WHERE id = p_league_id AND owner_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Not found or unauthorized';
  END IF;

  -- PRO users are not limited to one league; nothing to lock
  SELECT subscription_type INTO v_sub_type
  FROM subscription
  WHERE user_id = v_user_id
  ORDER BY end_date DESC
  LIMIT 1;
  v_sub_type := COALESCE(v_sub_type, 'FREE');

  IF v_sub_type <> 'FREE' THEN
    RETURN;
  END IF;

  -- FREE plan: lock all other owned leagues
  UPDATE leagues
  SET status = 'LOCKED', locked_reason = 'FREE_LIMIT_EXCEEDED'
  WHERE owner_id = v_user_id
    AND id <> p_league_id
    AND status = 'ACTIVE';

  -- Ensure chosen league is active
  UPDATE leagues
  SET status = 'ACTIVE', locked_reason = NULL
  WHERE id = p_league_id AND owner_id = v_user_id;
END;
$$;
