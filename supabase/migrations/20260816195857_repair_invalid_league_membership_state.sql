-- Repair legacy membership rows that have no usable active primary league.
-- A free user may only be repaired into a free competition; PRO users may use
-- any competition allowed by their current plan.
do $$
declare
  v_user_id uuid;
  v_primary_member_id uuid;
begin
  for v_user_id in
    select members.user_id
    from public.league_members members
    where members.user_id is not null
    group by members.user_id
    having not bool_or(members.active and members.is_primary)
  loop
    select members.id
    into v_primary_member_id
    from public.league_members members
    join public.leagues leagues on leagues.id = members.league_id
    join public.competitions competitions on competitions.id = leagues.competition_id
    join public.subscription_plans plans
      on plans.code = public.get_user_plan(v_user_id)
     and plans.is_active = true
    where members.user_id = v_user_id
      and (competitions.is_free or plans.can_use_premium_competitions)
    order by members.active desc, members.created_at asc, members.id asc
    limit 1;

    update public.league_members members
    set is_primary = false
    where members.user_id = v_user_id
      and members.is_primary;

    update public.league_members members
    set active = false
    from public.leagues leagues,
         public.competitions competitions,
         public.subscription_plans plans
    where members.user_id = v_user_id
      and members.active
      and leagues.id = members.league_id
      and competitions.id = leagues.competition_id
      and plans.code = public.get_user_plan(v_user_id)
      and plans.is_active = true
      and not (competitions.is_free or plans.can_use_premium_competitions);

    if v_primary_member_id is not null then
      update public.league_members
      set active = true,
          is_primary = true
      where id = v_primary_member_id;
    end if;
  end loop;
end;
$$;

-- The existing constraints guarantee that a primary membership is active and
-- unique. This deferred constraint closes the opposite gap: whenever a user
-- has an active membership, one of their memberships must be primary. Being
-- deferred allows the atomic activation RPC to clear and replace the primary
-- in separate statements inside the same transaction.
create or replace function public.ensure_active_membership_has_primary()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid;
begin
  foreach v_user_id in array array[
    case when tg_op <> 'INSERT' then old.user_id end,
    case when tg_op <> 'DELETE' then new.user_id end
  ]
  loop
    if v_user_id is not null
      and exists (
        select 1
        from public.league_members members
        where members.user_id = v_user_id
          and members.active
      )
      and not exists (
        select 1
        from public.league_members members
        where members.user_id = v_user_id
          and members.is_primary
      ) then
      raise exception 'An active league membership requires a primary league';
    end if;
  end loop;

  return null;
end;
$$;

revoke all on function public.ensure_active_membership_has_primary()
  from public, anon, authenticated;

drop trigger if exists ensure_active_membership_has_primary_after_write
  on public.league_members;
create constraint trigger ensure_active_membership_has_primary_after_write
after insert or update of active, is_primary, user_id or delete
on public.league_members
deferrable initially deferred
for each row execute function public.ensure_active_membership_has_primary();
