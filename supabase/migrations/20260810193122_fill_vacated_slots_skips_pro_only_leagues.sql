-- fill_available_league_slots_if_unambiguous (invoked from leave_league) only
-- checked max_leagues before auto-reactivating a user's inactive memberships.
-- It never checked competitions.is_free, so a free-plan user leaving an
-- active league could have a PRO-only inactive league auto-reactivated —
-- the same bypass update_my_league_activation was patched against
-- (20260809214536_reject_pro_only_leagues_on_free_activation.sql), just via
-- the auto-fill path instead of the manual picker.
--
-- Fix: only consider inactive memberships whose competition is free (or all
-- of them, if the user is on PRO) as candidates for the unambiguous auto-fill.
-- A PRO-only inactive league is simply never a candidate for this RPC to
-- silently reactivate; it stays inactive until the user manually picks it
-- via My Leagues (which itself is now PRO-gated).
create or replace function public.fill_available_league_slots_if_unambiguous(
  p_user_id uuid
)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_max_leagues integer;
  v_active_count integer;
  v_available_slots integer;
  v_inactive_member_ids uuid[];
  v_inactive_count integer;
begin
  if p_user_id is null then
    return array[]::uuid[];
  end if;

  v_plan := public.get_user_plan(p_user_id);

  select limits.max_leagues
  into v_max_leagues
  from public.get_plan_limits(v_plan) limits;

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
  join public.leagues l on l.id = lm.league_id
  join public.competitions c on c.id = l.competition_id
  where lm.user_id = p_user_id
    and lm.active = false
    and (v_plan <> 'free' or c.is_free = true);

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
;
