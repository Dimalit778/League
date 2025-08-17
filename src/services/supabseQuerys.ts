// 1. Get User's Leagues with Member Count
// SELECT 
//     l.*,
//     lm.joined_at,
//     l.current_members,
//     (l.owner_id = auth.uid()) as is_owner
// FROM leagues l
// JOIN league_members lm ON l.id = lm.league_id
// WHERE lm.user_id = auth.uid() 
//     AND lm.is_active = TRUE
//     AND l.is_active = TRUE
// ORDER BY l.created_at DESC;

// 2. Get League Matches (for prediction)
// SELECT 
//     m.*,
//     ht.name as home_team_name,
//     ht.crest_url as home_team_crest,
//     at.name as away_team_name,
//     at.crest_url as away_team_crest,
//     p.predicted_home_score,
//     p.predicted_away_score,
//     p.points_earned
// FROM matches m
// JOIN teams ht ON m.home_team_id = ht.id
// JOIN teams at ON m.away_team_id = at.id
// LEFT JOIN predictions p ON m.id = p.match_id 
//     AND p.user_id = auth.uid() 
//     AND p.league_id = $1
// WHERE m.competition_id = (
//     SELECT competition_id FROM leagues WHERE id = $1
// )
// ORDER BY m.utc_date ASC;

// 3. Get League Leaderboard
// SELECT 
//     ls.*,
//     p.name,
//     p.avatar_url,
//     ROW_NUMBER() OVER (ORDER BY ls.total_points DESC, ls.bingo_predictions DESC) as rank
// FROM league_standings ls
// JOIN profiles p ON ls.user_id = p.id
// WHERE ls.league_id = $1
// ORDER BY ls.total_points DESC, ls.bingo_predictions DESC;

// 4. Get All Predictions for a Match (in a league)
// SELECT 
//     pr.*,
//     p.name,
//     p.avatar_url
// FROM predictions pr
// JOIN profiles p ON pr.user_id = p.id
// WHERE pr.match_id = $1 
//     AND pr.league_id = $2
// ORDER BY pr.created_at ASC;
// // ------------------
// 1. Function to Update Points After Match Completion
// CREATE OR REPLACE FUNCTION update_prediction_points()
// RETURNS TRIGGER AS $$
// BEGIN
//     -- Update predictions when match is finished
//     IF NEW.is_finished = TRUE AND OLD.is_finished = FALSE THEN
//         UPDATE predictions SET
//             points_earned = CASE
//                 WHEN predicted_home_score = NEW.full_time_home_score 
//                      AND predicted_away_score = NEW.full_time_away_score 
//                 THEN 3  -- Bingo (exact score)
//                 WHEN (predicted_home_score > predicted_away_score AND NEW.full_time_home_score > NEW.full_time_away_score)
//                      OR (predicted_home_score < predicted_away_score AND NEW.full_time_home_score < NEW.full_time_away_score)
//                      OR (predicted_home_score = predicted_away_score AND NEW.full_time_home_score = NEW.full_time_away_score)
//                 THEN 1  -- Hit (correct winner)
//                 ELSE 0  -- Miss
//             END,
//             prediction_type = CASE
//                 WHEN predicted_home_score = NEW.full_time_home_score 
//                      AND predicted_away_score = NEW.full_time_away_score 
//                 THEN 'bingo'
//                 WHEN (predicted_home_score > predicted_away_score AND NEW.full_time_home_score > NEW.full_time_away_score)
//                      OR (predicted_home_score < predicted_away_score AND NEW.full_time_home_score < NEW.full_time_away_score)
//                      OR (predicted_home_score = predicted_away_score AND NEW.full_time_home_score = NEW.full_time_away_score)
//                 THEN 'hit'
//                 ELSE 'miss'
//             END,
//             is_processed = TRUE
//         WHERE match_id = NEW.id;
        
//         -- Update league standings
//         PERFORM update_league_standings();
//     END IF;
    
//     RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;
 
// CREATE TRIGGER trigger_update_prediction_points
//     AFTER UPDATE ON matches
//     FOR EACH ROW
//     EXECUTE FUNCTION update_prediction_points();
