-- Keep one owner for each scheduled synchronization responsibility:
--   sync-competition-progress -> daily competition progress
--   sync-season-matches       -> nightly full-season reconciliation
--
-- Preserve each existing cron job's schedule and authentication headers by
-- changing only the Edge Function slug inside its command.
-- Non-STRICT lookups so a fresh replay (local `db reset`, CI) where the cron
-- jobs were never seeded is a graceful no-op instead of a P0002 failure. When
-- the jobs DO exist (the remote where they were created out-of-band) the
-- behaviour is unchanged: rename the Edge Function slug in each command.
do $$
declare
  v_jobid bigint;
  v_command text;
begin
  select jobid, command
    into v_jobid, v_command
  from cron.job
  where jobname = 'Daily - sync competition';

  if found then
    if position('/sync-competition-progress' in v_command) = 0 then
      if position('/sync-competitions' in v_command) = 0 then
        raise exception 'Unexpected command for Daily - sync competition';
      end if;

      perform cron.alter_job(
        job_id := v_jobid,
        command := replace(v_command, '/sync-competitions', '/sync-competition-progress')
      );
    end if;
  end if;

  select jobid, command
    into v_jobid, v_command
  from cron.job
  where jobname = 'Daily - sync all matches';

  if found then
    if position('/sync-season-matches' in v_command) = 0 then
      if position('/sync-matches' in v_command) = 0 then
        raise exception 'Unexpected command for Daily - sync all matches';
      end if;

      perform cron.alter_job(
        job_id := v_jobid,
        command := replace(v_command, '/sync-matches', '/sync-season-matches')
      );
    end if;
  end if;
end
$$;

-- Both signup triggers called the same idempotent function. Keep the
-- conventionally named trigger as the single creation hook.
drop trigger if exists insert_user_on_signup on auth.users;
