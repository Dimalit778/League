-- Tighten the remaining public authorization surface without paid features.

-- The catalog is read-only for app users. RLS already blocks writes, but the
-- grants should express that intent as well and fail before policy evaluation.
revoke all on table public.pro_seasons from anon, authenticated;
grant select on table public.pro_seasons to authenticated;

-- Trigger functions are invoked by PostgreSQL, never directly by API clients.
revoke all on function public.normalize_league_input() from public, anon, authenticated;
revoke all on function public.normalize_league_member_input() from public, anon, authenticated;
revoke all on function public.protect_league_fields() from public, anon, authenticated;
revoke all on function public.protect_league_member_fields() from public, anon, authenticated;

-- Used by the authenticated storage policy only.
revoke all on function public.rls_is_member_self(uuid) from public, anon;
grant execute on function public.rls_is_member_self(uuid) to authenticated, service_role;

-- Keep join-code lookup behind authentication even if grants drift later.
create or replace function public.find_league_by_code(p_join_code text)
returns table(
  league_id uuid,
  league_name text,
  competition_name text,
  competition_logo text,
  competition_area text,
  competition_flag text,
  members_count integer,
  max_members integer,
  owner_nickname text
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    l.id,
    l.name,
    c.name,
    c.logo,
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
  where auth.uid() is not null
    and l.join_code = p_join_code
  group by l.id, l.name, c.name, c.logo, c.area, c.flag, l.max_members, owner_lm.nickname;
$function$;

revoke all on function public.find_league_by_code(text) from public, anon;
grant execute on function public.find_league_by_code(text) to authenticated, service_role;
