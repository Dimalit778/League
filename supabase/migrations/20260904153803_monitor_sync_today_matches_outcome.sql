-- pg_cron only sees pg_net enqueue success, not the eventual HTTP outcome.
-- Give the request enough time to finish and add a follow-up health job whose
-- pg_cron status reflects the Edge Function's recorded sync outcome.

select cron.alter_job(
  job_id := (
    select jobid
    from cron.job
    where jobname = '5 Min - sync today matches'
  ),
  command := $command$
    select net.http_post(
      url := 'https://keuavfvgwhwckqordjbp.supabase.co/functions/v1/sync-today-matches',
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
      timeout_milliseconds := 120000
    )
    where (
      (now() at time zone 'Asia/Jerusalem')::time >= time '13:00'
      or (now() at time zone 'Asia/Jerusalem')::time < time '01:00'
    );
  $command$
);

select cron.schedule(
  'Health - sync today matches',
  '2-59/5 * * * *',
  $health_job$
    do $health_check$
    declare
      sync_status text;
      finished_at timestamptz;
    begin
      if (
        (now() at time zone 'Asia/Jerusalem')::time >= time '13:00'
        or (now() at time zone 'Asia/Jerusalem')::time < time '01:00'
      ) then
        select last_status, last_finished_at
        into sync_status, finished_at
        from public.sync_locks
        where job = 'sync-today-matches';

        if finished_at is null or finished_at < now() - interval '10 minutes' then
          raise exception 'sync-today-matches is stale; last_finished_at=%', finished_at;
        end if;

        if sync_status is distinct from 'success' then
          raise exception 'sync-today-matches unhealthy; last_status=%, last_finished_at=%',
            sync_status,
            finished_at;
        end if;
      end if;
    end
    $health_check$;
  $health_job$
);
