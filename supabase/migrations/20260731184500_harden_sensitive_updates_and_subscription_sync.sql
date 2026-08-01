-- Prevent authenticated clients from changing relationship and ownership
-- fields through otherwise legitimate row-level UPDATE policies.

create or replace function public.protect_league_member_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
    or new.league_id is distinct from old.league_id
    or new.created_at is distinct from old.created_at then
    raise exception 'Protected league membership fields cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_league_member_fields_before_update on public.league_members;
create trigger protect_league_member_fields_before_update
before update on public.league_members
for each row execute function public.protect_league_member_fields();

create or replace function public.protect_league_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if new.owner_id is distinct from old.owner_id
    or new.join_code is distinct from old.join_code
    or new.competition_id is distinct from old.competition_id
    or new.max_members is distinct from old.max_members
    or new.created_at is distinct from old.created_at then
    raise exception 'Protected league fields cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_league_fields_before_update on public.leagues;
create trigger protect_league_fields_before_update
before update on public.leagues
for each row execute function public.protect_league_fields();

-- Global, atomic cooldown for calls that proxy the authenticated user to
-- RevenueCat. RLS and grants keep the limiter service-role-only.
create table if not exists public.subscription_sync_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_attempt_at timestamptz not null default now()
);

alter table public.subscription_sync_attempts enable row level security;
revoke all on table public.subscription_sync_attempts from anon, authenticated;

create or replace function public.consume_subscription_sync_attempt(
  p_user_id uuid,
  p_cooldown_seconds int default 30
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_allowed boolean := false;
begin
  if p_user_id is null or p_cooldown_seconds < 1 or p_cooldown_seconds > 3600 then
    return false;
  end if;

  insert into public.subscription_sync_attempts (user_id, last_attempt_at)
  values (p_user_id, now())
  on conflict (user_id) do update
    set last_attempt_at = excluded.last_attempt_at
    where subscription_sync_attempts.last_attempt_at
      <= now() - make_interval(secs => p_cooldown_seconds)
  returning true into v_allowed;

  return coalesce(v_allowed, false);
end;
$$;

revoke execute on function public.consume_subscription_sync_attempt(uuid, int)
  from public, anon, authenticated;
