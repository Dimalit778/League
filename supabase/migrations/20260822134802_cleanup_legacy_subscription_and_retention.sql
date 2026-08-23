-- Remove the legacy competition progress columns after every maintained client
-- and Edge Function moved to current_matchday / total_matchdays.
drop trigger if exists competitions_sync_matchday_columns on public.competitions;
drop function if exists public.sync_competition_matchday_columns();

alter table public.competitions
  drop column if exists current_fixture,
  drop column if exists total_fixtures;

-- RevenueCat entitlement-to-plan mapping is no longer used. The season pass
-- flow has one stable entitlement (`pro`) and resolves access server-side.
drop table if exists public.subscription_entitlement_mappings;

-- Keep the subscription sync cooldown table cheap to prune as the user base
-- grows. One day is intentionally much longer than its 30-second cooldown.
create index if not exists subscription_sync_attempts_last_attempt_at_idx
  on public.subscription_sync_attempts (last_attempt_at);

-- Apply retention immediately, then keep it enforced once per day. The job is
-- deliberately offset from the on-the-hour football sync jobs.
delete from public.revenuecat_events
where created_at < now() - interval '180 days';

delete from public.subscription_sync_attempts
where last_attempt_at < now() - interval '1 day';

do $do$
begin
  if exists (
    select 1
    from cron.job
    where jobname = 'cleanup-operational-subscription-data'
  ) then
    perform cron.unschedule('cleanup-operational-subscription-data');
  end if;

  perform cron.schedule(
    'cleanup-operational-subscription-data',
    '17 3 * * *',
    $command$
      delete from public.revenuecat_events
      where created_at < now() - interval '180 days';

      delete from public.subscription_sync_attempts
      where last_attempt_at < now() - interval '1 day';
    $command$
  );
end
$do$;

-- Profile images are public avatars, not arbitrary file storage. Five MiB is
-- generous for a square profile image while limiting storage and egress abuse.
update storage.buckets
set file_size_limit = 5 * 1024 * 1024,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp'
    ]::text[]
where id = 'profile_images';
