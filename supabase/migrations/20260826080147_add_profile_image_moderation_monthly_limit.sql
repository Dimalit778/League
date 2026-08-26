-- App-wide Google Vision budget for profile-image moderation. The reservation
-- is atomic, so concurrent Edge Function instances cannot exceed 950 calls in
-- a UTC calendar month.

create table public.profile_image_moderation_monthly_usage (
  month_start date primary key,
  calls integer not null default 0 check (calls between 0 and 950),
  updated_at timestamptz not null default now(),
  check (extract(day from month_start) = 1)
);

alter table public.profile_image_moderation_monthly_usage enable row level security;
revoke all on table public.profile_image_moderation_monthly_usage
  from public, anon, authenticated;
grant select, insert, update, delete on table public.profile_image_moderation_monthly_usage
  to service_role;

create or replace function public.consume_profile_image_moderation_budget()
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_month_start date := date_trunc('month', now() at time zone 'UTC')::date;
  v_reserved boolean := false;
begin
  insert into public.profile_image_moderation_monthly_usage (month_start, calls, updated_at)
  values (v_month_start, 1, now())
  on conflict (month_start) do update
    set calls = profile_image_moderation_monthly_usage.calls + 1,
        updated_at = now()
    where profile_image_moderation_monthly_usage.calls < 950
  returning true into v_reserved;

  -- Retain enough history for operational review without unbounded growth.
  delete from public.profile_image_moderation_monthly_usage
  where month_start < v_month_start - interval '24 months';

  return coalesce(v_reserved, false);
end;
$$;

revoke execute on function public.consume_profile_image_moderation_budget()
  from public, anon, authenticated;
grant execute on function public.consume_profile_image_moderation_budget()
  to service_role;

-- Authenticated clients may still clear an avatar, but only the moderation
-- Edge Function (service role) may set a new non-null avatar path.
create or replace function public.protect_league_member_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'postgres'
    or (select auth.jwt() ->> 'role') = 'service_role' then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
    or new.league_id is distinct from old.league_id
    or new.created_at is distinct from old.created_at
    or new.active is distinct from old.active
    or new.is_primary is distinct from old.is_primary
    or (
      new.avatar_url is distinct from old.avatar_url
      and new.avatar_url is not null
    ) then
    raise exception 'Protected league membership fields cannot be changed directly';
  end if;

  return new;
end;
$$;

-- League-creation RPCs historically accept an avatar argument. Only allow an
-- authenticated caller to reuse a path already attached to one of their own
-- memberships; arbitrary URLs and another user's image remain blocked.
create or replace function public.validate_league_member_avatar_on_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.avatar_url is null
    or auth.uid() is null
    or (select auth.jwt() ->> 'role') = 'service_role' then
    return new;
  end if;

  if not exists (
    select 1
    from public.league_members existing
    where existing.user_id = auth.uid()
      and existing.avatar_url = new.avatar_url
  ) then
    raise exception 'Profile image must be uploaded through moderation';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_league_member_avatar_before_insert on public.league_members;
create trigger validate_league_member_avatar_before_insert
before insert on public.league_members
for each row execute function public.validate_league_member_avatar_on_insert();
