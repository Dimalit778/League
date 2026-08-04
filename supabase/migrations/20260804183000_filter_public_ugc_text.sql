-- Proactively reject common objectionable text in public league names and
-- nicknames. This runs at the database boundary, so old clients and direct API
-- calls cannot bypass it. Reporting, blocking and admin review remain the
-- fallback for context-dependent content and profile images.

create table if not exists public.ugc_blocked_terms (
  term text primary key,
  language text not null default 'und',
  category text not null default 'objectionable',
  created_at timestamptz not null default now(),
  constraint ugc_blocked_terms_nonempty check (char_length(btrim(term)) >= 2)
);

alter table public.ugc_blocked_terms enable row level security;
revoke all on table public.ugc_blocked_terms from public, anon, authenticated;
grant select, insert, update, delete on table public.ugc_blocked_terms to service_role;

insert into public.ugc_blocked_terms (term, language, category)
values
  ('fuck', 'en', 'sexual'),
  ('fucker', 'en', 'sexual'),
  ('fucking', 'en', 'sexual'),
  ('shit', 'en', 'objectionable'),
  ('bitch', 'en', 'harassment'),
  ('cunt', 'en', 'sexual'),
  ('whore', 'en', 'sexual'),
  ('nigger', 'en', 'hate'),
  ('nigga', 'en', 'hate'),
  ('faggot', 'en', 'hate'),
  ('kike', 'en', 'hate'),
  ('retard', 'en', 'harassment'),
  ('זונה', 'he', 'sexual'),
  ('שרמוטה', 'he', 'sexual'),
  ('כוס', 'he', 'sexual'),
  ('כוסית', 'he', 'sexual'),
  ('מזדיין', 'he', 'sexual'),
  ('מזדיינת', 'he', 'sexual'),
  ('הומו', 'he', 'hate'),
  ('נאצי', 'he', 'hate')
on conflict (term) do nothing;

create or replace function public.normalize_ugc_for_filter(p_value text)
returns text
language sql
immutable
set search_path = public
as $$
  select btrim(
    regexp_replace(
      translate(lower(coalesce(p_value, '')), '013457@$', 'oieastas'),
      '[^[:alnum:]]+',
      ' ',
      'g'
    )
  );
$$;

revoke all on function public.normalize_ugc_for_filter(text) from public, anon, authenticated;
grant execute on function public.normalize_ugc_for_filter(text) to service_role;

create or replace function public.assert_allowed_public_ugc(p_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text := public.normalize_ugc_for_filter(p_value);
begin
  if coalesce(p_value, '') ~* 'https?://|www\.'
     or coalesce(p_value, '') ~* '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'
     or regexp_replace(coalesce(p_value, ''), '[^0-9]', '', 'g') ~ '[0-9]{7,}' then
    raise exception using
      errcode = '22023',
      message = 'Public names cannot contain links, email addresses, or phone numbers';
  end if;

  if exists (
    select 1
    from public.ugc_blocked_terms blocked
    where (' ' || v_normalized || ' ') like
      ('% ' || public.normalize_ugc_for_filter(blocked.term) || ' %')
  ) then
    raise exception using
      errcode = '22023',
      message = 'This name contains content that is not allowed';
  end if;
end;
$$;

revoke all on function public.assert_allowed_public_ugc(text) from public, anon, authenticated;
grant execute on function public.assert_allowed_public_ugc(text) to service_role;

create or replace function public.filter_league_public_ugc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'leagues' then
    perform public.assert_allowed_public_ugc(new.name);
  elsif tg_table_name = 'league_members' then
    perform public.assert_allowed_public_ugc(new.nickname);
  end if;
  return new;
end;
$$;

drop trigger if exists filter_league_name_before_write on public.leagues;
create trigger filter_league_name_before_write
before insert or update of name on public.leagues
for each row execute function public.filter_league_public_ugc();

drop trigger if exists filter_nickname_before_write on public.league_members;
create trigger filter_nickname_before_write
before insert or update of nickname on public.league_members
for each row execute function public.filter_league_public_ugc();

revoke all on function public.filter_league_public_ugc() from public, anon, authenticated;
