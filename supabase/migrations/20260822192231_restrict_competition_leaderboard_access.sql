-- The competition leaderboard intentionally crosses league RLS boundaries, but
-- only a participant in that competition (or an admin) should be able to read
-- it. Derive access from auth.uid() inside the privileged function so callers
-- cannot enumerate profiles from competitions they do not participate in.
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
  where (select auth.uid()) is not null
    and (
      public.is_admin()
      or exists (
        select 1
        from public.league_members caller_membership
        join public.leagues caller_league
          on caller_league.id = caller_membership.league_id
        where caller_membership.user_id = (select auth.uid())
          and caller_membership.active = true
          and caller_league.competition_id = p_competition_id
      )
    )
  order by ranked.user_id, ranked.total_points desc;
$$;

revoke all on function public.get_competition_leaderboard(integer) from public, anon, service_role;
grant execute on function public.get_competition_leaderboard(integer) to authenticated;
