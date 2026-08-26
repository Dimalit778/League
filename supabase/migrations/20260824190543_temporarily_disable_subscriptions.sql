-- Keep the complete subscription catalog and RevenueCat integration in place,
-- while granting every authenticated user the effective Pro plan. Re-enabling
-- billing is a data/config change instead of a schema rollback.
create table public.app_config (
  singleton boolean primary key default true check (singleton),
  subscriptions_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;
revoke all on table public.app_config from public, anon, authenticated;
grant select on table public.app_config to authenticated;

create policy "Authenticated users can read app configuration"
  on public.app_config
  for select
  to authenticated
  using (true);

insert into public.app_config (singleton, subscriptions_enabled)
values (true, false);

create or replace function private.resolve_user_plan(p_user_id uuid)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when not coalesce(
      (select config.subscriptions_enabled from public.app_config config where config.singleton),
      false
    ) then coalesce(
      (
        select plans.code
        from public.subscription_plans plans
        where plans.code = 'pro'
          and plans.is_active = true
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
    else coalesce(
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
    )
  end;
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
    when not coalesce(
      (select config.subscriptions_enabled from public.app_config config where config.singleton),
      false
    ) then coalesce(
      (
        select plans.code
        from public.subscription_plans plans
        where plans.code = 'pro'
          and plans.is_active = true
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

create or replace function public.get_my_subscription_access()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'subscriptions_enabled', config.subscriptions_enabled,
    'plan_code', plans.code,
    'is_default', plans.is_default,
    'status', case
      when not config.subscriptions_enabled then 'free_access'
      else coalesce(subscriptions.status, 'inactive')
    end,
    'expires_at', case
      when not config.subscriptions_enabled then null
      else subscriptions.expires_at
    end,
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
  cross join (
    select coalesce(
      (
        select app_config.subscriptions_enabled
        from public.app_config app_config
        where app_config.singleton
      ),
      false
    ) as subscriptions_enabled
  ) config
  left join public.user_subscriptions subscriptions
    on subscriptions.user_id = (select auth.uid())
   and subscriptions.plan = plans.code
  where plans.code = public.get_my_plan()
    and (select auth.uid()) is not null
  limit 1;
$$;

revoke all on function public.get_my_subscription_access() from public, anon;
grant execute on function public.get_my_subscription_access()
  to authenticated, service_role;
