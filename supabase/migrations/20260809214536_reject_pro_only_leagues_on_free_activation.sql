-- update_my_league_activation validated selection count and ownership, but
-- never checked whether a free-plan user was keeping a PRO-only-competition
-- league active (e.g. after their subscription lapses). Add that check,
-- mirroring the same free/PRO gating already enforced in create_new_league
-- and join_league.
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
  v_plan text;
  v_max_leagues integer;
  v_pro_only_count integer;
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

  v_plan := public.get_user_plan(v_user_id);

  select limits.max_leagues
  into v_max_leagues
  from public.get_plan_limits(v_plan) limits;

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

  if v_plan = 'free' then
    select count(*)
    into v_pro_only_count
    from public.league_members lm
    join public.leagues l on l.id = lm.league_id
    join public.competitions c on c.id = l.competition_id
    where lm.id = any(v_requested_ids)
      and c.is_free = false;

    if v_pro_only_count > 0 then
      raise exception 'This selection includes a PRO-only league; upgrade or choose a different league';
    end if;
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
