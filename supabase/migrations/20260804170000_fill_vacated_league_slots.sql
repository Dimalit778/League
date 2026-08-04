-- When leaving an active league creates enough room for every remaining
-- inactive membership, reactivate those memberships automatically. If there
-- are more inactive memberships than available seats, leave the choice to the
-- user in My Leagues.

create or replace function public.fill_available_league_slots_if_unambiguous(
  p_user_id uuid
)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_leagues integer;
  v_active_count integer;
  v_available_slots integer;
  v_inactive_member_ids uuid[];
  v_inactive_count integer;
begin
  if p_user_id is null then
    return array[]::uuid[];
  end if;

  select limits.max_leagues
  into v_max_leagues
  from public.get_plan_limits(public.get_user_plan(p_user_id)) limits;

  if v_max_leagues is null then
    raise exception 'Subscription plan limits are not configured';
  end if;

  select count(*)
  into v_active_count
  from public.league_members lm
  where lm.user_id = p_user_id
    and lm.active = true;

  v_available_slots := greatest(v_max_leagues - v_active_count, 0);

  select coalesce(
    array_agg(lm.id order by lm.created_at asc, lm.id asc),
    array[]::uuid[]
  )
  into v_inactive_member_ids
  from public.league_members lm
  where lm.user_id = p_user_id
    and lm.active = false;

  v_inactive_count := cardinality(v_inactive_member_ids);

  if v_available_slots > 0
    and v_inactive_count > 0
    and v_inactive_count <= v_available_slots then
    update public.league_members
    set active = true
    where user_id = p_user_id
      and id = any(v_inactive_member_ids);

    return v_inactive_member_ids;
  end if;

  return array[]::uuid[];
end;
$$;

revoke all on function public.fill_available_league_slots_if_unambiguous(uuid)
  from public, anon, authenticated;
grant execute on function public.fill_available_league_slots_if_unambiguous(uuid)
  to service_role;

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
  v_was_active boolean;
  v_league_name text;
  v_other_members_count integer;
  v_new_owner_id uuid;
  v_next_primary_member_id uuid;
  v_activated_member_ids uuid[] := array[]::uuid[];
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

  select lm.is_primary, lm.active
  into v_is_primary_league, v_was_active
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

  if v_was_active then
    v_activated_member_ids :=
      public.fill_available_league_slots_if_unambiguous(v_user_id);
  end if;

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

    return jsonb_build_object(
      'success', true,
      'message', 'League deleted',
      'activated_member_ids', to_jsonb(v_activated_member_ids)
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'message', format('Left %s', v_league_name),
    'activated_member_ids', to_jsonb(v_activated_member_ids)
  );
end;
$$;

revoke all on function public.leave_league(uuid) from public, anon;
grant execute on function public.leave_league(uuid)
  to authenticated, service_role;
