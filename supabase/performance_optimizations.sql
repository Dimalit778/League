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