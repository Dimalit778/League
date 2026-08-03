-- Preserve league and prediction history after account deletion while removing
-- the link back to the deleted person.

alter table public.league_members
  add column if not exists anonymized_at timestamptz;

alter table public.league_members
  alter column user_id drop not null;

alter table public.leagues
  alter column owner_id drop not null;

alter table public.league_members
  drop constraint if exists league_members_user_id_fkey;

alter table public.league_members
  add constraint league_members_user_id_fkey
  foreign key (user_id) references public.users(id) on delete set null;

alter table public.leagues
  drop constraint if exists leagues_owner_id_fkey;

alter table public.leagues
  add constraint leagues_owner_id_fkey
  foreign key (owner_id) references public.users(id) on delete set null;

-- Deleted players all receive the same neutral display name. Uniqueness is
-- still enforced for members that are attached to a real account.
alter table public.league_members
  drop constraint if exists league_members_nickname_key;

drop index if exists public.league_members_nickname_key;

create unique index if not exists league_members_identified_nickname_key
  on public.league_members (league_id, nickname)
  where user_id is not null;

-- Prevent bypassing provider and storage cleanup through the legacy RPC.
drop function if exists public.delete_own_account();

create or replace function public.anonymize_user_account(
  p_user_id uuid,
  p_revenuecat_app_user_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anonymized_members integer := 0;
  v_transferred_leagues integer := 0;
  v_archived_leagues integer := 0;
  v_deleted_events integer := 0;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Only the service role may anonymize accounts'
      using errcode = '42501';
  end if;

  if p_user_id is null then
    raise exception 'User id is required' using errcode = '22004';
  end if;

  select
    count(*) filter (where candidate.next_owner_id is not null),
    count(*) filter (where candidate.next_owner_id is null)
  into v_transferred_leagues, v_archived_leagues
  from (
    select (
      select lm.user_id
      from public.league_members lm
      where lm.league_id = l.id
        and lm.user_id is not null
        and lm.user_id <> p_user_id
        and lm.active = true
      order by lm.created_at asc, lm.id asc
      limit 1
    ) as next_owner_id
    from public.leagues l
    where l.owner_id = p_user_id
  ) candidate;

  -- Transfer ownership when another active member exists. A league with no
  -- successor is retained as an ownerless historical league.
  update public.leagues l
  set owner_id = (
        select lm.user_id
        from public.league_members lm
        where lm.league_id = l.id
          and lm.user_id is not null
          and lm.user_id <> p_user_id
          and lm.active = true
        order by lm.created_at asc, lm.id asc
        limit 1
      ),
      updated_at = now()
  where l.owner_id = p_user_id;

  update public.league_members
  set user_id = null,
      nickname = 'Deleted Player',
      avatar_url = null,
      active = false,
      is_primary = false,
      anonymized_at = coalesce(anonymized_at, now()),
      updated_at = now()
  where user_id = p_user_id;

  get diagnostics v_anonymized_members = row_count;

  delete from public.admin_users where user_id = p_user_id;
  delete from public.subscription_sync_attempts where user_id = p_user_id;
  delete from public.user_subscriptions where user_id = p_user_id;

  delete from public.revenuecat_events rce
  where rce.app_user_id = p_user_id::text
     or (p_revenuecat_app_user_id is not null and rce.app_user_id = p_revenuecat_app_user_id)
     or rce.payload #>> '{event,app_user_id}' = p_user_id::text
     or rce.payload #>> '{event,original_app_user_id}' = p_user_id::text
     or (
       p_revenuecat_app_user_id is not null
       and (
         rce.payload #>> '{event,app_user_id}' = p_revenuecat_app_user_id
         or rce.payload #>> '{event,original_app_user_id}' = p_revenuecat_app_user_id
       )
     )
     or exists (
       select 1
       from jsonb_array_elements_text(
         case
           when jsonb_typeof(rce.payload #> '{event,aliases}') = 'array'
             then rce.payload #> '{event,aliases}'
           else '[]'::jsonb
         end
       ) alias(value)
       where alias.value = p_user_id::text
          or (p_revenuecat_app_user_id is not null and alias.value = p_revenuecat_app_user_id)
     );

  get diagnostics v_deleted_events = row_count;

  -- The auth user is removed by the Edge Function after this transaction.
  -- Removing the public profile here guarantees that no identity fields remain.
  delete from public.users where id = p_user_id;

  return jsonb_build_object(
    'anonymized_members', v_anonymized_members,
    'transferred_leagues', v_transferred_leagues,
    'ownerless_historical_leagues', v_archived_leagues,
    'deleted_revenuecat_events', v_deleted_events
  );
end;
$$;

revoke all on function public.anonymize_user_account(uuid, text)
  from public, anon, authenticated;
grant execute on function public.anonymize_user_account(uuid, text)
  to service_role;

-- Anonymized members remain visible in historical leaderboards but do not use
-- an active seat or count toward subscription limits.
create or replace function public.join_league(
  league_join_code text,
  user_nickname text,
  user_avatar_url text default null
)
returns public.league_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id             uuid;
  v_league_id           uuid;
  v_league_record       public.leagues;
  v_member_count        int;
  v_member_record       public.league_members;
  v_total_leagues       int;
  v_plan                text;
  v_max_leagues         int;
  v_is_free_competition boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  v_plan := public.get_user_plan(v_user_id);

  select l.max_leagues
  into v_max_leagues
  from public.get_plan_limits(v_plan) l;

  select count(*) into v_total_leagues
  from public.league_members
  where user_id = v_user_id
    and active = true;

  if v_total_leagues >= v_max_leagues then
    raise exception 'Plan limit: you can be in at most % leagues', v_max_leagues;
  end if;

  select l.* into v_league_record
  from public.leagues l
  where l.join_code = upper(league_join_code);

  if v_league_record.id is null then
    raise exception 'League not found';
  end if;

  v_league_id := v_league_record.id;

  select c.is_free into v_is_free_competition
  from public.competitions c
  where c.id = v_league_record.competition_id;

  if v_plan = 'free' and not v_is_free_competition then
    raise exception 'This competition requires a PRO subscription';
  end if;

  if exists (
    select 1 from public.league_members
    where league_id = v_league_id and user_id = v_user_id
  ) then
    raise exception 'You are already a member of this league';
  end if;

  select count(*) into v_member_count
  from public.league_members
  where league_id = v_league_id
    and active = true
    and user_id is not null;

  if v_member_count >= v_league_record.max_members then
    raise exception 'League is full';
  end if;

  insert into public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  values (v_league_id, v_user_id, user_nickname, user_avatar_url, false)
  returning * into v_member_record;

  return v_member_record;
exception
  when others then
    raise exception '%', sqlerrm;
end;
$$;

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
security definer
set search_path = public
as $$
  select
    l.id,
    l.name,
    c.name,
    c.logo,
    c.area,
    c.flag,
    count(lm.id) filter (where lm.active = true and lm.user_id is not null)::integer,
    l.max_members,
    owner_lm.nickname
  from public.leagues l
  join public.competitions c on c.id = l.competition_id
  left join public.league_members lm on lm.league_id = l.id
  left join public.league_members owner_lm
    on owner_lm.league_id = l.id and owner_lm.user_id = l.owner_id
  where l.join_code = upper(p_join_code)
  group by l.id, l.name, c.name, c.logo, c.area, c.flag, l.max_members, owner_lm.nickname;
$$;

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
  c.season_id as competition_season_id
from ranked r
join public.leagues l on l.id = r.league_id
join public.competitions c on c.id = l.competition_id;
