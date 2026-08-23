-- The public API must only expose a caller-scoped plan lookup. Server-owned
-- triggers still need to resolve a plan for the row they are processing, so
-- keep that capability in a schema that is not exposed through PostgREST.
create schema if not exists private authorization postgres;
revoke all on schema private from public, anon, authenticated;

create or replace function private.resolve_user_plan(p_user_id uuid)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (
      select subscriptions.plan
      from public.user_subscriptions subscriptions
      join public.subscription_plans plans
        on plans.code = subscriptions.plan
       and plans.is_active = true
      where subscriptions.user_id = p_user_id
        and (
          plans.is_default = true
          or subscriptions.expires_at > now()
        )
      limit 1
    ),
    (
      select plans.code
      from public.subscription_plans plans
      where plans.is_default = true
        and plans.is_active = true
      limit 1
    )
  );
$$;

revoke all on function private.resolve_user_plan(uuid)
  from public, anon, authenticated;

create or replace function public.get_my_plan()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when (select auth.uid()) is null then null
    else coalesce(
      (
        select subscriptions.plan
        from public.user_subscriptions subscriptions
        join public.subscription_plans plans
          on plans.code = subscriptions.plan
         and plans.is_active = true
        where subscriptions.user_id = (select auth.uid())
          and (
            plans.is_default = true
            or subscriptions.expires_at > now()
          )
        limit 1
      ),
      (
        select plans.code
        from public.subscription_plans plans
        where plans.is_default = true
          and plans.is_active = true
        limit 1
      )
    )
  end;
$$;

revoke all on function public.get_my_plan() from public, anon;
grant execute on function public.get_my_plan() to authenticated;

-- These server-owned functions genuinely act on a supplied row/user. Rewrite
-- only their internal call site to the non-exposed resolver while preserving
-- their current bodies and grants.
do $do$
declare
  target record;
  original_definition text;
  updated_definition text;
begin
  for target in
    select procedures.oid
    from pg_proc procedures
    join pg_namespace namespaces on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.prokind = 'f'
      and procedures.proname = any(array[
        'activate_leagues_on_pro_upgrade',
        'create_new_league',
        'enforce_league_plan_access',
        'enforce_membership_plan_access',
        'enforce_prediction_plan_access',
        'fill_available_league_slots_if_unambiguous',
        'get_match_ai_summary',
        'join_league',
        'update_my_league_activation'
      ])
  loop
    original_definition := pg_get_functiondef(target.oid);
    updated_definition := replace(
      original_definition,
      'public.get_user_plan(',
      'private.resolve_user_plan('
    );

    if updated_definition = original_definition then
      raise exception 'Expected get_user_plan dependency was not found in function %',
        target.oid::regprocedure;
    end if;

    execute updated_definition;
  end loop;
end
$do$;

create or replace function public.get_my_subscription_access()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'plan_code', plans.code,
    'is_default', plans.is_default,
    'status', coalesce(subscriptions.status, 'inactive'),
    'expires_at', subscriptions.expires_at,
    'limits', jsonb_build_object(
      'max_active_leagues', plans.max_active_leagues,
      'max_members_per_league', plans.max_members_per_league,
      'weekly_ai_analyses', plans.weekly_ai_analyses
    ),
    'capabilities', jsonb_build_object(
      'premium_competitions', plans.can_use_premium_competitions,
      'advanced_stats', plans.has_advanced_stats
    )
  )
  from public.subscription_plans plans
  left join public.user_subscriptions subscriptions
    on subscriptions.user_id = (select auth.uid())
  where plans.code = public.get_my_plan()
    and (select auth.uid()) is not null
  limit 1;
$$;

revoke all on function public.get_my_subscription_access() from public, anon;
grant execute on function public.get_my_subscription_access()
  to authenticated, service_role;

drop function public.get_user_plan(uuid);

-- Legacy helpers: none are referenced by current policies, triggers, views or
-- application RPCs. Removing them also closes unnecessary SECURITY DEFINER
-- entry points into league membership and auth.users.
drop function if exists public.is_member_in_league(uuid, uuid);
drop function if exists public.rls_is_user_in_league(uuid);
drop function if exists public.user_exists(uuid);

-- Account deletion is an internal, service-role-only transaction. Harden its
-- search path, serialize retries for the same user, and rely on the explicit
-- EXECUTE grant instead of the deprecated auth.role() helper.
create or replace function public.anonymize_user_account(
  p_user_id uuid,
  p_revenuecat_app_user_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_anonymized_members integer := 0;
  v_transferred_leagues integer := 0;
  v_archived_leagues integer := 0;
  v_deleted_events integer := 0;
begin
  if p_user_id is null then
    raise exception 'User id is required' using errcode = '22004';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select
    count(*) filter (where candidate.next_owner_id is not null),
    count(*) filter (where candidate.next_owner_id is null)
  into v_transferred_leagues, v_archived_leagues
  from (
    select (
      select members.user_id
      from public.league_members members
      where members.league_id = leagues.id
        and members.user_id is not null
        and members.user_id <> p_user_id
        and members.active = true
      order by members.created_at asc, members.id asc
      limit 1
    ) as next_owner_id
    from public.leagues leagues
    where leagues.owner_id = p_user_id
  ) candidate;

  update public.leagues leagues
  set owner_id = (
        select members.user_id
        from public.league_members members
        where members.league_id = leagues.id
          and members.user_id is not null
          and members.user_id <> p_user_id
          and members.active = true
        order by members.created_at asc, members.id asc
        limit 1
      ),
      updated_at = now()
  where leagues.owner_id = p_user_id;

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

  delete from public.revenuecat_events events
  where events.app_user_id = p_user_id::text
     or (p_revenuecat_app_user_id is not null and events.app_user_id = p_revenuecat_app_user_id)
     or events.payload #>> '{event,app_user_id}' = p_user_id::text
     or events.payload #>> '{event,original_app_user_id}' = p_user_id::text
     or (
       p_revenuecat_app_user_id is not null
       and (
         events.payload #>> '{event,app_user_id}' = p_revenuecat_app_user_id
         or events.payload #>> '{event,original_app_user_id}' = p_revenuecat_app_user_id
       )
     )
     or exists (
       select 1
       from jsonb_array_elements_text(
         case
           when jsonb_typeof(events.payload #> '{event,aliases}') = 'array'
             then events.payload #> '{event,aliases}'
           else '[]'::jsonb
         end
       ) aliases(value)
       where aliases.value = p_user_id::text
          or (
            p_revenuecat_app_user_id is not null
            and aliases.value = p_revenuecat_app_user_id
          )
     );

  get diagnostics v_deleted_events = row_count;

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
