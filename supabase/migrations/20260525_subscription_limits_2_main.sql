-- ============================================================================
-- Migration: subscription_limits
-- Part 2 of 2: Column additions, indexes, and RLS policies
-- Depends on 20260525_subscription_limits_1_enums.sql being applied first.
-- ============================================================================

-- Depends on 20260525_subscription_limits_1_enums.sql being applied first
-- Migrates BASIC subscription rows to PRO (safe now that 'PRO' enum value is committed)
UPDATE public.subscription SET subscription_type = 'PRO' WHERE subscription_type = 'BASIC';

-- 5. Add status and locked_reason to leagues
ALTER TABLE public.leagues
  ADD COLUMN IF NOT EXISTS status public.league_status NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS locked_reason public.league_locked_reason;

-- 6. Add is_free to competitions (marks competitions accessible on free plan)
--    Default TRUE so all existing competitions remain accessible to free users
--    immediately after migration. Mark premium competitions is_free=false explicitly.
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT true;

-- 7. Mark 2 competitions as free (update these IDs to your actual free competitions)
-- UPDATE public.competitions SET is_free = true WHERE id IN (39, 140);

-- 8. Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_leagues_status ON public.leagues(status);

-- 9. RLS: block writes to locked leagues
--    Note: existing "Admin: Full access" permissive policies on both tables
--    already include WITH CHECK (public.is_admin()), so admins are not blocked
--    by these new permissive policies (permissive policies are OR-ed).

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
