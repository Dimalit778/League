-- Subscription capabilities live in the database so every server-side entry
-- point enforces the same limits. RevenueCat remains the source of billing
-- status and localized prices; entitlement mappings connect the two systems.

create table public.subscription_plans (
  code text primary key,
  rank integer not null default 0,
  is_default boolean not null default false,
  is_active boolean not null default true,
  name_en text not null,
  name_he text not null,
  description_en text,
  description_he text,
  max_active_leagues integer not null,
  max_members_per_league integer not null,
  can_use_premium_competitions boolean not null default false,
  weekly_ai_analyses integer,
  has_advanced_stats boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint subscription_plans_code_format
    check (code ~ '^[a-z][a-z0-9_]*$'),
  constraint subscription_plans_max_active_leagues_positive
    check (max_active_leagues > 0),
  constraint subscription_plans_max_members_positive
    check (max_members_per_league > 0),
  constraint subscription_plans_weekly_ai_nonnegative
    check (weekly_ai_analyses is null or weekly_ai_analyses >= 0)
);
create unique index subscription_plans_one_default_idx
  on public.subscription_plans (is_default)
  where is_default = true;
alter table public.subscription_plans enable row level security;
revoke all on table public.subscription_plans from anon, authenticated;
grant select on table public.subscription_plans to anon, authenticated;
grant all on table public.subscription_plans to service_role;
create policy "Active subscription plans are readable"
  on public.subscription_plans
  for select
  to anon, authenticated
  using (is_active = true);
create table public.subscription_entitlement_mappings (
  entitlement_id text primary key,
  plan_code text not null references public.subscription_plans(code),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscription_entitlement_mappings enable row level security;
-- Only trusted Edge Functions need the RevenueCat-to-plan mapping.
revoke all on table public.subscription_entitlement_mappings from anon, authenticated;
grant all on table public.subscription_entitlement_mappings to service_role;
insert into public.subscription_plans (
  code,
  rank,
  is_default,
  name_en,
  name_he,
  description_en,
  description_he,
  max_active_leagues,
  max_members_per_league,
  can_use_premium_competitions,
  weekly_ai_analyses,
  has_advanced_stats,
  sort_order
)
values
  (
    'free',
    0,
    true,
    'Free',
    'חינם',
    'Play in free competitions and up to 2 active leagues.',
    'השתתפו בתחרויות החינמיות ובעד 2 ליגות פעילות.',
    2,
    6,
    false,
    0,
    false,
    0
  ),
  (
    'pro',
    10,
    false,
    'PRO',
    'פרו',
    'Unlock every competition, larger leagues, and advanced features.',
    'פתחו את כל התחרויות, ליגות גדולות יותר ויכולות מתקדמות.',
    5,
    12,
    true,
    null,
    true,
    10
  );
insert into public.subscription_entitlement_mappings (
  entitlement_id,
  plan_code
)
values ('pro', 'pro');
-- Replace the closed free/pro constraint with a catalog-backed relationship.
alter table public.user_subscriptions
  drop constraint if exists user_subscriptions_plan_check;
alter table public.user_subscriptions
  add constraint user_subscriptions_plan_fkey
  foreign key (plan)
  references public.subscription_plans(code);
create or replace function public.get_plan_limits(p_plan text)
returns table(max_leagues integer, max_members integer)
language sql
stable
security invoker
set search_path = public
as $$
  select
    plans.max_active_leagues,
    plans.max_members_per_league
  from public.subscription_plans plans
  where plans.code = coalesce(
    (
      select requested.code
      from public.subscription_plans requested
      where requested.code = p_plan
        and requested.is_active = true
    ),
    (
      select fallback.code
      from public.subscription_plans fallback
      where fallback.is_default = true
        and fallback.is_active = true
    )
  )
  limit 1;
$$;
revoke all on function public.get_plan_limits(text) from public, anon;
grant execute on function public.get_plan_limits(text) to authenticated, service_role;
create or replace function public.get_user_plan(p_user_id uuid)
returns text
language sql
stable
security invoker
set search_path = public
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
          or subscriptions.expires_at is null
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
revoke all on function public.get_user_plan(uuid) from public, anon;
grant execute on function public.get_user_plan(uuid) to authenticated, service_role;
create or replace function public.get_my_subscription_access()
returns jsonb
language sql
stable
security invoker
set search_path = public
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
  where plans.code = public.get_user_plan((select auth.uid()))
    and (select auth.uid()) is not null
  limit 1;
$$;
revoke all on function public.get_my_subscription_access() from public, anon;
grant execute on function public.get_my_subscription_access() to authenticated;
-- Defense in depth: existing RPCs remain backward compatible, while these
-- triggers make newly added plans obey catalog capabilities instead of relying
-- on special-case checks such as plan = 'free'.
create or replace function public.enforce_league_plan_access()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_plan_code text;
  v_max_members integer;
  v_can_use_premium boolean;
  v_competition_is_free boolean;
begin
  v_plan_code := public.get_user_plan(new.owner_id);

  select
    plans.max_members_per_league,
    plans.can_use_premium_competitions
  into v_max_members, v_can_use_premium
  from public.subscription_plans plans
  where plans.code = v_plan_code
    and plans.is_active = true;

  if v_max_members is null then
    raise exception 'Subscription plan limits are not configured';
  end if;

  if new.max_members > v_max_members then
    raise exception 'Plan limit: max % members per league', v_max_members;
  end if;

  select competitions.is_free
  into v_competition_is_free
  from public.competitions competitions
  where competitions.id = new.competition_id;

  if v_competition_is_free is null then
    raise exception 'Competition not found';
  end if;

  if not v_competition_is_free and not coalesce(v_can_use_premium, false) then
    raise exception 'This competition requires a plan with premium competition access'
      using errcode = '42501';
  end if;

  return new;
end;
$$;
revoke all on function public.enforce_league_plan_access() from public, anon, authenticated;
drop trigger if exists enforce_league_plan_access_before_write on public.leagues;
create trigger enforce_league_plan_access_before_write
before insert or update of competition_id, max_members
on public.leagues
for each row execute function public.enforce_league_plan_access();
create or replace function public.enforce_membership_plan_access()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_can_use_premium boolean;
  v_competition_is_free boolean;
begin
  if new.user_id is null or not new.active then
    return new;
  end if;

  select
    competitions.is_free,
    plans.can_use_premium_competitions
  into v_competition_is_free, v_can_use_premium
  from public.leagues leagues
  join public.competitions competitions
    on competitions.id = leagues.competition_id
  join public.subscription_plans plans
    on plans.code = public.get_user_plan(new.user_id)
   and plans.is_active = true
  where leagues.id = new.league_id;

  if v_competition_is_free is null then
    raise exception 'League subscription access could not be resolved';
  end if;

  if not v_competition_is_free and not coalesce(v_can_use_premium, false) then
    raise exception 'This competition requires a plan with premium competition access'
      using errcode = '42501';
  end if;

  return new;
end;
$$;
revoke all on function public.enforce_membership_plan_access() from public, anon, authenticated;
drop trigger if exists enforce_membership_plan_access_before_write
  on public.league_members;
create trigger enforce_membership_plan_access_before_write
before insert or update of active, league_id, user_id
on public.league_members
for each row execute function public.enforce_membership_plan_access();
create or replace function public.enforce_prediction_plan_access()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_can_use_premium boolean;
  v_competition_is_free boolean;
begin
  select
    competitions.is_free,
    plans.can_use_premium_competitions
  into v_competition_is_free, v_can_use_premium
  from public.league_members members
  join public.leagues leagues on leagues.id = members.league_id
  join public.competitions competitions on competitions.id = leagues.competition_id
  join public.subscription_plans plans
    on plans.code = public.get_user_plan(members.user_id)
   and plans.is_active = true
  where members.id = new.league_member_id
    and members.user_id is not null;

  if v_competition_is_free is null then
    raise exception 'Prediction subscription access could not be resolved';
  end if;

  if not v_competition_is_free and not coalesce(v_can_use_premium, false) then
    raise exception 'This competition requires a plan with premium competition access'
      using errcode = '42501';
  end if;

  return new;
end;
$$;
revoke all on function public.enforce_prediction_plan_access() from public, anon, authenticated;
drop trigger if exists enforce_prediction_plan_access_before_write
  on public.predictions;
create trigger enforce_prediction_plan_access_before_write
before insert or update of home_score, away_score, league_member_id
on public.predictions
for each row execute function public.enforce_prediction_plan_access();
create or replace function public.fill_available_league_slots_if_unambiguous(
  p_user_id uuid
)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_code text;
  v_max_leagues integer;
  v_can_use_premium boolean;
  v_active_count integer;
  v_available_slots integer;
  v_inactive_member_ids uuid[];
  v_inactive_count integer;
begin
  if p_user_id is null then
    return array[]::uuid[];
  end if;

  v_plan_code := public.get_user_plan(p_user_id);

  select
    plans.max_active_leagues,
    plans.can_use_premium_competitions
  into v_max_leagues, v_can_use_premium
  from public.subscription_plans plans
  where plans.code = v_plan_code
    and plans.is_active = true;

  if v_max_leagues is null then
    raise exception 'Subscription plan limits are not configured';
  end if;

  select count(*)
  into v_active_count
  from public.league_members members
  where members.user_id = p_user_id
    and members.active = true;

  v_available_slots := greatest(v_max_leagues - v_active_count, 0);

  select coalesce(
    array_agg(members.id order by members.created_at asc, members.id asc),
    array[]::uuid[]
  )
  into v_inactive_member_ids
  from public.league_members members
  join public.leagues leagues on leagues.id = members.league_id
  join public.competitions competitions on competitions.id = leagues.competition_id
  where members.user_id = p_user_id
    and members.active = false
    and (competitions.is_free or coalesce(v_can_use_premium, false));

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
