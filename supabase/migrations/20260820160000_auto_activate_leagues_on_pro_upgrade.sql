-- Auto-activate a user's leagues when their subscription becomes Pro.
--
-- Fires on the transition into an *effective* Pro plan (first purchase, or a
-- renewal after a prior expiry) from ANY source: the client `sync-subscription`
-- Edge Function or the RevenueCat webhook. This closes the gap where buying Pro
-- from the paywall (settings / join / create-league entry points) left the
-- user's inactive Pro-only leagues switched off, while only the my-leagues
-- screen path activated them.
--
-- Guarantees:
--   * Idempotent and bounded by the Pro `max_active_leagues` limit.
--   * Only runs on a genuine free -> pro transition, so hourly sandbox RENEWAL
--     writes never re-activate leagues a Pro user deliberately deactivated.
--   * Never runs on a downgrade (pro -> free); demotion stays owned by the
--     webhook / limit enforcement.
--   * Preserves the "an active membership requires a primary" invariant.

create or replace function public.activate_leagues_on_pro_upgrade()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := new.user_id;
  v_old_was_pro boolean := false;
  v_new_is_pro boolean;
  v_max_leagues integer;
  v_active_count integer;
  v_slots integer;
  v_primary_exists boolean;
  v_next_primary uuid;
begin
  if v_user_id is null then
    return null;
  end if;

  -- Effective plan after this write (reads the row we just changed).
  v_new_is_pro := public.get_user_plan(v_user_id) = 'pro';

  if tg_op = 'UPDATE' then
    v_old_was_pro := old.plan = 'pro'
      and (old.expires_at is null or old.expires_at > now());
  end if;

  -- Only act on a genuine transition into Pro.
  if not v_new_is_pro or v_old_was_pro then
    return null;
  end if;

  select limits.max_leagues
  into v_max_leagues
  from public.get_plan_limits('pro') limits;

  if v_max_leagues is null then
    return null;
  end if;

  -- Serialize with the membership RPCs (set_primary_league,
  -- update_my_league_activation) for this user.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select count(*)
  into v_active_count
  from public.league_members
  where user_id = v_user_id
    and active;

  v_slots := v_max_leagues - v_active_count;

  if v_slots > 0 then
    update public.league_members
    set active = true
    where id in (
      select lm.id
      from public.league_members lm
      where lm.user_id = v_user_id
        and not lm.active
      order by lm.created_at asc, lm.id asc
      limit v_slots
    );
  end if;

  -- If the user now has active memberships but no primary (e.g. all leagues
  -- were previously inactive), promote the oldest active one so the deferred
  -- primary-membership constraint holds at commit.
  select exists (
    select 1
    from public.league_members
    where user_id = v_user_id
      and is_primary
  )
  into v_primary_exists;

  if not v_primary_exists then
    select lm.id
    into v_next_primary
    from public.league_members lm
    where lm.user_id = v_user_id
      and lm.active
    order by lm.created_at asc, lm.id asc
    limit 1;

    if v_next_primary is not null then
      update public.league_members
      set is_primary = true
      where id = v_next_primary;
    end if;
  end if;

  return null;
end;
$$;

revoke all on function public.activate_leagues_on_pro_upgrade() from public, anon;

drop trigger if exists activate_leagues_on_pro_upgrade_after_write
  on public.user_subscriptions;
create trigger activate_leagues_on_pro_upgrade_after_write
after insert or update of plan, expires_at on public.user_subscriptions
for each row
execute function public.activate_leagues_on_pro_upgrade();
