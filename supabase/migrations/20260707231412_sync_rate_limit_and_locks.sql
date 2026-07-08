-- Sync guards: global football-API rate budget + job overlap locks.
-- Both tables are service-role-only (RLS on, no policies); the RPCs are
-- revoked from anon/authenticated so app clients can neither consume the
-- API budget nor block sync jobs.

-- ── Rolling 60s football API budget ─────────────────────────────────────────

create table if not exists public.football_api_calls (
  id bigint generated always as identity primary key,
  called_at timestamptz not null default now(),
  job text
);

create index if not exists idx_football_api_calls_called_at
  on public.football_api_calls (called_at);

alter table public.football_api_calls enable row level security;

-- Atomically reserve p_calls football API calls if, and only if, the total
-- for the trailing 60 seconds stays within p_limit. Serialized with a
-- transaction-scoped advisory lock so concurrent function invocations cannot
-- both pass the check.
create or replace function public.consume_football_api_budget(
  p_calls int,
  p_job text default null,
  p_limit int default 10
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_used int;
begin
  if p_calls < 1 or p_calls > p_limit then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtext('football_api_budget'));

  select count(*) into v_used
  from public.football_api_calls
  where called_at > now() - interval '60 seconds';

  if v_used + p_calls > p_limit then
    return false;
  end if;

  insert into public.football_api_calls (job)
  select p_job from generate_series(1, p_calls);

  -- Opportunistic cleanup; keeps the table tiny.
  delete from public.football_api_calls
  where called_at < now() - interval '10 minutes';

  return true;
end;
$$;

-- ── Sync job locks (overlap guard + last-run record) ────────────────────────

create table if not exists public.sync_locks (
  job text primary key,
  locked_until timestamptz not null,
  locked_at timestamptz not null default now(),
  last_finished_at timestamptz,
  last_status text
);

alter table public.sync_locks enable row level security;

create or replace function public.try_acquire_sync_lock(
  p_job text,
  p_lease_seconds int default 300
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_acquired boolean := false;
begin
  insert into public.sync_locks (job, locked_until, locked_at)
  values (p_job, now() + make_interval(secs => p_lease_seconds), now())
  on conflict (job) do update
    set locked_until = excluded.locked_until,
        locked_at = excluded.locked_at
    where sync_locks.locked_until < now()
  returning true into v_acquired;

  return coalesce(v_acquired, false);
end;
$$;

create or replace function public.release_sync_lock(
  p_job text,
  p_status text default null
) returns void
language sql
security invoker
set search_path = public
as $$
  update public.sync_locks
  set locked_until = now(),
      last_finished_at = now(),
      last_status = coalesce(p_status, last_status)
  where job = p_job;
$$;

-- ── Lock down access: service role only ─────────────────────────────────────

revoke all on table public.football_api_calls from anon, authenticated;
revoke all on table public.sync_locks from anon, authenticated;

revoke execute on function public.consume_football_api_budget(int, text, int) from public, anon, authenticated;
revoke execute on function public.try_acquire_sync_lock(text, int) from public, anon, authenticated;
revoke execute on function public.release_sync_lock(text, text) from public, anon, authenticated;
