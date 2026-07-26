-- Expose the competition's current season id in the league summary view so the
-- league switcher can populate PrimaryLeagueStore.seasonId without an extra query.
CREATE OR REPLACE VIEW public.member_league_summary_view AS
 WITH ranked AS (
         SELECT lm.id AS member_id,
            lm.league_id,
            lm.nickname,
            lm.is_primary,
            lm.active,
            COALESCE(sum(p.points), 0::bigint)::integer AS total_points,
            rank() OVER (PARTITION BY lm.league_id ORDER BY (COALESCE(sum(p.points), 0::bigint)) DESC) AS rank
           FROM league_members lm
             LEFT JOIN predictions p ON p.league_member_id = lm.id
          GROUP BY lm.id, lm.league_id, lm.nickname, lm.is_primary, lm.active
        )
 SELECT r.member_id,
    r.league_id,
    r.nickname,
    l.name AS league_name,
    c.name AS competition_name,
    c.logo AS competition_logo,
    r.total_points,
    r.rank,
    ( SELECT count(*)::integer AS count
           FROM league_members lm2
          WHERE lm2.league_id = r.league_id) AS members_count,
    r.is_primary,
    r.active,
    l.competition_id,
    c.season_id AS competition_season_id
   FROM ranked r
     JOIN leagues l ON l.id = r.league_id
     JOIN competitions c ON c.id = l.competition_id;
