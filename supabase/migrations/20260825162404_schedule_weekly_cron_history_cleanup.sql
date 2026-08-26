-- pg_cron does not prune cron.job_run_details automatically. Keep enough
-- history for operational debugging without allowing the table to grow
-- indefinitely from high-frequency synchronization jobs.
do $do$
begin
  if exists (
    select 1
    from cron.job
    where jobname = 'cleanup-cron-job-run-history'
  ) then
    perform cron.unschedule('cleanup-cron-job-run-history');
  end if;

  perform cron.schedule(
    'cleanup-cron-job-run-history',
    '0 4 * * 0',
    $command$
      delete from cron.job_run_details
      where start_time < now() - interval '30 days';
    $command$
  );
end
$do$;
