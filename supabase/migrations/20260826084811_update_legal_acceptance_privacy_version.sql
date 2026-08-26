-- The Privacy Policy now expressly discloses Google Cloud Vision image
-- moderation and Sentry diagnostics. Keep the Terms version unchanged while
-- assigning the new Privacy version only from trusted database code.
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
    '2026-08-26',
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
     and privacy_version = '2026-08-26';

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
     and metadata ->> 'legal_privacy_version' = '2026-08-26'
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
      '2026-08-26',
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
