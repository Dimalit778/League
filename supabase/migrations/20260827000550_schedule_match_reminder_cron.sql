do $do$
declare
  v_base_url text;
begin
  if not exists (
    select 1 from vault.decrypted_secrets
    where name = 'sync_secret' and decrypted_secret is not null and decrypted_secret <> ''
  ) then
    raise exception 'Vault secret sync_secret is required for match reminder job';
  end if;

  -- Resolve the functions base URL from an existing sync job's command so we do
  -- not hardcode the project ref.
  select substring(command from '(https://[^'']+/functions/v1/)')
    into v_base_url
  from cron.job
  where command like '%/functions/v1/sync-today-matches%'
  limit 1;

  if v_base_url is null then
    raise exception 'Could not resolve functions base URL from existing cron jobs';
  end if;

  perform cron.unschedule('10 Min - send match reminders')
  where exists (select 1 from cron.job where jobname = '10 Min - send match reminders');

  perform cron.schedule(
    '10 Min - send match reminders',
    '*/10 * * * *',
    format(
      $command$
        select net.http_post(
          url := %L,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-sync-secret', (
              select decrypted_secret from vault.decrypted_secrets where name = 'sync_secret' limit 1
            )
          ),
          body := '{}'::jsonb
        )
        where (now() at time zone 'Asia/Jerusalem')::time >= time '11:00';
      $command$,
      v_base_url || 'send-match-reminders'
    )
  );
end
$do$;
