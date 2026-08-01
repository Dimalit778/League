-- Enforce user-controlled input rules at the database boundary. Constraints
-- are NOT VALID so legacy rows cannot block deployment; PostgreSQL still
-- enforces them for every new or updated row.

create or replace function public.normalize_league_input()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.name := btrim(new.name);
  new.join_code := upper(btrim(new.join_code));
  return new;
end;
$$;

drop trigger if exists normalize_league_input_before_write on public.leagues;
create trigger normalize_league_input_before_write
before insert or update of name, join_code on public.leagues
for each row execute function public.normalize_league_input();

create or replace function public.normalize_league_member_input()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.nickname := btrim(new.nickname);
  return new;
end;
$$;

drop trigger if exists normalize_league_member_input_before_write on public.league_members;
create trigger normalize_league_member_input_before_write
before insert or update of nickname on public.league_members
for each row execute function public.normalize_league_member_input();

alter table public.leagues
  drop constraint if exists league_name_length;
alter table public.leagues
  add constraint league_name_length
  check (char_length(name) between 2 and 50) not valid;

alter table public.leagues
  drop constraint if exists league_join_code_format;
alter table public.leagues
  add constraint league_join_code_format
  check (join_code ~ '^[A-Z0-9]{7}$') not valid;

alter table public.league_members
  drop constraint if exists nickname_length;
alter table public.league_members
  add constraint nickname_length
  check (char_length(nickname) between 2 and 20) not valid;

alter table public.predictions
  drop constraint if exists predictions_home_score_range;
alter table public.predictions
  add constraint predictions_home_score_range
  check (home_score between 0 and 99) not valid;

alter table public.predictions
  drop constraint if exists predictions_away_score_range;
alter table public.predictions
  add constraint predictions_away_score_range
  check (away_score between 0 and 99) not valid;

-- League creation and joining must go through the SECURITY DEFINER RPCs,
-- which enforce plan limits, capacity and ownership. Direct inserts would
-- otherwise allow an authenticated client to bypass those business rules.
drop policy if exists "Users: Insert leagues" on public.leagues;
create policy "Admins: Insert leagues"
  on public.leagues
  as permissive
  for insert
  to authenticated
  with check (public.is_admin());
drop policy if exists "Insert -  Admin, Member" on public.league_members;
create policy "Admins: Insert league members"
  on public.league_members
  as permissive
  for insert
  to authenticated
  with check (public.is_admin());
