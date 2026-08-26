-- The daily competition progress job previously queued an unauthenticated
-- pg_net request. pg_cron reported that SQL command as successful, but the
-- Edge Function rejected the HTTP request before it could update seasons.
--
-- Keep the secret in Vault and resolve it only when the cron command runs.
do $do$
declare
  v_jobid bigint;
  v_command text;
  v_function_url text;
begin
  select jobid, command
    into v_jobid, v_command
  from cron.job
  where jobname = 'Daily - sync competition';

  if not found then
    return;
  end if;

  select match[1]
    into v_function_url
  from regexp_match(
    v_command,
    '(https://[^'']+/functions/v1/sync-competition-progress)'
  ) as match;

  if v_function_url is null then
    raise exception 'Could not resolve sync-competition-progress URL from cron command';
  end if;

  if not exists (
    select 1
    from vault.decrypted_secrets
    where name = 'sync_secret'
      and decrypted_secret is not null
      and decrypted_secret <> ''
  ) then
    raise exception 'Vault secret sync_secret is required for the daily competition progress job';
  end if;

  perform cron.alter_job(
    job_id := v_jobid,
    schedule := '0 0 * * *',
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
        );
      $command$,
      v_function_url
    )
  );
end
$do$;
