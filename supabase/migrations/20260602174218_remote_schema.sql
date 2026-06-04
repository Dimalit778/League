


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."match_status" AS ENUM (
    'TIMED',
    'SCHEDULED',
    'IN_PLAY',
    'LIVE',
    'FINISHED',
    'POSTPONED',
    'PAUSED'
);


ALTER TYPE "public"."match_status" OWNER TO "postgres";


CREATE TYPE "public"."role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE "public"."role" OWNER TO "postgres";


COMMENT ON TYPE "public"."role" IS 'user role';



CREATE OR REPLACE FUNCTION "public"."create_new_league"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id   uuid;
  v_join_code text;
  v_league_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  LOOP
    v_join_code := upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 7));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.leagues WHERE join_code = v_join_code);
  END LOOP;

  UPDATE public.league_members
  SET is_primary = false
  WHERE user_id = v_user_id;

  INSERT INTO public.leagues (name, max_members, competition_id, owner_id, join_code)
  VALUES (league_name, max_members, competition_id, v_user_id, v_join_code)
  RETURNING id INTO v_league_id;

  INSERT INTO public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  VALUES (v_league_id, v_user_id, nickname, avatar_url, true);

  RETURN v_league_id;
END;
$$;


ALTER FUNCTION "public"."create_new_league"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_league_v3"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
  v_join_code text;
  v_league_id uuid;
  v_total_leagues int;
  v_sub_type text;
  v_is_free_competition boolean;
  v_max_leagues int;
  v_max_members_allowed int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- קבל תוכנית פעילה
  SELECT type INTO v_sub_type
  FROM public.subscription
  WHERE user_id = v_user_id
    AND end_date >= now()
  ORDER BY end_date DESC
  LIMIT 1;
  v_sub_type := COALESCE(v_sub_type, 'FREE');

  -- קבע מגבלות לפי תוכנית
  IF v_sub_type = 'PRO' THEN
    v_max_leagues := 5;
    v_max_members_allowed := 12;
  ELSE
    v_max_leagues := 2;
    v_max_members_allowed := 6;
  END IF;

  -- סך הליגות של המשתמש (בעל + חבר)
  SELECT COUNT(*) INTO v_total_leagues
  FROM public.league_members
  WHERE user_id = v_user_id;

  IF v_total_leagues >= v_max_leagues THEN
    RAISE EXCEPTION 'Plan limit: you can be in at most % leagues', v_max_leagues;
  END IF;

  -- בדוק מקסימום משתתפים
  IF max_members > v_max_members_allowed THEN
    RAISE EXCEPTION 'Plan limit: max % members per league', v_max_members_allowed;
  END IF;

  -- בדוק שהתחרות מותרת לתוכנית
  SELECT c.is_free INTO v_is_free_competition
  FROM public.competitions c
  WHERE c.id = competition_id;

  IF v_is_free_competition IS NULL THEN
    RAISE EXCEPTION 'Competition not found';
  END IF;

  IF v_sub_type = 'FREE' AND NOT v_is_free_competition THEN
    RAISE EXCEPTION 'This competition requires a PRO subscription';
  END IF;

  -- צור join_code ייחודי
  LOOP
    v_join_code := upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 7));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.leagues WHERE join_code = v_join_code);
  END LOOP;

  UPDATE public.league_members
  SET is_primary = false
  WHERE user_id = v_user_id;

  INSERT INTO public.leagues (name, max_members, competition_id, owner_id, join_code)
  VALUES (league_name, max_members, competition_id, v_user_id, v_join_code)
  RETURNING id INTO v_league_id;

  INSERT INTO public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  VALUES (v_league_id, v_user_id, nickname, avatar_url, true);

  RETURN v_league_id;
END;
$$;


ALTER FUNCTION "public"."create_new_league_v3"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_subscription"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  INSERT INTO public.subscription (
    user_id,
    subscription_type,
    start_date,
    end_date,
    can_add_members,
    access_advanced_stats
  ) VALUES (
    NEW.id,
    'FREE',
    NOW(),
    NOW() + INTERVAL '100 years',
    FALSE,
    FALSE
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_subscription"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_owned_league"("p_league_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
end;
$$;


ALTER FUNCTION "public"."delete_owned_league"("p_league_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_league_by_code"("p_join_code" "text") RETURNS TABLE("league_id" "uuid", "league_name" "text", "competition_name" "text", "competition_logo" "text", "competition_area" "text", "competition_flag" "text", "members_count" integer, "max_members" integer, "owner_nickname" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    l.id              as league_id,
    l.name            as league_name,         
    c.name            as competition_name,
    c.logo            as competition_logo,
    c.area            as competition_area,
    c.flag            as competition_flag,
    count(lm.id)      as members_count,
    l.max_members     as max_members,
    owner_lm.nickname as owner_nickname
  from leagues l
  join competitions c
    on c.id = l.competition_id
  left join league_members lm
    on lm.league_id = l.id
  left join league_members owner_lm
    on owner_lm.league_id = l.id
   and owner_lm.user_id   = l.owner_id
  where l.join_code = p_join_code
  group by
    l.id,
    l.name,
    c.name,
    c.logo,
    c.area,
    c.flag,
    l.max_members,
    owner_lm.nickname;
$$;


ALTER FUNCTION "public"."find_league_by_code"("p_join_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, provider)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_app_meta_data->>'provider'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid()) AND role = 'ADMIN'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'Check if the current user has ADMIN role';



CREATE OR REPLACE FUNCTION "public"."is_league_member"("league_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.league_members
    WHERE user_id = (SELECT auth.uid()) AND league_id = league_id_param
  );
END;
$$;


ALTER FUNCTION "public"."is_league_member"("league_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_league_member"("league_id_param" "uuid") IS 'Check if the current user is a member of the specified league';



CREATE OR REPLACE FUNCTION "public"."is_league_owner"("league_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leagues
    WHERE id = league_id_param AND owner_id = (SELECT auth.uid())
  );
END;
$$;


ALTER FUNCTION "public"."is_league_owner"("league_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_league_owner"("league_id_param" "uuid") IS 'Check if the current user owns the specified league';



CREATE OR REPLACE FUNCTION "public"."is_member_in_league"("_league" "uuid", "_user" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.league_members lm
    WHERE lm.league_id = _league AND lm.user_id = _user
  );
$$;


ALTER FUNCTION "public"."is_member_in_league"("_league" "uuid", "_user" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."league_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "league_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "nickname" "text" NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "nickname_length" CHECK ((("length"("nickname") >= 1) AND ("length"("nickname") <= 50))),
    CONSTRAINT "nickname_not_empty" CHECK (("length"(TRIM(BOTH FROM "nickname")) > 0))
);


ALTER TABLE "public"."league_members" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_league"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text" DEFAULT NULL::"text") RETURNS "public"."league_members"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_id       uuid;
  v_league_id     uuid;
  v_league_record public.leagues;
  v_member_count  int;
  v_member_record public.league_members;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT l.* INTO v_league_record
  FROM public.leagues l
  WHERE l.join_code = upper(league_join_code);

  IF v_league_record.id IS NULL THEN
    RAISE EXCEPTION 'League not found';
  END IF;

  v_league_id := v_league_record.id;

  IF EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = v_league_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this league';
  END IF;

  SELECT COUNT(*) INTO v_member_count
  FROM public.league_members
  WHERE league_id = v_league_id;

  IF v_member_count >= v_league_record.max_members THEN
    RAISE EXCEPTION 'League is full';
  END IF;

  INSERT INTO public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  VALUES (v_league_id, v_user_id, user_nickname, user_avatar_url, false)
  RETURNING * INTO v_member_record;

  RETURN v_member_record;

EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."join_league"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_league_v3"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text" DEFAULT NULL::"text") RETURNS "public"."league_members"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
  v_league_id uuid;
  v_league_record public.leagues;
  v_member_count int;
  v_member_record public.league_members;
  v_total_leagues int;
  v_sub_type text;
  v_max_leagues int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- קבל תוכנית פעילה
  SELECT type INTO v_sub_type
  FROM public.subscription
  WHERE user_id = v_user_id
    AND end_date >= now()
  ORDER BY end_date DESC
  LIMIT 1;
  v_sub_type := COALESCE(v_sub_type, 'FREE');

  v_max_leagues := CASE WHEN v_sub_type = 'PRO' THEN 5 ELSE 2 END;

  -- סך הליגות של המשתמש
  SELECT COUNT(*) INTO v_total_leagues
  FROM public.league_members
  WHERE user_id = v_user_id;

  IF v_total_leagues >= v_max_leagues THEN
    RAISE EXCEPTION 'Plan limit: you can be in at most % leagues', v_max_leagues;
  END IF;

  -- מצא ליגה לפי קוד
  SELECT l.* INTO v_league_record
  FROM public.leagues l
  WHERE l.join_code = upper(league_join_code);

  IF v_league_record.id IS NULL THEN
    RAISE EXCEPTION 'League not found';
  END IF;

  IF v_league_record.status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'This league is currently locked and not accepting new members';
  END IF;

  v_league_id := v_league_record.id;

  IF EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = v_league_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this league';
  END IF;

  SELECT COUNT(*) INTO v_member_count
  FROM public.league_members
  WHERE league_id = v_league_id;

  IF v_member_count >= v_league_record.max_members THEN
    RAISE EXCEPTION 'League is full';
  END IF;

  INSERT INTO public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  VALUES (v_league_id, v_user_id, user_nickname, user_avatar_url, false)
  RETURNING * INTO v_member_record;

  RETURN v_member_record;

EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."join_league_v3"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."leave_league"("p_league_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
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
  select owner_id, name
    into v_league_owner_id, v_league_name
  from public.leagues
  where id = p_league_id;
  
  if v_league_owner_id is null then
    raise exception 'League not found';
  end if;

  -- Check membership
  select is_primary
    into v_is_primary_league
  from public.league_members
  where user_id = v_user_id
    and league_id = p_league_id;
  
  if v_is_primary_league is null then
    raise exception 'User is not a member of this league';
  end if;

  -- Count other members
  select count(*)
    into v_other_members_count
  from public.league_members
  where league_id = p_league_id
    and user_id != v_user_id;

  -- Transfer ownership if needed
  if v_league_owner_id = v_user_id
     and v_other_members_count > 0 then

    select user_id
      into v_new_owner_id
    from public.league_members
    where league_id = p_league_id
      and user_id != v_user_id
    order by created_at asc
    limit 1;
    
    update public.leagues
    set owner_id = v_new_owner_id
    where id = p_league_id;
  end if;

  -- Delete the member
  delete from public.league_members
  where user_id = v_user_id
    and league_id = p_league_id;

  -- Handle primary league reassignment
  if v_is_primary_league then
    select id
      into v_next_primary_member_id
    from public.league_members
    where user_id = v_user_id
    order by created_at asc
    limit 1;

    if v_next_primary_member_id is not null then
      update public.league_members
      set is_primary = false
      where user_id = v_user_id;

      update public.league_members
      set is_primary = true
      where id = v_next_primary_member_id;
    end if;
  end if;

  -- Delete league if empty
  if v_league_owner_id = v_user_id
     and v_other_members_count = 0 then

    delete from public.leagues
    where id = p_league_id;

    return json_build_object(
      'success', true,
      'message', 'League deleted'
    );
  end if;

  return json_build_object(
    'success', true,
    'message', format('Left %s', v_league_name)
  );
end;
$$;


ALTER FUNCTION "public"."leave_league"("p_league_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_is_member_self"("_member" "uuid") RETURNS boolean
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.league_members lm
    WHERE lm.id = _member
      AND lm.user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."rls_is_member_self"("_member" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_is_user_in_league"("_league" "uuid") RETURNS boolean
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.league_members lm
    WHERE lm.league_id = _league
      AND lm.user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."rls_is_user_in_league"("_league" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_primary_league"("p_league_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."set_primary_league"("p_league_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_calc_prediction_points_on_match_finish"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
DECLARE
  ft_home int;
  ft_away int;
BEGIN
  -- Only proceed if NEW is finished (enum)
  IF NEW.status IS DISTINCT FROM 'FINISHED'::match_status THEN
    RETURN NEW;
  END IF;

  -- Extract full-time scores
  ft_home := COALESCE(
               (NEW.score->'fullTime' ->> 'home')::int,
               (NEW.score->'fulltime'->> 'home')::int
             );
  ft_away := COALESCE(
               (NEW.score->'fullTime' ->> 'away')::int,
               (NEW.score->'fulltime'->> 'away')::int
             );

  IF ft_home IS NULL OR ft_away IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.predictions p
  SET
    points = CASE
      WHEN p.home_score = ft_home AND p.away_score = ft_away THEN 5
      WHEN
        ((p.home_score = p.away_score) AND (ft_home = ft_away)) OR
        ((p.home_score > p.away_score) AND (ft_home > ft_away)) OR
        ((p.home_score < p.away_score) AND (ft_home < ft_away))
      THEN 3
      ELSE 0
    END,
    is_finished = TRUE,
    updated_at = now()
  WHERE p.match_id = NEW.id
    AND p.is_finished = FALSE;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."tg_calc_prediction_points_on_match_finish"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."competitions" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "type" "text" NOT NULL,
    "logo" "text" NOT NULL,
    "area" "text" NOT NULL,
    "flag" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "season_id" integer,
    "season_start" "date",
    "season_end" "date",
    "current_fixture" integer,
    "total_fixtures" integer DEFAULT 0,
    "current_stage" "text",
    "is_free" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."competitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" integer NOT NULL,
    "home_score" integer NOT NULL,
    "away_score" integer NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "is_finished" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "league_member_id" "uuid" NOT NULL,
    CONSTRAINT "predictions_predicted_away_score_check" CHECK (("away_score" >= 0)),
    CONSTRAINT "predictions_predicted_home_score_check" CHECK (("home_score" >= 0))
);


ALTER TABLE "public"."predictions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."league_leaderboard_view" WITH ("security_invoker"='on') AS
 SELECT "lm"."id" AS "member_id",
    "lm"."league_id",
    "lm"."user_id",
    "lm"."nickname",
    "lm"."avatar_url",
    (COALESCE("sum"("p"."points"), (0)::bigint))::integer AS "total_points"
   FROM ("public"."league_members" "lm"
     LEFT JOIN "public"."predictions" "p" ON (("p"."league_member_id" = "lm"."id")))
  GROUP BY "lm"."id", "lm"."league_id", "lm"."user_id", "lm"."nickname", "lm"."avatar_url"
  ORDER BY ((COALESCE("sum"("p"."points"), (0)::bigint))::integer) DESC;


ALTER VIEW "public"."league_leaderboard_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leagues" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "join_code" "text" NOT NULL,
    "competition_id" integer NOT NULL,
    "max_members" integer DEFAULT 6 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "leagues_max_members_check" CHECK ((("max_members" >= 2) AND ("max_members" <= 10)))
);


ALTER TABLE "public"."leagues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" integer NOT NULL,
    "competition_id" integer,
    "fixture" integer,
    "kick_off" timestamp with time zone NOT NULL,
    "status" "public"."match_status",
    "stage" "text",
    "group" "text",
    "home_team_id" integer,
    "away_team_id" integer,
    "referee" "text",
    "score" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "matches_score_shape_chk" CHECK ((("score" IS NULL) OR (("jsonb_typeof"("score") = 'object'::"text") AND ("score" ? 'winner'::"text") AND ("score" ? 'duration'::"text") AND ("score" ? 'fullTime'::"text") AND ("score" ? 'halfTime'::"text") AND ("jsonb_typeof"(("score" -> 'fullTime'::"text")) = 'object'::"text") AND ("jsonb_typeof"(("score" -> 'halfTime'::"text")) = 'object'::"text") AND (("score" -> 'fullTime'::"text") ? 'home'::"text") AND (("score" -> 'fullTime'::"text") ? 'away'::"text") AND (("score" -> 'halfTime'::"text") ? 'home'::"text") AND (("score" -> 'halfTime'::"text") ? 'away'::"text") AND ("jsonb_typeof"(("score" -> 'winner'::"text")) = ANY (ARRAY['string'::"text", 'null'::"text"])) AND ("jsonb_typeof"(("score" -> 'duration'::"text")) = ANY (ARRAY['string'::"text", 'null'::"text"])) AND ("jsonb_typeof"((("score" -> 'fullTime'::"text") -> 'home'::"text")) = ANY (ARRAY['number'::"text", 'null'::"text"])) AND ("jsonb_typeof"((("score" -> 'fullTime'::"text") -> 'away'::"text")) = ANY (ARRAY['number'::"text", 'null'::"text"])) AND ("jsonb_typeof"((("score" -> 'halfTime'::"text") -> 'home'::"text")) = ANY (ARRAY['number'::"text", 'null'::"text"])) AND ("jsonb_typeof"((("score" -> 'halfTime'::"text") -> 'away'::"text")) = ANY (ARRAY['number'::"text", 'null'::"text"])))))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "logo" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tla" "text",
    "shortName" "text",
    "venue" "text"
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "provider" "text" DEFAULT 'email'::"text" NOT NULL,
    "role" "text" DEFAULT 'USER'::"text" NOT NULL,
    "notification_token" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."competitions"
    ADD CONSTRAINT "competitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."league_members"
    ADD CONSTRAINT "league_members_nickname_key" UNIQUE ("league_id", "nickname");



ALTER TABLE ONLY "public"."league_members"
    ADD CONSTRAINT "league_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."league_members"
    ADD CONSTRAINT "league_members_user_id_league_id_key" UNIQUE ("user_id", "league_id");



ALTER TABLE ONLY "public"."leagues"
    ADD CONSTRAINT "leagues_join_code_key" UNIQUE ("join_code");



ALTER TABLE ONLY "public"."leagues"
    ADD CONSTRAINT "leagues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_league_member_match_key" UNIQUE ("league_member_id", "match_id");



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_league_members_league_id" ON "public"."league_members" USING "btree" ("league_id");



CREATE INDEX "idx_league_members_user_id" ON "public"."league_members" USING "btree" ("user_id");



CREATE INDEX "idx_league_members_user_league_id" ON "public"."league_members" USING "btree" ("user_id", "league_id", "id");



CREATE INDEX "idx_leagues_competition_id" ON "public"."leagues" USING "btree" ("competition_id");



CREATE INDEX "idx_leagues_join_code" ON "public"."leagues" USING "btree" ("upper"("join_code"));



CREATE INDEX "idx_leagues_owner_id" ON "public"."leagues" USING "btree" ("owner_id");



CREATE INDEX "idx_matches_away_team_id" ON "public"."matches" USING "btree" ("away_team_id");



CREATE INDEX "idx_matches_competition_fixture" ON "public"."matches" USING "btree" ("competition_id", "fixture");



CREATE INDEX "idx_matches_competition_stage_group" ON "public"."matches" USING "btree" ("competition_id", "stage", "group");



CREATE INDEX "idx_matches_home_team_id" ON "public"."matches" USING "btree" ("home_team_id");



CREATE INDEX "idx_matches_kick_off" ON "public"."matches" USING "btree" ("competition_id", "kick_off");



CREATE INDEX "idx_matches_stage" ON "public"."matches" USING "btree" ("competition_id", "stage");



CREATE INDEX "idx_matches_status" ON "public"."matches" USING "btree" ("status");



CREATE INDEX "idx_predictions_league_member" ON "public"."predictions" USING "btree" ("league_member_id");



CREATE INDEX "idx_predictions_match" ON "public"."predictions" USING "btree" ("match_id");



CREATE INDEX "idx_predictions_match_active" ON "public"."predictions" USING "btree" ("match_id") WHERE ("is_finished" = false);



CREATE INDEX "idx_predictions_member_created" ON "public"."predictions" USING "btree" ("league_member_id", "created_at" DESC);



CREATE OR REPLACE TRIGGER "on_user_created_create_subscription" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_user_subscription"();



CREATE OR REPLACE TRIGGER "trg_match_finish_points" AFTER INSERT OR UPDATE OF "status", "score" ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."tg_calc_prediction_points_on_match_finish"();



ALTER TABLE ONLY "public"."league_members"
    ADD CONSTRAINT "league_members_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."league_members"
    ADD CONSTRAINT "league_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leagues"
    ADD CONSTRAINT "leagues_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leagues"
    ADD CONSTRAINT "leagues_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_league_member_id_fkey" FOREIGN KEY ("league_member_id") REFERENCES "public"."league_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY " Read - Admin , all league_memberss" ON "public"."league_members" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR "public"."is_league_member"("league_id") OR ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Delete - Admin, Member, League owner" ON "public"."league_members" FOR DELETE TO "authenticated" USING (("public"."is_admin"() OR "public"."is_league_owner"("league_id") OR ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Insert -  Admin, Member" ON "public"."league_members" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Update - Admin, Member" ON "public"."league_members" FOR UPDATE TO "authenticated" USING (("public"."is_admin"() OR ("user_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK (("public"."is_admin"() OR ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users: Delete competitions" ON "public"."competitions" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Users: Delete leagues" ON "public"."leagues" FOR DELETE TO "authenticated" USING (("public"."is_admin"() OR ("owner_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users: Delete matches" ON "public"."matches" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Users: Delete predictions" ON "public"."predictions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."league_members" "lm"
  WHERE (("lm"."id" = "predictions"."league_member_id") AND ("lm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users: Delete teams" ON "public"."teams" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Users: Delete users" ON "public"."users" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Users: Insert competitions" ON "public"."competitions" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Users: Insert leagues" ON "public"."leagues" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR ("owner_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users: Insert matches" ON "public"."matches" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Users: Insert predictions" ON "public"."predictions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."league_members" "lm"
  WHERE (("lm"."id" = "predictions"."league_member_id") AND ("lm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users: Insert teams" ON "public"."teams" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Users: Insert users" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() OR ("id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users: Read competitions" ON "public"."competitions" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR true));



CREATE POLICY "Users: Read leagues" ON "public"."leagues" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users: Read matches" ON "public"."matches" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR true));



CREATE POLICY "Users: Read predictions" ON "public"."predictions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."league_members" "lm_self"
     JOIN "public"."league_members" "lm_pred" ON (("lm_self"."league_id" = "lm_pred"."league_id")))
  WHERE (("lm_self"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("lm_pred"."id" = "predictions"."league_member_id")))));



CREATE POLICY "Users: Read teams" ON "public"."teams" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR true));



CREATE POLICY "Users: Read users" ON "public"."users" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR ("id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users: Update competitions" ON "public"."competitions" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Users: Update leagues" ON "public"."leagues" FOR UPDATE TO "authenticated" USING (("public"."is_admin"() OR ("owner_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK (("public"."is_admin"() OR ("owner_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users: Update matches" ON "public"."matches" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Users: Update predictions" ON "public"."predictions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."league_members" "lm"
  WHERE (("lm"."id" = "predictions"."league_member_id") AND ("lm"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."league_members" "lm"
  WHERE (("lm"."id" = "predictions"."league_member_id") AND ("lm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users: Update teams" ON "public"."teams" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Users: Update users" ON "public"."users" FOR UPDATE TO "authenticated" USING (("public"."is_admin"() OR ("id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK (("public"."is_admin"() OR ("id" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."competitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."league_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leagues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."predictions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."create_new_league"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_league"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_league"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_league_v3"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_league_v3"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_league_v3"("league_name" "text", "max_members" integer, "competition_id" integer, "nickname" "text", "avatar_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_subscription"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_subscription"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_subscription"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_owned_league"("p_league_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_owned_league"("p_league_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_owned_league"("p_league_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_league_by_code"("p_join_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."find_league_by_code"("p_join_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_league_by_code"("p_join_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_league_member"("league_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_league_member"("league_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_league_member"("league_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_league_owner"("league_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_league_owner"("league_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_league_owner"("league_id_param" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_member_in_league"("_league" "uuid", "_user" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_member_in_league"("_league" "uuid", "_user" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."is_member_in_league"("_league" "uuid", "_user" "uuid") TO "authenticated";



GRANT ALL ON TABLE "public"."league_members" TO "anon";
GRANT ALL ON TABLE "public"."league_members" TO "authenticated";
GRANT ALL ON TABLE "public"."league_members" TO "service_role";



GRANT ALL ON FUNCTION "public"."join_league"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."join_league"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_league"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."join_league_v3"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."join_league_v3"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_league_v3"("league_join_code" "text", "user_nickname" "text", "user_avatar_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."leave_league"("p_league_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."leave_league"("p_league_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."leave_league"("p_league_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."rls_is_member_self"("_member" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."rls_is_member_self"("_member" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."rls_is_member_self"("_member" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_is_member_self"("_member" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."rls_is_user_in_league"("_league" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."rls_is_user_in_league"("_league" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."rls_is_user_in_league"("_league" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_is_user_in_league"("_league" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_primary_league"("p_league_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_primary_league"("p_league_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_primary_league"("p_league_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."tg_calc_prediction_points_on_match_finish"() TO "anon";
GRANT ALL ON FUNCTION "public"."tg_calc_prediction_points_on_match_finish"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tg_calc_prediction_points_on_match_finish"() TO "service_role";
























GRANT ALL ON TABLE "public"."competitions" TO "anon";
GRANT ALL ON TABLE "public"."competitions" TO "authenticated";
GRANT ALL ON TABLE "public"."competitions" TO "service_role";



GRANT ALL ON TABLE "public"."predictions" TO "anon";
GRANT ALL ON TABLE "public"."predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."predictions" TO "service_role";



GRANT ALL ON TABLE "public"."league_leaderboard_view" TO "anon";
GRANT ALL ON TABLE "public"."league_leaderboard_view" TO "authenticated";
GRANT ALL ON TABLE "public"."league_leaderboard_view" TO "service_role";



GRANT ALL ON TABLE "public"."leagues" TO "anon";
GRANT ALL ON TABLE "public"."leagues" TO "authenticated";
GRANT ALL ON TABLE "public"."leagues" TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































