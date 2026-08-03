-- Keep membership state changes behind audited, atomic RPCs.
-- Direct clients may edit profile fields, but cannot toggle subscription seats
-- or primary-league routing flags.

-- Repair legacy state before adding invariants. An inactive or anonymized
-- membership cannot be primary.
update public.league_members
set is_primary = false
where is_primary = true
  and (active = false or user_id is null);

-- If legacy writes created duplicate (or missing) primary memberships, retain
-- the oldest active membership as the canonical primary for each user.
with desired_primary as (
  select distinct on (lm.user_id)
    lm.user_id,
    lm.id
  from public.league_members lm
  where lm.user_id is not null
    and lm.active = true
  order by lm.user_id, lm.is_primary desc, lm.created_at asc, lm.id asc
)
update public.league_members lm
set is_primary = (lm.id = dp.id)
from desired_primary dp
where lm.user_id = dp.user_id
  and lm.is_primary is distinct from (lm.id = dp.id);

alter table public.league_members
  drop constraint if exists league_members_primary_requires_active;
alter table public.league_members
  add constraint league_members_primary_requires_active
  check (not is_primary or active);

create unique index if not exists league_members_one_primary_per_user
  on public.league_members (user_id)
  where is_primary = true and user_id is not null;

create or replace function public.protect_league_member_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- SECURITY DEFINER membership RPCs are owned by postgres. Service-role jobs
  -- also need to perform trusted lifecycle operations such as anonymization.
  if current_user = 'postgres' or auth.role() = 'service_role' then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
    or new.league_id is distinct from old.league_id
    or new.created_at is distinct from old.created_at
    or new.active is distinct from old.active
    or new.is_primary is distinct from old.is_primary then
    raise exception 'Protected league membership fields cannot be changed directly';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_league_member_fields_before_update on public.league_members;
create trigger protect_league_member_fields_before_update
before update on public.league_members
for each row execute function public.protect_league_member_fields();

-- Ownership transfer is also performed by a trusted SECURITY DEFINER RPC.
-- Keep direct owner/relationship edits blocked while allowing that RPC to run.
create or replace function public.protect_league_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'postgres' or auth.role() = 'service_role' then
    return new;
  end if;

  if new.owner_id is distinct from old.owner_id
    or new.join_code is distinct from old.join_code
    or new.competition_id is distinct from old.competition_id
    or new.max_members is distinct from old.max_members
    or new.created_at is distinct from old.created_at then
    raise exception 'Protected league fields cannot be changed directly';
  end if;

  return new;
end;
$$;

-- Remove the broad table UPDATE grant. Profile updates remain available and
-- continue to be constrained by the existing self/admin RLS policy.
revoke update on table public.league_members from anon, authenticated;
grant update (nickname, avatar_url) on table public.league_members to authenticated;

create or replace function public.set_primary_league(p_league_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_member_id uuid;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  -- Serialize primary/activation changes for this user.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select lm.id
  into v_member_id
  from public.league_members lm
  where lm.league_id = p_league_id
    and lm.user_id = v_user_id
    and lm.active = true
  for update;

  if v_member_id is null then
    raise exception 'Active league membership not found';
  end if;

  update public.league_members
  set is_primary = false
  where user_id = v_user_id
    and is_primary = true;

  update public.league_members
  set is_primary = true
  where id = v_member_id;

  return json_build_object(
    'success', true,
    'member_id', v_member_id,
    'league_id', p_league_id
  );
end;
$$;

revoke all on function public.set_primary_league(uuid) from public, anon;
grant execute on function public.set_primary_league(uuid) to authenticated, service_role;

create or replace function public.update_my_league_activation(
  p_active_member_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_requested_ids uuid[];
  v_requested_count integer;
  v_owned_count integer;
  v_total_count integer;
  v_max_leagues integer;
  v_primary_member_id uuid;
  v_primary_league_id uuid;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  select coalesce(array_agg(distinct requested_id), array[]::uuid[])
  into v_requested_ids
  from unnest(coalesce(p_active_member_ids, array[]::uuid[])) requested_id
  where requested_id is not null;

  v_requested_count := cardinality(v_requested_ids);

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select count(*)
  into v_total_count
  from public.league_members lm
  where lm.user_id = v_user_id;

  if v_total_count = 0 then
    raise exception 'User has no league memberships';
  end if;

  if v_requested_count = 0 then
    raise exception 'At least one active league is required';
  end if;

  select limits.max_leagues
  into v_max_leagues
  from public.get_plan_limits(public.get_user_plan(v_user_id)) limits;

  if v_max_leagues is null then
    raise exception 'Subscription plan limits are not configured';
  end if;

  if v_requested_count > v_max_leagues then
    raise exception 'Plan limit: you can activate at most % leagues', v_max_leagues;
  end if;

  select count(*)
  into v_owned_count
  from public.league_members lm
  where lm.user_id = v_user_id
    and lm.id = any(v_requested_ids);

  if v_owned_count <> v_requested_count then
    raise exception 'Invalid league selection';
  end if;

  -- Preserve the current primary when it remains selected; otherwise choose a
  -- deterministic fallback before applying the state change.
  select lm.id, lm.league_id
  into v_primary_member_id, v_primary_league_id
  from public.league_members lm
  where lm.user_id = v_user_id
    and lm.id = any(v_requested_ids)
  order by lm.is_primary desc, lm.created_at asc, lm.id asc
  limit 1;

  update public.league_members
  set is_primary = false
  where user_id = v_user_id
    and is_primary = true;

  update public.league_members
  set active = (id = any(v_requested_ids))
  where user_id = v_user_id
    and active is distinct from (id = any(v_requested_ids));

  update public.league_members
  set is_primary = true
  where id = v_primary_member_id;

  return jsonb_build_object(
    'success', true,
    'primary_member_id', v_primary_member_id,
    'primary_league_id', v_primary_league_id,
    'active_member_ids', to_jsonb(v_requested_ids)
  );
end;
$$;

revoke all on function public.update_my_league_activation(uuid[]) from public, anon;
grant execute on function public.update_my_league_activation(uuid[])
  to authenticated, service_role;

-- Keep existing lifecycle RPCs compatible with the new invariant: when the
-- primary membership disappears, only an active membership may replace it.
create or replace function public.delete_owned_league(p_league_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted_count integer;
  v_next_primary_member_id uuid;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  delete from public.leagues
  where id = p_league_id
    and owner_id = v_user_id;

  get diagnostics v_deleted_count = row_count;

  if v_deleted_count = 0 then
    raise exception 'League not found or you are not the owner';
  end if;

  select lm.id
  into v_next_primary_member_id
  from public.league_members lm
  where lm.user_id = v_user_id
    and lm.active = true
  order by lm.is_primary desc, lm.created_at asc, lm.id asc
  limit 1;

  update public.league_members
  set is_primary = false
  where user_id = v_user_id
    and is_primary = true;

  if v_next_primary_member_id is not null then
    update public.league_members
    set is_primary = true
    where id = v_next_primary_member_id;
  end if;

  return json_build_object(
    'success', true,
    'league_id', p_league_id,
    'next_primary_set', v_next_primary_member_id is not null
  );
end;
$$;

revoke all on function public.delete_owned_league(uuid) from public, anon;
grant execute on function public.delete_owned_league(uuid)
  to authenticated, service_role;

create or replace function public.leave_league(p_league_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_league_owner_id uuid;
  v_is_primary_league boolean;
  v_league_name text;
  v_other_members_count integer;
  v_new_owner_id uuid;
  v_next_primary_member_id uuid;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select l.owner_id, l.name
  into v_league_owner_id, v_league_name
  from public.leagues l
  where l.id = p_league_id
  for update;

  if v_league_owner_id is null then
    raise exception 'League not found';
  end if;

  select lm.is_primary
  into v_is_primary_league
  from public.league_members lm
  where lm.user_id = v_user_id
    and lm.league_id = p_league_id
  for update;

  if v_is_primary_league is null then
    raise exception 'User is not a member of this league';
  end if;

  select count(*)
  into v_other_members_count
  from public.league_members lm
  where lm.league_id = p_league_id
    and lm.user_id is not null
    and lm.user_id <> v_user_id;

  if v_league_owner_id = v_user_id and v_other_members_count > 0 then
    select lm.user_id
    into v_new_owner_id
    from public.league_members lm
    where lm.league_id = p_league_id
      and lm.user_id is not null
      and lm.user_id <> v_user_id
    order by lm.active desc, lm.created_at asc, lm.id asc
    limit 1;

    update public.leagues
    set owner_id = v_new_owner_id
    where id = p_league_id;
  end if;

  delete from public.league_members
  where user_id = v_user_id
    and league_id = p_league_id;

  if v_is_primary_league then
    select lm.id
    into v_next_primary_member_id
    from public.league_members lm
    where lm.user_id = v_user_id
      and lm.active = true
    order by lm.created_at asc, lm.id asc
    limit 1;

    update public.league_members
    set is_primary = false
    where user_id = v_user_id
      and is_primary = true;

    if v_next_primary_member_id is not null then
      update public.league_members
      set is_primary = true
      where id = v_next_primary_member_id;
    end if;
  end if;

  if v_league_owner_id = v_user_id and v_other_members_count = 0 then
    delete from public.leagues
    where id = p_league_id;

    return jsonb_build_object('success', true, 'message', 'League deleted');
  end if;

  return jsonb_build_object(
    'success', true,
    'message', format('Left %s', v_league_name)
  );
end;
$$;

revoke all on function public.leave_league(uuid) from public, anon;
grant execute on function public.leave_league(uuid)
  to authenticated, service_role;
