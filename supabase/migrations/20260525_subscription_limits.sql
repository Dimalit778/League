-- 1. Add PRO to subscription_type enum
ALTER TYPE public.subscription_type ADD VALUE IF NOT EXISTS 'PRO';

-- 2. Migrate BASIC rows to PRO
UPDATE public.subscription SET subscription_type = 'PRO' WHERE subscription_type = 'BASIC';

-- 3. Create league_status enum
DO $$ BEGIN
  CREATE TYPE public.league_status AS ENUM ('ACTIVE', 'LOCKED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Create league_locked_reason enum
DO $$ BEGIN
  CREATE TYPE public.league_locked_reason AS ENUM (
    'SUBSCRIPTION_EXPIRED',
    'FREE_LIMIT_EXCEEDED',
    'PRO_REQUIRED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Add status and locked_reason to leagues
ALTER TABLE public.leagues
  ADD COLUMN IF NOT EXISTS status public.league_status NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS locked_reason public.league_locked_reason;

-- 6. Add is_free to competitions (marks competitions accessible on free plan)
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;

-- 7. Mark 2 competitions as free (update these IDs to your actual free competitions)
-- UPDATE public.competitions SET is_free = true WHERE id IN (39, 140);

-- 8. RLS: block writes to locked leagues

-- Block predictions on locked leagues
DROP POLICY IF EXISTS "block_predictions_on_locked_leagues" ON public.predictions;
CREATE POLICY "block_predictions_on_locked_leagues"
  ON public.predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT l.status FROM public.leagues l
     JOIN public.league_members lm ON lm.league_id = l.id
     WHERE lm.id = league_member_id) = 'ACTIVE'
  );

-- Block inviting members to locked leagues
DROP POLICY IF EXISTS "block_members_on_locked_leagues" ON public.league_members;
CREATE POLICY "block_members_on_locked_leagues"
  ON public.league_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT status FROM public.leagues WHERE id = league_id) = 'ACTIVE'
  );
