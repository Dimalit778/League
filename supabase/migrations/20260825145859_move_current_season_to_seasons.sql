-- Contract stage for the seasons normalization introduced by
-- 20260825130000_add_seasons_table.sql.
--
-- From this migration onward public.seasons is the only owner of football
-- season metadata and progress. public.competitions keeps stable competition
-- metadata only.

-- Keep the league summary API stable while changing its source from the
-- legacy competition columns to the normalized current season row.
create or replace view public.member_league_summary_view
with (security_invoker = true) as
with ranked as (
  select
    lm.id as member_id,
    lm.league_id,
    lm.nickname,
    lm.is_primary,
    lm.active,
    coalesce(st.total_points, 0) as total_points,
    rank() over (
      partition by lm.league_id
      order by coalesce(st.total_points, 0) desc
    ) as rank
  from public.league_members lm
  left join public.league_member_standings st
    on st.league_member_id = lm.id
)
select
  r.member_id,
  r.league_id,
  r.nickname,
  l.name as league_name,
  c.name as competition_name,
  c.flag as competition_flag,
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
  current_season.id as competition_season_id,
  c.is_free as competition_is_free
from ranked r
join public.leagues l on l.id = r.league_id
join public.competitions c on c.id = l.competition_id
left join public.seasons current_season
  on current_season.competition_id = c.id
 and current_season.is_current;

revoke all privileges on public.member_league_summary_view
  from public, anon, authenticated;
grant select on public.member_league_summary_view
  to authenticated, service_role;

-- The expand-stage trigger made competitions the canonical writer. Every
-- application and sync writer now targets seasons, so remove the compatibility
-- path before removing its source columns.
drop trigger if exists trg_competitions_sync_season on public.competitions;
drop function if exists public.tg_sync_season_from_competition();

alter table public.competitions
  drop column if exists season_id,
  drop column if exists current_matchday,
  drop column if exists current_stage,
  drop column if exists total_matchdays,
  drop column if exists season_start,
  drop column if exists season_end;

-- Admin competition creation remains atomic: stable competition metadata and
-- its optional first current season are created in one database transaction.
create or replace function public.admin_create_competition(
  p_id integer,
  p_name text,
  p_area text,
  p_code text,
  p_flag text,
  p_logo text,
  p_type text default 'league',
  p_season_id integer default null,
  p_current_stage text default null
)
returns public.competitions
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created_competition public.competitions;
begin
  if (select auth.uid()) is null or not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  insert into public.competitions (
    id, name, area, code, flag, logo, type, updated_at
  )
  values (
    p_id, p_name, p_area, p_code, p_flag, p_logo,
    coalesce(nullif(btrim(p_type), ''), 'league'), now()
  )
  returning * into created_competition;

  if p_season_id is not null then
    update public.seasons
       set is_current = false,
           updated_at = now()
     where competition_id = p_id
       and is_current;

    insert into public.seasons (
      id, competition_id, current_stage, is_current, updated_at
    )
    values (
      p_season_id, p_id, p_current_stage, true, now()
    )
    on conflict (id) do update set
      competition_id = excluded.competition_id,
      current_stage = excluded.current_stage,
      is_current = true,
      updated_at = now();
  end if;

  return created_competition;
end;
$$;

revoke all on function public.admin_create_competition(
  integer, text, text, text, text, text, text, integer, text
) from public, anon, authenticated;
grant execute on function public.admin_create_competition(
  integer, text, text, text, text, text, text, integer, text
) to authenticated;
