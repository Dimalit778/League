-- member_league_summary_view powers the "My Leagues" list, including the
-- vacant-slot activation picker for free-plan users. It never exposed
-- whether a league's competition is PRO-only, so that picker couldn't tell
-- a free league apart from a PRO-only one. Add competition_is_free.
create or replace view public.member_league_summary_view as
with ranked as (
  select
    lm.id as member_id,
    lm.league_id,
    lm.nickname,
    lm.is_primary,
    lm.active,
    coalesce(sum(p.points), 0::bigint)::integer as total_points,
    rank() over (
      partition by lm.league_id
      order by coalesce(sum(p.points), 0::bigint) desc
    ) as rank
  from public.league_members lm
  left join public.predictions p on p.league_member_id = lm.id
  group by lm.id, lm.league_id, lm.nickname, lm.is_primary, lm.active
)
select
  r.member_id,
  r.league_id,
  r.nickname,
  l.name as league_name,
  c.name as competition_name,
  c.logo as competition_logo,
  r.total_points,
  r.rank,
  (
    select count(*)::integer
    from public.league_members lm2
    where lm2.league_id = r.league_id
      and lm2.active = true
      and lm2.user_id is not null
  ) as members_count,
  r.is_primary,
  r.active,
  l.competition_id,
  c.season_id as competition_season_id,
  c.is_free as competition_is_free
from ranked r
join public.leagues l on l.id = r.league_id
join public.competitions c on c.id = l.competition_id;
