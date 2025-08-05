DROP VIEW IF EXISTS league_leaderboard;

-- Create view with security_invoker
CREATE OR REPLACE VIEW league_leaderboard 
WITH (security_invoker=on) AS
SELECT
  l.id AS league_id,
  l.name AS league_name,
  lm.nickname,
  lm.points,
  p.id AS user_id,
  p.first_name,
  p.avatar_url
FROM
  league_members lm
  JOIN leagues l ON lm.league_id = l.id
  JOIN profiles p ON lm.user_id = p.id
WHERE
  lm.league_id = (
    SELECT league_id
    FROM league_members
    WHERE user_id = auth.uid()
      AND primary_league = true
  )
ORDER BY
  lm.points DESC;