-- Cross-league leaderboard for a competition: one row per user, taking the
-- user's highest-scoring league membership when they belong to more than
-- one league for the same competition. Mirrors league_leaderboard_view's
-- point calculation but joins through leagues.competition_id instead of
-- restricting to the caller's own league (is_league_member), since the
-- whole point of this RPC is to cross leagues on purpose.
create or replace function public.get_competition_leaderboard(p_competition_id integer)
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
  select distinct on (ranked.user_id)
    ranked.member_id,
    ranked.league_id,
    ranked.user_id,
    ranked.nickname,
    ranked.avatar_url,
    ranked.total_points
  from (
    select
      lm.id as member_id,
      lm.league_id,
      lm.user_id,
      lm.nickname,
      lm.avatar_url,
      coalesce(sum(p.points), 0::bigint)::integer as total_points
    from public.league_members lm
    join public.leagues l on l.id = lm.league_id
    left join public.predictions p on p.league_member_id = lm.id
    where l.competition_id = p_competition_id
      and lm.user_id is not null
      and not public.has_blocked_user(lm.user_id)
    group by lm.id, lm.league_id, lm.user_id, lm.nickname, lm.avatar_url
  ) ranked
  order by ranked.user_id, ranked.total_points desc;
$$;

grant execute on function public.get_competition_leaderboard(integer) to authenticated;
