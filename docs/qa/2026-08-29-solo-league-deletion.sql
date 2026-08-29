-- Manual verification for solo-league deletion on account removal and league leave.
--
-- There is no pgTAP harness in this repo, so run this against a LOCAL Supabase
-- stack (never production):
--
--   supabase start
--   psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '\"')" \
--     -v ON_ERROR_STOP=1 -f docs/qa/2026-08-29-solo-league-deletion.sql
--
-- Each scenario RAISEs an exception if the observed state is wrong, so a clean
-- run (no error, final NOTICE printed) means all assertions passed. Everything
-- happens inside a transaction that is rolled back at the end.

begin;

do $$
declare
  v_user_a uuid := gen_random_uuid();   -- solo owner, will be deleted
  v_user_b uuid := gen_random_uuid();   -- co-member in a shared league
  v_comp_id bigint;
  v_solo_league uuid := gen_random_uuid();
  v_shared_league uuid := gen_random_uuid();
  v_member_a_solo uuid := gen_random_uuid();
  v_member_a_shared uuid := gen_random_uuid();
  v_member_b_shared uuid := gen_random_uuid();
  v_match_id bigint;
  v_survives boolean;
  v_owner uuid;
  v_nick text;
begin
  -- Minimal fixtures. Adjust column lists if the schema has NOT NULL columns
  -- without defaults that are not covered here.
  insert into auth.users (id) values (v_user_a), (v_user_b);
  insert into public.users (id) values (v_user_a), (v_user_b);

  select id into v_comp_id from public.competitions limit 1;
  select id into v_match_id from public.matches where competition_id = v_comp_id limit 1;

  -- Scenario 1: solo league owned by user A + predictions.
  insert into public.leagues (id, name, owner_id, competition_id)
    values (v_solo_league, 'Solo League', v_user_a, v_comp_id);
  insert into public.league_members (id, league_id, user_id, nickname, active, is_primary)
    values (v_member_a_solo, v_solo_league, v_user_a, 'A', true, true);
  if v_match_id is not null then
    insert into public.predictions (league_member_id, match_id, home_score, away_score)
      values (v_member_a_solo, v_match_id, 1, 0);
  end if;

  -- Scenario 2: shared league owned by A, co-member B.
  insert into public.leagues (id, name, owner_id, competition_id)
    values (v_shared_league, 'Shared League', v_user_a, v_comp_id);
  insert into public.league_members (id, league_id, user_id, nickname, active, is_primary)
    values (v_member_a_shared, v_shared_league, v_user_a, 'A', true, false),
           (v_member_b_shared, v_shared_league, v_user_b, 'B', true, true);

  -- Act.
  perform public.anonymize_user_account(v_user_a, null);

  -- Assert 1: solo league (and its cascade) is gone.
  select exists(select 1 from public.leagues where id = v_solo_league) into v_survives;
  if v_survives then
    raise exception 'FAIL: solo league still exists after account deletion';
  end if;
  if exists (select 1 from public.league_members where league_id = v_solo_league) then
    raise exception 'FAIL: solo league memberships were not cascade-deleted';
  end if;
  if v_match_id is not null
     and exists (select 1 from public.predictions where league_member_id = v_member_a_solo) then
    raise exception 'FAIL: solo league predictions were not cascade-deleted';
  end if;

  -- Assert 2: shared league survives, ownership transferred to B, A anonymized.
  select owner_id into v_owner from public.leagues where id = v_shared_league;
  if v_owner is null then
    raise exception 'FAIL: shared league was deleted or left ownerless';
  end if;
  if v_owner <> v_user_b then
    raise exception 'FAIL: shared league ownership did not transfer to B (got %)', v_owner;
  end if;
  select nickname into v_nick from public.league_members where id = v_member_a_shared;
  if v_nick <> 'Deleted Player' then
    raise exception 'FAIL: A''s shared membership was not anonymized (got %)', v_nick;
  end if;

  raise notice 'PASS: anonymize_user_account deletes solo leagues and preserves shared ones';
end $$;

-- Scenario 3: leave_league already deletes a solo league when its last member
-- leaves. This asserts that behavior is intact (uses auth.uid(), so it sets a
-- request-local claim to impersonate the leaving user).
do $$
declare
  v_user_c uuid := gen_random_uuid();
  v_comp_id bigint;
  v_league uuid := gen_random_uuid();
begin
  insert into auth.users (id) values (v_user_c);
  insert into public.users (id) values (v_user_c);
  select id into v_comp_id from public.competitions limit 1;

  insert into public.leagues (id, name, owner_id, competition_id)
    values (v_league, 'Leave Solo', v_user_c, v_comp_id);
  insert into public.league_members (league_id, user_id, nickname, active, is_primary)
    values (v_league, v_user_c, 'C', true, true);

  perform set_config('request.jwt.claims', json_build_object('sub', v_user_c)::text, true);
  perform public.leave_league(v_league);

  if exists (select 1 from public.leagues where id = v_league) then
    raise exception 'FAIL: leave_league did not delete the last-member solo league';
  end if;

  raise notice 'PASS: leave_league deletes a league when its last member leaves';
end $$;

rollback;
