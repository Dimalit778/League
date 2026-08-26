-- Immutable, server-timestamped evidence that a user accepted the Terms and
-- acknowledged the Privacy Policy version shown during account creation.
create table public.legal_acceptances (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default clock_timestamp(),
  source text not null check (source in ('email', 'google', 'apple')),
  auth_flow text not null check (auth_flow in ('sign_up', 'social_continue')),
  locale text not null check (locale in ('en', 'he')),
  app_version text not null check (char_length(app_version) between 1 and 50),
  constraint legal_acceptances_one_per_document_pair
    unique (user_id, terms_version, privacy_version)
);

comment on table public.legal_acceptances is
  'Append-only evidence of acceptance. accepted_at and current document versions are assigned by trusted database code.';

alter table public.legal_acceptances enable row level security;

revoke all on table public.legal_acceptances from public, anon, authenticated;
grant select on table public.legal_acceptances to authenticated;

create policy "Users can read their own legal acceptances"
on public.legal_acceptances
for select
to authenticated
using ((select auth.uid()) = user_id);

create function public.record_current_legal_acceptance(
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
    '2026-08-04',
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
     and privacy_version = '2026-08-04';

  return acceptance;
end;
$$;

revoke all on function public.record_current_legal_acceptance(text, text, text, text)
  from public, anon;
grant execute on function public.record_current_legal_acceptance(text, text, text, text)
  to authenticated;

-- Email verification may be required, so there may be no authenticated client
-- session immediately after signUp(). Capture the explicit signup assertion
-- into the immutable audit table at auth.users creation time instead.
create function public.capture_email_signup_legal_acceptance()
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
     and metadata ->> 'legal_privacy_version' = '2026-08-04'
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
      '2026-08-04',
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

create trigger capture_email_signup_legal_acceptance
after insert on auth.users
for each row execute function public.capture_email_signup_legal_acceptance();
