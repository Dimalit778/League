-- Trigger function: block client-side status/locked_reason changes
CREATE OR REPLACE FUNCTION public.prevent_league_status_client_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only service_role can change status or locked_reason
  IF (NEW.status IS DISTINCT FROM OLD.status OR NEW.locked_reason IS DISTINCT FROM OLD.locked_reason) THEN
    IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
      RAISE EXCEPTION 'Unauthorized: league status can only be changed by the system';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_league_status_client_update ON public.leagues;
CREATE TRIGGER prevent_league_status_client_update
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_league_status_client_update();

-- RPC: let free users choose which league stays active (SECURITY DEFINER bypasses trigger)
CREATE OR REPLACE FUNCTION public.choose_active_league(p_league_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  -- Verify caller owns this league
  IF NOT EXISTS (
    SELECT 1 FROM leagues WHERE id = p_league_id AND owner_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Not found or unauthorized';
  END IF;

  -- Lock all other owned leagues
  UPDATE leagues
  SET status = 'LOCKED', locked_reason = 'FREE_LIMIT_EXCEEDED'
  WHERE owner_id = v_user_id
    AND id != p_league_id
    AND status = 'ACTIVE';

  -- Ensure chosen league is active
  UPDATE leagues
  SET status = 'ACTIVE', locked_reason = NULL
  WHERE id = p_league_id AND owner_id = v_user_id;
END;
$$;
