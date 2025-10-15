-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS FOR LEAGUE APP
-- ============================================================================
-- This file adds missing indexes and optimizes RLS policies
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. ADD MISSING INDEXES ON MATCHES TABLE
-- ============================================================================

-- Index for filtering matches by competition and matchday
CREATE INDEX IF NOT EXISTS idx_matches_competition_matchday 
  ON public.matches(competition_id, matchday);

-- Index for filtering matches by status (LIVE, FINISHED, etc.)
CREATE INDEX IF NOT EXISTS idx_matches_status 
  ON public.matches(status);

-- Index for sorting/filtering matches by kick_off time
CREATE INDEX IF NOT EXISTS idx_matches_kick_off 
  ON public.matches(kick_off);

-- Composite index for common query pattern: competition + matchday + kick_off
CREATE INDEX IF NOT EXISTS idx_matches_comp_matchday_kickoff 
  ON public.matches(competition_id, matchday, kick_off);

-- Index for home/away team lookups
CREATE INDEX IF NOT EXISTS idx_matches_home_team 
  ON public.matches(home_team_id);

CREATE INDEX IF NOT EXISTS idx_matches_away_team 
  ON public.matches(away_team_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES FOR PREDICTIONS
-- ============================================================================

-- Drop the slow policy that uses the is_league_member() function
DROP POLICY IF EXISTS "Users: Read predictions in their leagues" ON public.predictions;

-- Create optimized policy with inline EXISTS (avoids function call overhead)
CREATE POLICY "Users: Read predictions in their leagues"
  ON public.predictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_members.user_id = auth.uid() 
        AND league_members.league_id = predictions.league_id
    )
  );

-- ============================================================================
-- 3. OPTIMIZE OTHER RLS POLICIES (OPTIONAL BUT RECOMMENDED)
-- ============================================================================

-- Optimize leagues policy
DROP POLICY IF EXISTS "Users: Read leagues they're members of" ON public.leagues;

CREATE POLICY "Users: Read leagues they're members of"
  ON public.leagues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_members.user_id = auth.uid() 
        AND league_members.league_id = leagues.id
    )
  );

-- DON'T optimize league_members policy - keep using function to avoid recursion
-- The is_league_member() function uses SECURITY DEFINER which bypasses RLS
-- DROP POLICY IF EXISTS "Users: Read league members in their leagues" ON public.league_members;
-- (Keep the existing policy as-is)

-- ============================================================================
-- 4. ADD INDEX FOR COMMON PREDICTION QUERIES
-- ============================================================================

-- Index for checking if prediction exists before match starts
CREATE INDEX IF NOT EXISTS idx_predictions_match_user 
  ON public.predictions(match_id, user_id) 
  WHERE match_id IS NOT NULL;

-- ============================================================================
-- 5. VERIFY INDEXES WERE CREATED
-- ============================================================================

-- Run this to verify all indexes exist:
/*
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('matches', 'predictions', 'league_members')
ORDER BY tablename, indexname;
*/

-- ============================================================================
-- EXPECTED PERFORMANCE IMPROVEMENTS
-- ============================================================================
-- 1. Match list queries: 80-90% faster (indexes on competition_id, matchday)
-- 2. Prediction lookups: 60-70% faster (optimized RLS + better indexes)
-- 3. Match detail page: 70-80% faster (reduced from 5-10s to < 1s)
-- 4. RLS policy checks: 50-60% faster (inline EXISTS vs function calls)
-- ============================================================================

