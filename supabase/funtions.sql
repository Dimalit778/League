-- ============================================================================
-- LEAGUE FUNCTIONS
-- ============================================================================

-- Create a new league and add the creator as a member
-- Returns the created league record directly, throws exception on error
create or replace function public.f_create_new_league(
  league_name text,
  max_members int,
  competition_id int,
  nickname text,
  avatar_url text default null
)
returns public.leagues
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_league_id uuid;
  v_join_code text;
  v_league_record public.leagues;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  -- Generate unique join code (6 characters, uppercase)
  v_join_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

  -- Create the league
  insert into public.leagues (
    name,
    max_members,
    competition_id,
    owner_id,
    join_code
  )
  values (
    league_name,
    max_members,
    competition_id,
    v_user_id,
    v_join_code
  )
  returning * into v_league_record;

  -- Add creator as league member
  insert into public.league_members (
    league_id,
    user_id,
    nickname,
    avatar_url,
    is_primary
  )
  values (
    v_league_record.id,
    v_user_id,
    nickname,
    avatar_url,
    true
  );

  -- Return the created league
  return v_league_record;

exception
  when others then
    raise exception 'Failed to create league: %', sqlerrm;
end$$;

-- Join a league by join code
-- Returns the created league_member record directly, throws exception on error
create or replace function public.join_league(
  league_join_code text,
  user_nickname text,
  user_avatar_url text default null
)
returns public.league_members
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_league_id uuid;
  v_league_record public.leagues;
  v_member_count int;
  v_member_record public.league_members;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  -- Find league by join code
  select l.* into v_league_record
  from public.leagues l
  where l.join_code = upper(league_join_code);

  if v_league_record.id is null then
    raise exception 'League not found';
  end if;

  v_league_id := v_league_record.id;

  -- Check if user is already a member
  if exists (
    select 1 from public.league_members
    where league_id = v_league_id and user_id = v_user_id
  ) then
    raise exception 'You are already a member of this league';
  end if;

  -- Check member limit
  select count(*) into v_member_count
  from public.league_members
  where league_id = v_league_id;

  if v_member_count >= v_league_record.max_members then
    raise exception 'League is full';
  end if;

  -- Add user as league member
  insert into public.league_members (
    league_id,
    user_id,
    nickname,
    avatar_url,
    is_primary
  )
  values (
    v_league_id,
    v_user_id,
    user_nickname,
    user_avatar_url,
    false
  )
  returning * into v_member_record;

  return v_member_record;

exception
  when others then
    raise exception 'Failed to join league: %', sqlerrm;
end$$;

-- Leave a league
-- Returns void, throws exception on error
create or replace function public.f_leave_league(
  p_league_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_member_record public.league_members;
  v_remaining_members int;
  v_primary_member_id uuid;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  -- Get member record
  select * into v_member_record
  from public.league_members
  where league_id = p_league_id and user_id = v_user_id;

  if v_member_record.id is null then
    raise exception 'You are not a member of this league';
  end if;

  -- Delete the member
  delete from public.league_members
  where id = v_member_record.id;

  -- If this was the primary league, set another member as primary
  if v_member_record.is_primary then
    select id into v_primary_member_id
    from public.league_members
    where league_id = p_league_id
    limit 1;

    if v_primary_member_id is not null then
      update public.league_members
      set is_primary = true
      where id = v_primary_member_id;
    end if;
  end if;

exception
  when others then
    raise exception 'Failed to leave league: %', sqlerrm;
end$$;

-- Leave a league by member_id
-- If the leaving member was primary, sets the user's next league_member as primary
-- Returns json with success status, throws exception on error
create or replace function public.member_leave_league(
  p_member_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_member_record public.league_members;
  v_was_primary boolean;
  v_next_primary_member_id uuid;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  -- Get member record and verify ownership
  select * into v_member_record
  from public.league_members
  where id = p_member_id and user_id = v_user_id;

  if v_member_record.id is null then
    raise exception 'Member record not found or you do not have permission to leave this league';
  end if;

  -- Store if this was primary before deletion
  v_was_primary := v_member_record.is_primary;

  -- Delete the member
  delete from public.league_members
  where id = p_member_id;

  -- If this was the primary league, find the user's next league_member and set it as primary
  if v_was_primary then
    -- Find the next league_member for this user (from other leagues)
    select id into v_next_primary_member_id
    from public.league_members
    where user_id = v_user_id
    order by created_at asc
    limit 1;

    -- If there's another league_member, set it as primary
    if v_next_primary_member_id is not null then
      -- First, unset all other primary flags for this user
      update public.league_members
      set is_primary = false
      where user_id = v_user_id;

      -- Then set the next one as primary
      update public.league_members
      set is_primary = true
      where id = v_next_primary_member_id;
    end if;
  end if;

  return json_build_object('success', true, 'was_primary', v_was_primary, 'next_primary_set', v_next_primary_member_id is not null);

exception
  when others then
    raise exception 'Failed to leave league: %', sqlerrm;
end$$;

-- ============================================================================
-- FIXTURE FUNCTIONS
-- ============================================================================

-- 1) RPC to finalize a fixture
create or replace function public.finalize_fixture_points(p_fixture_id int)
returns void
language plpgsql
security definer
as $$
declare
  r record;
  v_points int;
begin
  for r in
    select id, user_id, league_id, league_member_id, home_score, away_score
    from predictions
    where fixture_id = p_fixture_id and is_finished = false
  loop
    -- exact score = 3, correct result = 1, else 0 (your current logic)
    select case
      when r.home_score = f.home_score and r.away_score = f.away_score then 3
      when (r.home_score > r.away_score and f.home_score > f.away_score)
        or (r.home_score < r.away_score and f.home_score < f.away_score)
        or (r.home_score = r.away_score and f.home_score = f.away_score)
      then 1 else 0 end
    into v_points
    from fixtures f where f.id = p_fixture_id;

    update predictions
    set points = v_points, is_finished = true, updated_at = now()
    where id = r.id;
  end loop;
end$$;

-- 2) Trigger: when fixture becomes finished
create or replace function public.on_fixture_finished()
returns trigger
language plpgsql
security definer
as $$
begin
  if (NEW.status = 'finished'
      and NEW.home_score is not null
      and NEW.away_score is not null
      and (OLD.status is distinct from 'finished')) then
    perform public.finalize_fixture_points(NEW.id);
  end if;
  return NEW;
end$$;

drop trigger if exists trg_fixture_finished on public.fixtures;
create trigger trg_fixture_finished
after update of status, home_score, away_score on public.fixtures
for each row
when (pg_trigger_depth() = 0)
execute function public.on_fixture_finished();