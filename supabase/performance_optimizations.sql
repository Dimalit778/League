-- Performance optimizations for predictions table
-- Run these SQL commands in your Supabase SQL editor

-- 1. Create composite index for user_id and match_id (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_predictions_user_match 
ON predictions (user_id, match_id);

-- 2. Create index for league_id and match_id (for league predictions)
CREATE INDEX IF NOT EXISTS idx_predictions_league_match 
ON predictions (league_id, match_id);

-- 3. Create index for user_id and created_at (for user predictions ordering)
CREATE INDEX IF NOT EXISTS idx_predictions_user_created 
ON predictions (user_id, created_at DESC);

-- 4. Create index for match_id (for fixture-based queries)
CREATE INDEX IF NOT EXISTS idx_predictions_match_id 
ON predictions (match_id);

-- 5. Create partial index for active predictions (not finished)
CREATE INDEX IF NOT EXISTS idx_predictions_active 
ON predictions (user_id, match_id) 
WHERE is_finished = false;

-- 6. Analyze table statistics for better query planning
ANALYZE predictions;

-- ============================================================================
-- Performance optimizations for league_members table (for avatar storage policies)
-- ============================================================================
-- These indexes optimize the storage policy helper functions that check
-- membership and ownership when accessing avatar files in the storage bucket

-- 1. Composite index for user_id and league_id (most common query pattern)
-- Optimizes: is_member_of_league() and is_owner_and_league_matches()
CREATE INDEX IF NOT EXISTS idx_league_members_user_league 
ON league_members (user_id, league_id);

-- 2. Composite index for user_id, league_id, and id (for complex ownership checks)
-- Optimizes: is_owner_and_league_matches() - most efficient for path-based checks
CREATE INDEX IF NOT EXISTS idx_league_members_user_league_id 
ON league_members (user_id, league_id, id);

-- 3. Index for user_id alone (for ownership checks without league context)
-- Optimizes: is_owner_of_member() when checking by user_id and id
CREATE INDEX IF NOT EXISTS idx_league_members_user_id 
ON league_members (user_id);

-- 4. Index for league_id (for league-based queries)
-- Optimizes: queries filtering by league_id
CREATE INDEX IF NOT EXISTS idx_league_members_league_id 
ON league_members (league_id);

-- 5. Analyze table statistics for better query planning
ANALYZE league_members;