alter table public.sync_locks
  add column if not exists last_alerted_at timestamptz,
  add column if not exists last_alert_status text;

comment on column public.sync_locks.last_alerted_at is
  'Last time an operational sync failure event was accepted by Sentry.';
comment on column public.sync_locks.last_alert_status is
  'Failure state used to suppress duplicate sync alerts during cooldown.';

-- The existing health job keeps raising failures into pg_cron. This companion
-- job invokes an Edge Function that reports stale or unhealthy state to Sentry.
select cron.unschedule(jobid)
from cron.job
where jobname = 'Alerts - sync today matches';

select cron.schedule(
  'Alerts - sync today matches',
  '3-59/5 * * * *',
  $alert_job$
    select net.http_post(
      url := 'https://keuavfvgwhwckqordjbp.supabase.co/functions/v1/monitor-sync-health',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-sync-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'sync_secret'
          limit 1
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 20000
    )
    where (
      (now() at time zone 'Asia/Jerusalem')::time >= time '13:00'
      or (now() at time zone 'Asia/Jerusalem')::time < time '01:00'
    );
  $alert_job$
);
