alter table public.user_subscriptions
  add column if not exists purchased_at timestamptz,
  add column if not exists transaction_id text;

create index if not exists user_subscriptions_transaction_id_idx
  on public.user_subscriptions (transaction_id)
  where transaction_id is not null;

comment on column public.user_subscriptions.purchased_at is
  'Purchase time of the latest verified pro_season RevenueCat transaction.';
comment on column public.user_subscriptions.transaction_id is
  'Store transaction id of the latest verified pro_season purchase.';

-- Preserve access for existing Pro rows during rollout. The next verified sync
-- replaces these compatibility values with the real transaction metadata.
update public.user_subscriptions subscriptions
set expires_at = seasons.ends_at,
    season_code = seasons.code,
    updated_at = now()
from public.pro_seasons seasons
where subscriptions.plan = 'pro'
  and subscriptions.expires_at is null
  and seasons.is_current
  and now() >= seasons.starts_at
  and now() < seasons.ends_at;

-- A paid plan must always be time-bounded. A null expiry is no longer treated
-- as lifetime Pro; the default/free plan remains valid without an expiry.
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
