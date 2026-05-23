-- Remove columns that duplicate subscription_type logic and are never read
ALTER TABLE public.subscription DROP COLUMN IF EXISTS access_advanced_stats;
ALTER TABLE public.subscription DROP COLUMN IF EXISTS can_add_members;

-- Add columns needed by RevenueCat webhook
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Prevent duplicate transactions (idempotent webhook delivery)
CREATE UNIQUE INDEX IF NOT EXISTS subscription_transaction_id_idx
  ON public.subscription(transaction_id)
  WHERE transaction_id IS NOT NULL;

-- Deduplicate: keep only the most recent row per user before adding UNIQUE constraint.
-- RevenueCat is the source of truth for history — we only need one row per user here.
DELETE FROM public.subscription s1
USING public.subscription s2
WHERE s1.user_id = s2.user_id
  AND s1.created_at < s2.created_at;

-- One subscription row per user — full UNIQUE required so Supabase JS upsert
-- can target the constraint with onConflict: 'user_id'.
ALTER TABLE public.subscription
  DROP CONSTRAINT IF EXISTS subscription_user_id_unique;
ALTER TABLE public.subscription
  ADD CONSTRAINT subscription_user_id_unique UNIQUE (user_id);
