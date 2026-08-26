-- Scale the one unbounded read path: get_competition_leaderboard crosses every
-- league of a competition (distinct on user, taking each user's best league),
-- so its row set grows linearly with how many people play that competition --
-- unlike the per-league views, which are capped by leagues.max_members.
--
-- Two problems at high user counts:
--   1. `not has_blocked_user(lm.user_id)` was a SECURITY DEFINER function call
--      per candidate row. SECURITY DEFINER functions cannot be inlined, so the
--      planner ran N separate calls (each an EXISTS probe) instead of one join.
--      Replaced with a set-based LEFT JOIN ... IS NULL anti-join on user_blocks.
--   2. The result was ordered by user_id (a distinct-on requirement) and the
--      client sorted + rendered the entire competition. The output is now
--      ordered by total_points in SQL and gains optional p_limit / p_offset so
--      callers can page instead of pulling every row.
--
-- Behaviour-neutral by default: p_limit defaults to NULL (all rows), and the
-- anti-join reproduces has_blocked_user exactly (including the auth.uid() IS NULL
-- case, where nothing is treated as blocked).

-- Drop the old single-argument function so the new defaulted signature replaces
-- it instead of creating an overload.
drop function if exists public.get_competition_leaderboard(integer);

create function public.get_competition_leaderboard(
  p_competition_id integer,
  p_limit integer default null,
  p_offset integer default 0
)
returns table (
  member_id uuid,
  league_id uuid,
  user_id uuid,
  nickname text,
  avatar_url text,
  total_points integer
)
language sql
stable
security definer
set search_path = public
as $$
  with best_per_user as (
    select distinct on (lm.user_id)
      lm.id         as member_id,
      lm.league_id,
      lm.user_id,
      lm.nickname,
      lm.avatar_url,
      coalesce(s.total_points, 0) as total_points
    from public.league_members lm
    join public.leagues l on l.id = lm.league_id
    left join public.league_member_standings s on s.league_member_id = lm.id
    -- Anti-join: exclude users the caller has blocked, without a per-row
    -- function call. When auth.uid() is null the join never matches, so no one
    -- is excluded -- matching has_blocked_user's null-caller behaviour.
    left join public.user_blocks ub
      on ub.blocker_user_id = auth.uid()
     and ub.blocked_user_id = lm.user_id
    where l.competition_id = p_competition_id
      and lm.user_id is not null
      and ub.blocker_user_id is null
    order by lm.user_id, coalesce(s.total_points, 0) desc
  )
  select
    member_id, league_id, user_id, nickname, avatar_url, total_points
  from best_per_user
  order by total_points desc, user_id
  offset coalesce(p_offset, 0)
  limit p_limit;
$$;

revoke all on function public.get_competition_leaderboard(integer, integer, integer)
  from public, anon;
grant execute on function public.get_competition_leaderboard(integer, integer, integer)
  to authenticated;
