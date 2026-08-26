-- Match synchronization schedules use Israel local time. pg_cron itself runs
-- in UTC, so the SQL commands apply an Asia/Jerusalem guard; this keeps the
-- product hours stable across daylight-saving changes.
--
-- Both Edge Functions require the shared sync secret. Resolve it from Vault
-- only at execution time so it is never embedded in cron.job.command.
do $do$
declare
  v_jobid bigint;
  v_command text;
  v_function_url text;
begin
  if not exists (
    select 1
    from vault.decrypted_secrets
    where name = 'sync_secret'
      and decrypted_secret is not null
      and decrypted_secret <> ''
  ) then
    raise exception 'Vault secret sync_secret is required for match synchronization jobs';
  end if;

  -- Every five minutes from 12:00 (inclusive) until 00:00 (exclusive),
  -- according to Israel local time.
  select jobid, command
    into v_jobid, v_command
  from cron.job
  where jobname = '5 Min - sync today matches';

  if found then
    select match[1]
      into v_function_url
    from regexp_match(
      v_command,
      '(https://[^'']+/functions/v1/sync-today-matches)'
    ) as match;

    if v_function_url is null then
      raise exception 'Could not resolve sync-today-matches URL from cron command';
    end if;

    perform cron.alter_job(
      job_id := v_jobid,
      schedule := '*/5 * * * *',
      active := true,
      command := format(
        $command$
          select net.http_post(
            url := %L,
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'x-sync-secret', (
                select decrypted_secret
                from vault.decrypted_secrets
                where name = 'sync_secret'
                limit 1
              )
            ),
            body := '{}'::jsonb
          )
          where (now() at time zone 'Asia/Jerusalem')::time >= time '12:00';
        $command$,
        v_function_url
      )
    );
  end if;

  -- Check hourly so 02:00 Israel remains stable across DST. The local-time
  -- and last-success guards invoke the Edge Function once at/after 02:00;
  -- later hours are no-ops after success, while a failed run can retry.
  select jobid, command
    into v_jobid, v_command
  from cron.job
  where jobname = 'Daily - sync all matches';

  if found then
    select match[1]
      into v_function_url
    from regexp_match(
      v_command,
      '(https://[^'']+/functions/v1/sync-season-matches)'
    ) as match;

    if v_function_url is null then
      raise exception 'Could not resolve sync-season-matches URL from cron command';
    end if;

    perform cron.alter_job(
      job_id := v_jobid,
      schedule := '0 * * * *',
      active := true,
      command := format(
        $command$
          select net.http_post(
            url := %L,
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'x-sync-secret', (
                select decrypted_secret
                from vault.decrypted_secrets
                where name = 'sync_secret'
                limit 1
              )
            ),
            body := '{}'::jsonb
          )
          where extract(hour from now() at time zone 'Asia/Jerusalem') >= 2
            and not exists (
              select 1
              from public.sync_locks
              where job = 'sync-season-matches'
                and last_status = 'success'
                and (last_finished_at at time zone 'Asia/Jerusalem')::date =
                    (now() at time zone 'Asia/Jerusalem')::date
            );
        $command$,
        v_function_url
      )
    );
  end if;
end
$do$;
