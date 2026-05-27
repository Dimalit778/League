-- ============================================================================
-- LEAGUE FUNCTIONS
-- ============================================================================

-- Create a new league and add the creator as a primary member.
-- RPC used by the mobile client; returns the created league id.
-- Enforces subscription limits (FREE: 1 league, PRO: 3) and is_free gate.
create or replace function public.create_new_league(
  league_name   text,
  max_members   int,
  competition_id int,
  nickname      text,
  avatar_url    text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id             uuid;
  v_join_code           text;
  v_league_id           uuid;
  v_owned_count         int;
  v_sub_type            text;
  v_is_free_competition boolean;
  v_free_limit constant int := 1;
  v_pro_limit  constant int := 3;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  -- Resolve caller's subscription plan
  select subscription_type into v_sub_type
  from public.subscription
  where user_id = v_user_id
  order by end_date desc
  limit 1;
  v_sub_type := coalesce(v_sub_type, 'FREE');

  -- Count ACTIVE owned leagues
  select count(*) into v_owned_count
  from public.leagues
  where owner_id = v_user_id and status = 'ACTIVE';

  -- Enforce per-plan ownership limit
  if v_sub_type = 'FREE' and v_owned_count >= v_free_limit then
    raise exception 'Free plan is limited to % owned league', v_free_limit;
  elsif v_sub_type <> 'FREE' and v_owned_count >= v_pro_limit then
    raise exception 'Pro plan is limited to % owned leagues', v_pro_limit;
  end if;

  -- Enforce is_free competition gate
  select c.is_free into v_is_free_competition
  from public.competitions c
  where c.id = competition_id;

  if v_is_free_competition is null then
    raise exception 'Competition not found';
  end if;

  if v_sub_type = 'FREE' and not v_is_free_competition then
    raise exception 'This competition requires a Pro subscription';
  end if;

  loop
    v_join_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 7));
    exit when not exists (
      select 1
      from public.leagues
      where join_code = v_join_code
    );
  end loop;

  update public.league_members
  set is_primary = false
  where user_id = v_user_id;

  insert into public.leagues (name, max_members, competition_id, owner_id, join_code)
  values (league_name, max_members, competition_id, v_user_id, v_join_code)
  returning id into v_league_id;

  insert into public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  values (v_league_id, v_user_id, nickname, avatar_url, true);

  return v_league_id;

exception
  when others then
    raise exception '%', sqlerrm;
end$$;

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

  update public.league_members
  set is_primary = false
  where user_id = v_user_id;

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

-- Set the authenticated user's primary league in a single transaction.
create or replace function public.set_primary_league(
  p_league_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_member_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  select id into v_member_id
  from public.league_members
  where league_id = p_league_id and user_id = v_user_id;

  if v_member_id is null then
    raise exception 'User is not a member of this league';
  end if;

  update public.league_members
  set is_primary = false
  where user_id = v_user_id and is_primary = true;

  update public.league_members
  set is_primary = true
  where id = v_member_id;

  return json_build_object('success', true, 'member_id', v_member_id, 'league_id', p_league_id);

exception
  when others then
    raise exception 'Failed to set primary league: %', sqlerrm;
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

  -- Block joins to locked leagues (SECURITY DEFINER bypasses the RLS policy)
  if v_league_record.status <> 'ACTIVE' then
    raise exception 'This league is currently locked and not accepting new members';
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

-- Leave a league by league_id (RPC function used by API)
-- Handles ownership transfer, primary league, and league deletion
-- Returns json with success status and message, throws exception on error
create or replace function public.leave_league(
  p_league_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_league_owner_id uuid;
  v_is_primary_league boolean;
  v_league_name text;
  v_other_members_count integer;
  v_new_owner_id uuid;
  v_next_primary_member_id uuid;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  -- Get league info
  select owner_id, name into v_league_owner_id, v_league_name
  from public.leagues
  where id = p_league_id;
  
  if v_league_owner_id is null then
    raise exception 'League not found';
  end if;

  -- Check membership and get primary status
  select is_primary into v_is_primary_league
  from public.league_members
  where user_id = v_user_id and league_id = p_league_id;
  
  if v_is_primary_league is null then
    raise exception 'User is not a member of this league';
  end if;

  -- Count other members (before deletion)
  select count(*) into v_other_members_count
  from public.league_members
  where league_id = p_league_id and user_id != v_user_id;

  -- Transfer ownership if needed (before deleting member)
  if v_league_owner_id = v_user_id and v_other_members_count > 0 then
    select user_id into v_new_owner_id
    from public.league_members
    where league_id = p_league_id and user_id != v_user_id
    order by created_at asc
    limit 1;
    
    update public.leagues
    set owner_id = v_new_owner_id
    where id = p_league_id;
  end if;

  -- **ACTUALLY DELETE THE MEMBER** (this was missing in your original function!)
  delete from public.league_members
  where user_id = v_user_id and league_id = p_league_id;

  -- Handle primary league (set user's next league as primary)
  if v_is_primary_league then
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

  -- Delete league if empty (after member deletion)
  if v_league_owner_id = v_user_id and v_other_members_count = 0 then
    delete from public.leagues
    where id = p_league_id;
    return json_build_object('success', true, 'message', 'League deleted');
  end if;

  return json_build_object(
    'success', true,
    'message', format('Left %s', v_league_name)
  );

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

-- Delete a league owned by the authenticated user and set another primary league if needed.
create or replace function public.delete_owned_league(
  p_league_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_deleted_count integer;
  v_next_primary_member_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  delete from public.leagues
  where id = p_league_id and owner_id = v_user_id;

  get diagnostics v_deleted_count = row_count;

  if v_deleted_count = 0 then
    raise exception 'League not found or you are not the owner';
  end if;

  select id into v_next_primary_member_id
  from public.league_members
  where user_id = v_user_id
  order by created_at asc
  limit 1;

  update public.league_members
  set is_primary = false
  where user_id = v_user_id and is_primary = true;

  if v_next_primary_member_id is not null then
    update public.league_members
    set is_primary = true
    where id = v_next_primary_member_id;
  end if;

  return json_build_object(
    'success', true,
    'league_id', p_league_id,
    'next_primary_set', v_next_primary_member_id is not null
  );

exception
  when others then
    raise exception 'Failed to delete league: %', sqlerrm;
end$$;

-- ============================================================================
-- USER / SUBSCRIPTION TRIGGERS
-- ============================================================================

-- Create default FREE subscription when a new user is inserted into public.users
create or replace function public.on_new_user_create_free_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscription (
    user_id,
    subscription_type,
    start_date,
    end_date,
    access_advanced_stats,
    can_add_members
  )
  values (
    NEW.id,
    'FREE'::public.subscription_type,
    now(),
    '2099-12-31'::date,
    false,
    false
  );
  return NEW;
exception
  when others then
    raise exception 'Failed to create default free subscription: %', sqlerrm;
end$$;

drop trigger if exists trg_on_new_user_create_free_subscription on public.users;
create trigger trg_on_new_user_create_free_subscription
  after insert on public.users
  for each row
  execute function public.on_new_user_create_free_subscription();

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
