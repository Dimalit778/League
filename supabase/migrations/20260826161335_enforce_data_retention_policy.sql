-- Enforce Champo's operational retention schedule in one auditable job.
-- Provider-controlled logs and backups are documented separately because
-- they cannot be deleted from Postgres.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create index if not exists content_reports_reviewed_retention_idx
  on public.content_reports (reviewed_at)
  where status in ('resolved', 'dismissed') and reviewed_at is not null;

create or replace function private.enforce_data_retention()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, auth, cron
as $$
declare
  v_content_reports integer := 0;
  v_revenuecat_events integer := 0;
  v_subscription_attempts integer := 0;
  v_football_api_calls integer := 0;
  v_moderation_usage integer := 0;
  v_auth_audit_entries integer := 0;
  v_cron_runs integer := 0;
begin
  -- Keep unresolved reports available to moderators. Once reviewed, retain
  -- the evidence for 24 months for abuse appeals and repeat-offender review.
  delete from public.content_reports
  where status in ('resolved', 'dismissed')
    and reviewed_at < now() - interval '24 months';
  get diagnostics v_content_reports = row_count;

  delete from public.revenuecat_events
  where created_at < now() - interval '180 days';
  get diagnostics v_revenuecat_events = row_count;

  delete from public.subscription_sync_attempts
  where last_attempt_at < now() - interval '1 day';
  get diagnostics v_subscription_attempts = row_count;

  delete from public.football_api_calls
  where called_at < now() - interval '31 days';
  get diagnostics v_football_api_calls = row_count;

  delete from public.profile_image_moderation_monthly_usage
  where month_start < (
    date_trunc('month', now() at time zone 'UTC')::date - interval '14 months'
  )::date;
  get diagnostics v_moderation_usage = row_count;

  -- Supabase Auth can also emit platform logs whose retention is controlled
  -- by the project plan. This removes the database copy we control.
  delete from auth.audit_log_entries
  where created_at < now() - interval '90 days';
  get diagnostics v_auth_audit_entries = row_count;

  delete from cron.job_run_details
  where start_time < now() - interval '30 days';
  get diagnostics v_cron_runs = row_count;

  return jsonb_build_object(
    'content_reports', v_content_reports,
    'revenuecat_events', v_revenuecat_events,
    'subscription_sync_attempts', v_subscription_attempts,
    'football_api_calls', v_football_api_calls,
    'profile_image_moderation_usage', v_moderation_usage,
    'auth_audit_entries', v_auth_audit_entries,
    'cron_job_runs', v_cron_runs
  );
end;
$$;

revoke all on function private.enforce_data_retention()
  from public, anon, authenticated;

-- A report can contain a nickname or avatar snapshot. Delete reports in which
-- the departing account is the reporter or subject before the FK can merely
-- null the user IDs and leave that snapshot behind.
create or replace function private.delete_account_content_reports()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  delete from public.content_reports
  where reporter_user_id = old.id
     or target_user_id = old.id;
  return old;
end;
$$;

revoke all on function private.delete_account_content_reports()
  from public, anon, authenticated;

drop trigger if exists delete_account_content_reports_before_user on public.users;
create trigger delete_account_content_reports_before_user
before delete on public.users
for each row execute function private.delete_account_content_reports();

-- Replace the two partial cleanup jobs with one daily policy run.
do $do$
begin
  if exists (
    select 1 from cron.job
    where jobname = 'cleanup-operational-subscription-data'
  ) then
    perform cron.unschedule('cleanup-operational-subscription-data');
  end if;

  if exists (
    select 1 from cron.job
    where jobname = 'cleanup-cron-job-run-history'
  ) then
    perform cron.unschedule('cleanup-cron-job-run-history');
  end if;

  if exists (
    select 1 from cron.job
    where jobname = 'enforce-data-retention'
  ) then
    perform cron.unschedule('enforce-data-retention');
  end if;

  perform cron.schedule(
    'enforce-data-retention',
    '17 3 * * *',
    'select private.enforce_data_retention();'
  );

  if exists (
    select 1 from cron.job
    where jobname = 'cleanup-orphaned-profile-images'
  ) then
    perform cron.unschedule('cleanup-orphaned-profile-images');
  end if;

  perform cron.schedule(
    'cleanup-orphaned-profile-images',
    '27 3 * * *',
    $command$
      select net.http_post(
        url := 'https://keuavfvgwhwckqordjbp.supabase.co/functions/v1/cleanup-retained-data',
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
    $command$
  );
end
$do$;

-- Enforce all database periods immediately as part of deployment.
select private.enforce_data_retention();

-- Bind new registrations to the exact policy revision that contains this
-- retention schedule. Older acceptance evidence remains immutable.
create or replace function public.record_current_legal_acceptance(
  p_source text,
  p_auth_flow text,
  p_locale text,
  p_app_version text
)
returns public.legal_acceptances
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_user_id uuid := (select auth.uid());
  acceptance public.legal_acceptances;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_source not in ('google', 'apple') then
    raise exception 'Invalid social authentication source' using errcode = '22023';
  end if;

  if p_auth_flow not in ('sign_up', 'social_continue') then
    raise exception 'Invalid authentication flow' using errcode = '22023';
  end if;

  if p_locale not in ('en', 'he') then
    raise exception 'Invalid locale' using errcode = '22023';
  end if;

  if p_app_version is null or char_length(p_app_version) not between 1 and 50 then
    raise exception 'Invalid app version' using errcode = '22023';
  end if;

  insert into public.legal_acceptances (
    user_id,
    terms_version,
    privacy_version,
    source,
    auth_flow,
    locale,
    app_version
  )
  values (
    current_user_id,
    '2026-08-04',
    '2026-08-26.2',
    p_source,
    p_auth_flow,
    p_locale,
    p_app_version
  )
  on conflict (user_id, terms_version, privacy_version) do nothing;

  select *
    into acceptance
    from public.legal_acceptances
   where user_id = current_user_id
     and terms_version = '2026-08-04'
     and privacy_version = '2026-08-26.2';

  return acceptance;
end;
$$;

revoke all on function public.record_current_legal_acceptance(text, text, text, text)
  from public, anon;
grant execute on function public.record_current_legal_acceptance(text, text, text, text)
  to authenticated;

create or replace function public.capture_email_signup_legal_acceptance()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  acceptance_locale text := metadata ->> 'legal_locale';
  acceptance_app_version text := metadata ->> 'legal_app_version';
begin
  if metadata ->> 'provider' = 'email'
     and metadata ->> 'legal_accepted' = 'true'
     and metadata ->> 'legal_terms_version' = '2026-08-04'
     and metadata ->> 'legal_privacy_version' = '2026-08-26.2'
     and acceptance_locale in ('en', 'he')
     and acceptance_app_version is not null
     and char_length(acceptance_app_version) between 1 and 50 then
    insert into public.legal_acceptances (
      user_id,
      terms_version,
      privacy_version,
      source,
      auth_flow,
      locale,
      app_version
    )
    values (
      new.id,
      '2026-08-04',
      '2026-08-26.2',
      'email',
      'sign_up',
      acceptance_locale,
      acceptance_app_version
    )
    on conflict (user_id, terms_version, privacy_version) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.capture_email_signup_legal_acceptance()
  from public, anon, authenticated;
