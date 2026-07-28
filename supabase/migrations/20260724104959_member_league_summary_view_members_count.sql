DROP VIEW IF EXISTS public.member_league_summary_view;

CREATE VIEW public.member_league_summary_view AS
 WITH ranked AS (
         SELECT lm.id AS member_id,
            lm.league_id,
            lm.nickname,
            COALESCE(sum(p.points), 0::bigint)::integer AS total_points,
            rank() OVER (PARTITION BY lm.league_id ORDER BY (COALESCE(sum(p.points), 0::bigint)) DESC) AS rank
           FROM league_members lm
             LEFT JOIN predictions p ON p.league_member_id = lm.id
          GROUP BY lm.id, lm.league_id, lm.nickname
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
          WHERE lm2.league_id = r.league_id) AS members_count
   FROM ranked r
     JOIN leagues l ON l.id = r.league_id
     JOIN competitions c ON c.id = l.competition_id;;
