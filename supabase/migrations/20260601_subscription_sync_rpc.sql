-- Allow verified post-purchase sync from the app via SECURITY DEFINER RPC.
-- Direct client upserts of type != 'FREE' remain blocked by the trigger.

CREATE OR REPLACE FUNCTION public.prevent_subscription_type_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claims_raw text;
  v_role       text;
  v_sync_user  text;
BEGIN
  v_sync_user := current_setting('app.subscription_sync_user_id', true);
  IF v_sync_user <> '' AND v_sync_user = NEW.user_id::text THEN
    RETURN NEW;
  END IF;

  v_claims_raw := current_setting('request.jwt.claims', true);
  IF v_claims_raw IS NOT NULL AND v_claims_raw <> '' THEN
    v_role := v_claims_raw::json->>'role';
  END IF;
  v_role := COALESCE(v_role, 'anon');
  IF v_role <> 'service_role' THEN
    IF NEW.type IS DISTINCT FROM 'FREE' THEN
      RAISE EXCEPTION 'Unauthorized: subscription type can only be set by the system';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_subscription_from_revenuecat(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_product_id text DEFAULT NULL,
  p_transaction_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_end_date <= now() THEN
    RAISE EXCEPTION 'Invalid subscription end date';
  END IF;

  PERFORM set_config('app.subscription_sync_user_id', v_user_id::text, true);

  INSERT INTO public.subscription (
    user_id,
    type,
    start_date,
    end_date,
    product_id,
    transaction_id
  )
  VALUES (
    v_user_id,
    'PRO',
    p_start_date,
    p_end_date,
    p_product_id,
    p_transaction_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    type = EXCLUDED.type,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    product_id = EXCLUDED.product_id,
    transaction_id = COALESCE(EXCLUDED.transaction_id, subscription.transaction_id),
    updated_at = now();

  PERFORM set_config('app.subscription_sync_user_id', '', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_subscription_from_revenuecat TO authenticated;
