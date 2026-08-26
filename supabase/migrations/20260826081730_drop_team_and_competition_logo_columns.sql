-- Remove licensed logo assets from the relational model. Drop and recreate the
-- two RPCs that reference competitions.logo explicitly so we do not rely on
-- CASCADE and accidentally remove unrelated database objects.
set lock_timeout = '5s';
set statement_timeout = '30s';

drop function if exists public.admin_create_competition(
  integer, text, text, text, text, text, text, integer, text
);

drop function if exists public.find_league_by_code(text);

alter table public.teams
  drop column if exists logo;

alter table public.competitions
  drop column if exists logo;

create function public.admin_create_competition(
  p_id integer,
  p_name text,
  p_area text,
  p_code text,
  p_flag text,
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
    id, name, area, code, flag, type, updated_at
  )
  values (
    p_id, p_name, p_area, p_code, p_flag,
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
  integer, text, text, text, text, text, integer, text
) from public, anon, authenticated;
grant execute on function public.admin_create_competition(
  integer, text, text, text, text, text, integer, text
) to authenticated;

create function public.find_league_by_code(p_join_code text)
returns table(
  league_id uuid,
  league_name text,
  competition_name text,
  competition_area text,
  competition_flag text,
  members_count integer,
  max_members integer,
  owner_nickname text
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    l.id,
    l.name,
    c.name,
    c.area,
    c.flag,
    count(lm.id)::integer,
    l.max_members,
    owner_lm.nickname
  from public.leagues l
  join public.competitions c on c.id = l.competition_id
  left join public.league_members lm on lm.league_id = l.id
  left join public.league_members owner_lm
    on owner_lm.league_id = l.id
   and owner_lm.user_id = l.owner_id
  where (select auth.uid()) is not null
    and l.join_code = p_join_code
  group by l.id, l.name, c.name, c.area, c.flag, l.max_members, owner_lm.nickname;
$$;

revoke all on function public.find_league_by_code(text) from public, anon;
grant execute on function public.find_league_by_code(text) to authenticated, service_role;
