create extension if not exists "pg_cron" with schema "pg_catalog";

create type "public"."match_status" as enum ('TIMED', 'SCHEDULED', 'IN_PLAY', 'LIVE', 'FINISHED', 'POSTPONED', 'PAUSED');


  create table "public"."admin_users" (
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."admin_users" enable row level security;


  create table "public"."competitions" (
    "id" integer not null,
    "name" text not null,
    "code" text not null,
    "type" text not null,
    "logo" text not null,
    "area" text not null,
    "flag" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "season_id" integer,
    "season_start" date,
    "season_end" date,
    "current_fixture" integer,
    "total_fixtures" integer default 0,
    "current_stage" text,
    "is_free" boolean not null default true
      );


alter table "public"."competitions" enable row level security;


  create table "public"."league_members" (
    "id" uuid not null default gen_random_uuid(),
    "league_id" uuid not null,
    "user_id" uuid not null,
    "nickname" text not null,
    "avatar_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "is_primary" boolean not null default false,
    "active" boolean not null default true
      );


alter table "public"."league_members" enable row level security;


  create table "public"."leagues" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "owner_id" uuid not null,
    "join_code" text not null,
    "competition_id" integer not null,
    "max_members" integer not null default 6,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."leagues" enable row level security;


  create table "public"."matches" (
    "id" integer not null,
    "competition_id" integer,
    "fixture" integer,
    "kick_off" timestamp with time zone not null,
    "status" public.match_status,
    "stage" text,
    "group" text,
    "home_team_id" integer,
    "away_team_id" integer,
    "referee" text,
    "score" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "ai_summary_en" text,
    "ai_summary_he" text,
    "ai_predicted_home_score" smallint,
    "ai_predicted_away_score" smallint,
    "ai_generated_at" timestamp with time zone
      );


alter table "public"."matches" enable row level security;


  create table "public"."predictions" (
    "id" uuid not null default gen_random_uuid(),
    "match_id" integer not null,
    "home_score" integer not null,
    "away_score" integer not null,
    "points" integer not null default 0,
    "is_finished" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "league_member_id" uuid not null
      );


alter table "public"."predictions" enable row level security;


  create table "public"."teams" (
    "id" integer not null,
    "name" text not null,
    "logo" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "tla" text,
    "shortName" text,
    "venue" text,
    "clubColors" text
      );


alter table "public"."teams" enable row level security;


  create table "public"."user_subscriptions" (
    "user_id" uuid not null,
    "plan" text not null default 'free'::text,
    "status" text not null default 'inactive'::text,
    "entitlement_id" text,
    "product_id" text,
    "revenuecat_app_user_id" text,
    "expires_at" timestamp with time zone,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user_subscriptions" enable row level security;


  create table "public"."users" (
    "id" uuid not null,
    "email" text not null,
    "full_name" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "provider" text not null default 'email'::text,
    "notification_token" text
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX admin_users_pkey ON public.admin_users USING btree (user_id);

CREATE UNIQUE INDEX competitions_pkey ON public.competitions USING btree (id);

CREATE INDEX idx_league_members_league_id ON public.league_members USING btree (league_id);

CREATE INDEX idx_league_members_user_id ON public.league_members USING btree (user_id);

CREATE INDEX idx_league_members_user_league_id ON public.league_members USING btree (user_id, league_id, id);

CREATE INDEX idx_leagues_competition_id ON public.leagues USING btree (competition_id);

CREATE INDEX idx_leagues_join_code ON public.leagues USING btree (upper(join_code));

CREATE INDEX idx_leagues_owner_id ON public.leagues USING btree (owner_id);

CREATE INDEX idx_matches_away_team_id ON public.matches USING btree (away_team_id);

CREATE INDEX idx_matches_competition_fixture ON public.matches USING btree (competition_id, fixture);

CREATE INDEX idx_matches_competition_stage_group ON public.matches USING btree (competition_id, stage, "group");

CREATE INDEX idx_matches_home_team_id ON public.matches USING btree (home_team_id);

CREATE INDEX idx_matches_kick_off ON public.matches USING btree (competition_id, kick_off);

CREATE INDEX idx_matches_stage ON public.matches USING btree (competition_id, stage);

CREATE INDEX idx_matches_status ON public.matches USING btree (status);

CREATE INDEX idx_predictions_league_member ON public.predictions USING btree (league_member_id);

CREATE INDEX idx_predictions_match ON public.predictions USING btree (match_id);

CREATE INDEX idx_predictions_match_active ON public.predictions USING btree (match_id) WHERE (is_finished = false);

CREATE INDEX idx_predictions_member_created ON public.predictions USING btree (league_member_id, created_at DESC);

CREATE UNIQUE INDEX league_members_nickname_key ON public.league_members USING btree (league_id, nickname);

CREATE UNIQUE INDEX league_members_pkey ON public.league_members USING btree (id);

CREATE UNIQUE INDEX league_members_user_id_league_id_key ON public.league_members USING btree (user_id, league_id);

CREATE UNIQUE INDEX leagues_join_code_key ON public.leagues USING btree (join_code);

CREATE UNIQUE INDEX leagues_pkey ON public.leagues USING btree (id);

CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id);

CREATE UNIQUE INDEX predictions_league_member_match_key ON public.predictions USING btree (league_member_id, match_id);

CREATE UNIQUE INDEX predictions_pkey ON public.predictions USING btree (id);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX user_subscriptions_pkey ON public.user_subscriptions USING btree (user_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."admin_users" add constraint "admin_users_pkey" PRIMARY KEY using index "admin_users_pkey";

alter table "public"."competitions" add constraint "competitions_pkey" PRIMARY KEY using index "competitions_pkey";

alter table "public"."league_members" add constraint "league_members_pkey" PRIMARY KEY using index "league_members_pkey";

alter table "public"."leagues" add constraint "leagues_pkey" PRIMARY KEY using index "leagues_pkey";

alter table "public"."matches" add constraint "matches_pkey" PRIMARY KEY using index "matches_pkey";

alter table "public"."predictions" add constraint "predictions_pkey" PRIMARY KEY using index "predictions_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_pkey" PRIMARY KEY using index "user_subscriptions_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."admin_users" add constraint "admin_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."admin_users" validate constraint "admin_users_user_id_fkey";

alter table "public"."league_members" add constraint "league_members_league_id_fkey" FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE not valid;

alter table "public"."league_members" validate constraint "league_members_league_id_fkey";

alter table "public"."league_members" add constraint "league_members_nickname_key" UNIQUE using index "league_members_nickname_key";

alter table "public"."league_members" add constraint "league_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."league_members" validate constraint "league_members_user_id_fkey";

alter table "public"."league_members" add constraint "league_members_user_id_league_id_key" UNIQUE using index "league_members_user_id_league_id_key";

alter table "public"."league_members" add constraint "nickname_length" CHECK (((length(nickname) >= 1) AND (length(nickname) <= 50))) not valid;

alter table "public"."league_members" validate constraint "nickname_length";

alter table "public"."league_members" add constraint "nickname_not_empty" CHECK ((length(TRIM(BOTH FROM nickname)) > 0)) not valid;

alter table "public"."league_members" validate constraint "nickname_not_empty";

alter table "public"."leagues" add constraint "leagues_competition_id_fkey" FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE not valid;

alter table "public"."leagues" validate constraint "leagues_competition_id_fkey";

alter table "public"."leagues" add constraint "leagues_join_code_key" UNIQUE using index "leagues_join_code_key";

alter table "public"."leagues" add constraint "leagues_max_members_check" CHECK (((max_members >= 2) AND (max_members <= 12))) not valid;

alter table "public"."leagues" validate constraint "leagues_max_members_check";

alter table "public"."leagues" add constraint "leagues_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."leagues" validate constraint "leagues_owner_id_fkey";

alter table "public"."matches" add constraint "matches_away_team_id_fkey" FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON DELETE SET NULL not valid;

alter table "public"."matches" validate constraint "matches_away_team_id_fkey";

alter table "public"."matches" add constraint "matches_competition_id_fkey" FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_competition_id_fkey";

alter table "public"."matches" add constraint "matches_home_team_id_fkey" FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON DELETE SET NULL not valid;

alter table "public"."matches" validate constraint "matches_home_team_id_fkey";

alter table "public"."matches" add constraint "matches_score_shape_chk" CHECK (((score IS NULL) OR ((jsonb_typeof(score) = 'object'::text) AND (score ? 'winner'::text) AND (score ? 'duration'::text) AND (score ? 'fullTime'::text) AND (score ? 'halfTime'::text) AND (jsonb_typeof((score -> 'fullTime'::text)) = 'object'::text) AND (jsonb_typeof((score -> 'halfTime'::text)) = 'object'::text) AND ((score -> 'fullTime'::text) ? 'home'::text) AND ((score -> 'fullTime'::text) ? 'away'::text) AND ((score -> 'halfTime'::text) ? 'home'::text) AND ((score -> 'halfTime'::text) ? 'away'::text) AND (jsonb_typeof((score -> 'winner'::text)) = ANY (ARRAY['string'::text, 'null'::text])) AND (jsonb_typeof((score -> 'duration'::text)) = ANY (ARRAY['string'::text, 'null'::text])) AND (jsonb_typeof(((score -> 'fullTime'::text) -> 'home'::text)) = ANY (ARRAY['number'::text, 'null'::text])) AND (jsonb_typeof(((score -> 'fullTime'::text) -> 'away'::text)) = ANY (ARRAY['number'::text, 'null'::text])) AND (jsonb_typeof(((score -> 'halfTime'::text) -> 'home'::text)) = ANY (ARRAY['number'::text, 'null'::text])) AND (jsonb_typeof(((score -> 'halfTime'::text) -> 'away'::text)) = ANY (ARRAY['number'::text, 'null'::text]))))) not valid;

alter table "public"."matches" validate constraint "matches_score_shape_chk";

alter table "public"."predictions" add constraint "predictions_league_member_id_fkey" FOREIGN KEY (league_member_id) REFERENCES public.league_members(id) ON DELETE CASCADE not valid;

alter table "public"."predictions" validate constraint "predictions_league_member_id_fkey";

alter table "public"."predictions" add constraint "predictions_league_member_match_key" UNIQUE using index "predictions_league_member_match_key";

alter table "public"."predictions" add constraint "predictions_match_id_fkey" FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE not valid;

alter table "public"."predictions" validate constraint "predictions_match_id_fkey";

alter table "public"."predictions" add constraint "predictions_predicted_away_score_check" CHECK ((away_score >= 0)) not valid;

alter table "public"."predictions" validate constraint "predictions_predicted_away_score_check";

alter table "public"."predictions" add constraint "predictions_predicted_home_score_check" CHECK ((home_score >= 0)) not valid;

alter table "public"."predictions" validate constraint "predictions_predicted_home_score_check";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_plan_check" CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text]))) not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_plan_check";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'expired'::text, 'cancelled'::text, 'billing_issue'::text]))) not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_status_check";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_user_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_league(league_name text, max_members integer, competition_id integer, nickname text, avatar_url text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id             uuid;
  v_join_code           text;
  v_league_id           uuid;
  v_plan                text;
  v_max_leagues         int;
  v_max_members_allowed int;
  v_total_leagues       int;
  v_is_free_competition boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get user plan
  SELECT
    CASE WHEN us.plan = 'pro' AND us.status = 'active' THEN 'pro' ELSE 'free' END
  INTO v_plan
  FROM public.user_subscriptions us
  WHERE us.user_id = v_user_id;

  v_plan := COALESCE(v_plan, 'free');

  -- Get limits from get_plan_limits()
  SELECT l.max_leagues, l.max_members
  INTO v_max_leagues, v_max_members_allowed
  FROM public.get_plan_limits(v_plan) l;

  -- Check total leagues
  SELECT COUNT(*) INTO v_total_leagues
  FROM public.league_members
  WHERE user_id = v_user_id;

  IF v_total_leagues >= v_max_leagues THEN
    RAISE EXCEPTION 'Plan limit: you can be in at most % leagues', v_max_leagues;
  END IF;

  -- Check max_members against plan
  IF max_members > v_max_members_allowed THEN
    RAISE EXCEPTION 'Plan limit: max % members per league', v_max_members_allowed;
  END IF;

  -- Check competition allowed for plan
  SELECT c.is_free INTO v_is_free_competition
  FROM public.competitions c
  WHERE c.id = competition_id;

  IF v_is_free_competition IS NULL THEN
    RAISE EXCEPTION 'Competition not found';
  END IF;

  IF v_plan = 'free' AND NOT v_is_free_competition THEN
    RAISE EXCEPTION 'This competition requires a PRO subscription';
  END IF;

  -- Generate unique join_code
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
$function$
;

CREATE OR REPLACE FUNCTION public.delete_owned_league(p_league_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.find_league_by_code(p_join_code text)
 RETURNS TABLE(league_id uuid, league_name text, competition_name text, competition_logo text, competition_area text, competition_flag text, members_count integer, max_members integer, owner_nickname text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_plan_limits(p_plan text)
 RETURNS TABLE(max_leagues integer, max_members integer)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  IF p_plan = 'pro' THEN
    RETURN QUERY SELECT 5, 12;
  ELSE
    RETURN QUERY SELECT 2, 6;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    provider
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_app_meta_data->>'provider',
      'email'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_subscriptions (
    user_id,
    plan,
    status
  )
  VALUES (
    NEW.id,
    'free',
    'inactive'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = (SELECT auth.uid())
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_league_member(league_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.league_members
    WHERE user_id = (SELECT auth.uid()) AND league_id = league_id_param
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_league_owner(league_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leagues
    WHERE id = league_id_param AND owner_id = (SELECT auth.uid())
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_member_in_league(_league uuid, _user uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.league_members lm
    WHERE lm.league_id = _league AND lm.user_id = _user
  );
$function$
;

CREATE OR REPLACE FUNCTION public.join_league(league_join_code text, user_nickname text, user_avatar_url text DEFAULT NULL::text)
 RETURNS public.league_members
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id             uuid;
  v_league_id           uuid;
  v_league_record       public.leagues;
  v_member_count        int;
  v_member_record       public.league_members;
  v_total_leagues       int;
  v_plan                text;
  v_max_leagues         int;
  v_max_members_allowed int;
  v_is_free_competition boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get user plan (must be active to count as pro)
  SELECT
    CASE WHEN us.plan = 'pro' AND us.status = 'active' THEN 'pro' ELSE 'free' END
  INTO v_plan
  FROM public.user_subscriptions us
  WHERE us.user_id = v_user_id;

  v_plan := COALESCE(v_plan, 'free');

  -- Get limits from get_plan_limits()
  SELECT l.max_leagues, l.max_members
  INTO v_max_leagues, v_max_members_allowed
  FROM public.get_plan_limits(v_plan) l;

  -- Check total leagues limit
  SELECT COUNT(*) INTO v_total_leagues
  FROM public.league_members
  WHERE user_id = v_user_id;

  IF v_total_leagues >= v_max_leagues THEN
    RAISE EXCEPTION 'Plan limit: you can be in at most % leagues', v_max_leagues;
  END IF;

  -- Find league by join code
  SELECT l.* INTO v_league_record
  FROM public.leagues l
  WHERE l.join_code = upper(league_join_code);

  IF v_league_record.id IS NULL THEN
    RAISE EXCEPTION 'League not found';
  END IF;

  v_league_id := v_league_record.id;

  -- Check competition allowed for plan
  SELECT c.is_free INTO v_is_free_competition
  FROM public.competitions c
  WHERE c.id = v_league_record.competition_id;

  IF v_plan = 'free' AND NOT v_is_free_competition THEN
    RAISE EXCEPTION 'This competition requires a PRO subscription';
  END IF;

  -- Check already a member
  IF EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = v_league_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this league';
  END IF;

  -- Check league is full
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
$function$
;

create or replace view "public"."league_leaderboard_view" as  SELECT lm.id AS member_id,
    lm.league_id,
    lm.user_id,
    lm.nickname,
    lm.avatar_url,
    (COALESCE(sum(p.points), (0)::bigint))::integer AS total_points
   FROM (public.league_members lm
     LEFT JOIN public.predictions p ON ((p.league_member_id = lm.id)))
  GROUP BY lm.id, lm.league_id, lm.user_id, lm.nickname, lm.avatar_url
  ORDER BY ((COALESCE(sum(p.points), (0)::bigint))::integer) DESC;


CREATE OR REPLACE FUNCTION public.leave_league(p_league_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.rls_is_member_self(_member uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.league_members lm
    WHERE lm.id = _member
      AND lm.user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.rls_is_user_in_league(_league uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.league_members lm
    WHERE lm.league_id = _league
      AND lm.user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.set_primary_league(p_league_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end$function$
;

CREATE OR REPLACE FUNCTION public.sync_user_full_name()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.users
  SET full_name = NEW.raw_user_meta_data->>'full_name'
  WHERE id = NEW.id
    AND (NEW.raw_user_meta_data->>'full_name') IS NOT NULL
    AND (NEW.raw_user_meta_data->>'full_name') <> '';
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_calc_prediction_points_on_match_finish()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.user_exists(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  select exists (
    select 1
    from auth.users
    where id = uid
  );
$function$
;

grant delete on table "public"."admin_users" to "anon";

grant insert on table "public"."admin_users" to "anon";

grant references on table "public"."admin_users" to "anon";

grant select on table "public"."admin_users" to "anon";

grant trigger on table "public"."admin_users" to "anon";

grant truncate on table "public"."admin_users" to "anon";

grant update on table "public"."admin_users" to "anon";

grant delete on table "public"."admin_users" to "authenticated";

grant insert on table "public"."admin_users" to "authenticated";

grant references on table "public"."admin_users" to "authenticated";

grant select on table "public"."admin_users" to "authenticated";

grant trigger on table "public"."admin_users" to "authenticated";

grant truncate on table "public"."admin_users" to "authenticated";

grant update on table "public"."admin_users" to "authenticated";

grant delete on table "public"."admin_users" to "service_role";

grant insert on table "public"."admin_users" to "service_role";

grant references on table "public"."admin_users" to "service_role";

grant select on table "public"."admin_users" to "service_role";

grant trigger on table "public"."admin_users" to "service_role";

grant truncate on table "public"."admin_users" to "service_role";

grant update on table "public"."admin_users" to "service_role";

grant delete on table "public"."competitions" to "anon";

grant insert on table "public"."competitions" to "anon";

grant references on table "public"."competitions" to "anon";

grant select on table "public"."competitions" to "anon";

grant trigger on table "public"."competitions" to "anon";

grant truncate on table "public"."competitions" to "anon";

grant update on table "public"."competitions" to "anon";

grant delete on table "public"."competitions" to "authenticated";

grant insert on table "public"."competitions" to "authenticated";

grant references on table "public"."competitions" to "authenticated";

grant select on table "public"."competitions" to "authenticated";

grant trigger on table "public"."competitions" to "authenticated";

grant truncate on table "public"."competitions" to "authenticated";

grant update on table "public"."competitions" to "authenticated";

grant delete on table "public"."competitions" to "service_role";

grant insert on table "public"."competitions" to "service_role";

grant references on table "public"."competitions" to "service_role";

grant select on table "public"."competitions" to "service_role";

grant trigger on table "public"."competitions" to "service_role";

grant truncate on table "public"."competitions" to "service_role";

grant update on table "public"."competitions" to "service_role";

grant delete on table "public"."league_members" to "anon";

grant insert on table "public"."league_members" to "anon";

grant references on table "public"."league_members" to "anon";

grant select on table "public"."league_members" to "anon";

grant trigger on table "public"."league_members" to "anon";

grant truncate on table "public"."league_members" to "anon";

grant update on table "public"."league_members" to "anon";

grant delete on table "public"."league_members" to "authenticated";

grant insert on table "public"."league_members" to "authenticated";

grant references on table "public"."league_members" to "authenticated";

grant select on table "public"."league_members" to "authenticated";

grant trigger on table "public"."league_members" to "authenticated";

grant truncate on table "public"."league_members" to "authenticated";

grant update on table "public"."league_members" to "authenticated";

grant delete on table "public"."league_members" to "service_role";

grant insert on table "public"."league_members" to "service_role";

grant references on table "public"."league_members" to "service_role";

grant select on table "public"."league_members" to "service_role";

grant trigger on table "public"."league_members" to "service_role";

grant truncate on table "public"."league_members" to "service_role";

grant update on table "public"."league_members" to "service_role";

grant delete on table "public"."leagues" to "anon";

grant insert on table "public"."leagues" to "anon";

grant references on table "public"."leagues" to "anon";

grant select on table "public"."leagues" to "anon";

grant trigger on table "public"."leagues" to "anon";

grant truncate on table "public"."leagues" to "anon";

grant update on table "public"."leagues" to "anon";

grant delete on table "public"."leagues" to "authenticated";

grant insert on table "public"."leagues" to "authenticated";

grant references on table "public"."leagues" to "authenticated";

grant select on table "public"."leagues" to "authenticated";

grant trigger on table "public"."leagues" to "authenticated";

grant truncate on table "public"."leagues" to "authenticated";

grant update on table "public"."leagues" to "authenticated";

grant delete on table "public"."leagues" to "service_role";

grant insert on table "public"."leagues" to "service_role";

grant references on table "public"."leagues" to "service_role";

grant select on table "public"."leagues" to "service_role";

grant trigger on table "public"."leagues" to "service_role";

grant truncate on table "public"."leagues" to "service_role";

grant update on table "public"."leagues" to "service_role";

grant delete on table "public"."matches" to "anon";

grant insert on table "public"."matches" to "anon";

grant references on table "public"."matches" to "anon";

grant select on table "public"."matches" to "anon";

grant trigger on table "public"."matches" to "anon";

grant truncate on table "public"."matches" to "anon";

grant update on table "public"."matches" to "anon";

grant delete on table "public"."matches" to "authenticated";

grant insert on table "public"."matches" to "authenticated";

grant references on table "public"."matches" to "authenticated";

grant select on table "public"."matches" to "authenticated";

grant trigger on table "public"."matches" to "authenticated";

grant truncate on table "public"."matches" to "authenticated";

grant update on table "public"."matches" to "authenticated";

grant delete on table "public"."matches" to "service_role";

grant insert on table "public"."matches" to "service_role";

grant references on table "public"."matches" to "service_role";

grant select on table "public"."matches" to "service_role";

grant trigger on table "public"."matches" to "service_role";

grant truncate on table "public"."matches" to "service_role";

grant update on table "public"."matches" to "service_role";

grant delete on table "public"."predictions" to "anon";

grant insert on table "public"."predictions" to "anon";

grant references on table "public"."predictions" to "anon";

grant select on table "public"."predictions" to "anon";

grant trigger on table "public"."predictions" to "anon";

grant truncate on table "public"."predictions" to "anon";

grant update on table "public"."predictions" to "anon";

grant delete on table "public"."predictions" to "authenticated";

grant insert on table "public"."predictions" to "authenticated";

grant references on table "public"."predictions" to "authenticated";

grant select on table "public"."predictions" to "authenticated";

grant trigger on table "public"."predictions" to "authenticated";

grant truncate on table "public"."predictions" to "authenticated";

grant update on table "public"."predictions" to "authenticated";

grant delete on table "public"."predictions" to "service_role";

grant insert on table "public"."predictions" to "service_role";

grant references on table "public"."predictions" to "service_role";

grant select on table "public"."predictions" to "service_role";

grant trigger on table "public"."predictions" to "service_role";

grant truncate on table "public"."predictions" to "service_role";

grant update on table "public"."predictions" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";

grant delete on table "public"."user_subscriptions" to "anon";

grant insert on table "public"."user_subscriptions" to "anon";

grant references on table "public"."user_subscriptions" to "anon";

grant select on table "public"."user_subscriptions" to "anon";

grant trigger on table "public"."user_subscriptions" to "anon";

grant truncate on table "public"."user_subscriptions" to "anon";

grant update on table "public"."user_subscriptions" to "anon";

grant delete on table "public"."user_subscriptions" to "authenticated";

grant insert on table "public"."user_subscriptions" to "authenticated";

grant references on table "public"."user_subscriptions" to "authenticated";

grant select on table "public"."user_subscriptions" to "authenticated";

grant trigger on table "public"."user_subscriptions" to "authenticated";

grant truncate on table "public"."user_subscriptions" to "authenticated";

grant update on table "public"."user_subscriptions" to "authenticated";

grant delete on table "public"."user_subscriptions" to "service_role";

grant insert on table "public"."user_subscriptions" to "service_role";

grant references on table "public"."user_subscriptions" to "service_role";

grant select on table "public"."user_subscriptions" to "service_role";

grant trigger on table "public"."user_subscriptions" to "service_role";

grant truncate on table "public"."user_subscriptions" to "service_role";

grant update on table "public"."user_subscriptions" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "admin_users: delete"
  on "public"."admin_users"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "admin_users: insert"
  on "public"."admin_users"
  as permissive
  for insert
  to authenticated
with check (public.is_admin());



  create policy "admin_users: read"
  on "public"."admin_users"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "admin_users: update"
  on "public"."admin_users"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Delete: Admin"
  on "public"."competitions"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "Insert: Admin"
  on "public"."competitions"
  as permissive
  for insert
  to authenticated
with check (public.is_admin());



  create policy "Read: All"
  on "public"."competitions"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Update: Admin"
  on "public"."competitions"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy " Read - Admin , all league_memberss"
  on "public"."league_members"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR public.is_league_member(league_id) OR (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Delete - Admin, Member, League owner"
  on "public"."league_members"
  as permissive
  for delete
  to authenticated
using ((public.is_admin() OR public.is_league_owner(league_id) OR (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Insert -  Admin, Member"
  on "public"."league_members"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() OR (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Update - Admin, Member"
  on "public"."league_members"
  as permissive
  for update
  to authenticated
using ((public.is_admin() OR (user_id = ( SELECT auth.uid() AS uid))))
with check ((public.is_admin() OR (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Users: Delete leagues"
  on "public"."leagues"
  as permissive
  for delete
  to authenticated
using ((public.is_admin() OR (owner_id = ( SELECT auth.uid() AS uid))));



  create policy "Users: Insert leagues"
  on "public"."leagues"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() OR (owner_id = ( SELECT auth.uid() AS uid))));



  create policy "Users: Read leagues"
  on "public"."leagues"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Users: Update leagues"
  on "public"."leagues"
  as permissive
  for update
  to authenticated
using ((public.is_admin() OR (owner_id = ( SELECT auth.uid() AS uid))))
with check ((public.is_admin() OR (owner_id = ( SELECT auth.uid() AS uid))));



  create policy "Users: Delete matches"
  on "public"."matches"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "Users: Insert matches"
  on "public"."matches"
  as permissive
  for insert
  to authenticated
with check (public.is_admin());



  create policy "Users: Read matches"
  on "public"."matches"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Users: Update matches"
  on "public"."matches"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Users: Delete predictions"
  on "public"."predictions"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.league_members lm
  WHERE ((lm.id = predictions.league_member_id) AND (lm.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Users: Insert predictions"
  on "public"."predictions"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.league_members lm
  WHERE ((lm.id = predictions.league_member_id) AND (lm.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Users: Read predictions"
  on "public"."predictions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.league_members lm_self
     JOIN public.league_members lm_pred ON ((lm_self.league_id = lm_pred.league_id)))
  WHERE ((lm_self.user_id = ( SELECT auth.uid() AS uid)) AND (lm_pred.id = predictions.league_member_id)))));



  create policy "Users: Update predictions"
  on "public"."predictions"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.league_members lm
  WHERE ((lm.id = predictions.league_member_id) AND (lm.user_id = ( SELECT auth.uid() AS uid))))))
with check ((EXISTS ( SELECT 1
   FROM public.league_members lm
  WHERE ((lm.id = predictions.league_member_id) AND (lm.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Users: Delete teams"
  on "public"."teams"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "Users: Insert teams"
  on "public"."teams"
  as permissive
  for insert
  to authenticated
with check (public.is_admin());



  create policy "Users: Read teams"
  on "public"."teams"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR true));



  create policy "Users: Update teams"
  on "public"."teams"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Admins: Read all user subscriptions"
  on "public"."user_subscriptions"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "Users can read own subscription"
  on "public"."user_subscriptions"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users: Delete users"
  on "public"."users"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "Users: Insert users"
  on "public"."users"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() OR (id = ( SELECT auth.uid() AS uid))));



  create policy "Users: Read users"
  on "public"."users"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (id = ( SELECT auth.uid() AS uid))));



  create policy "Users: Update users"
  on "public"."users"
  as permissive
  for update
  to authenticated
using ((public.is_admin() OR (id = ( SELECT auth.uid() AS uid))))
with check ((public.is_admin() OR (id = ( SELECT auth.uid() AS uid))));


CREATE TRIGGER trg_match_finish_points AFTER INSERT OR UPDATE OF status, score ON public.matches FOR EACH ROW EXECUTE FUNCTION public.tg_calc_prediction_points_on_match_finish();

CREATE TRIGGER insert_user_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_name_updated AFTER UPDATE ON auth.users FOR EACH ROW WHEN (((old.raw_user_meta_data ->> 'full_name'::text) IS DISTINCT FROM (new.raw_user_meta_data ->> 'full_name'::text))) EXECUTE FUNCTION public.sync_user_full_name();


  create policy "Members manage their own profile images"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using (((bucket_id = 'profile_images'::text) AND (public.is_admin() OR public.rls_is_member_self((split_part(split_part(name, '.'::text, 1), '_'::text, 1))::uuid))))
with check (((bucket_id = 'profile_images'::text) AND (public.is_admin() OR public.rls_is_member_self((split_part(split_part(name, '.'::text, 1), '_'::text, 1))::uuid))));



  create policy "Public read profile images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profile_images'::text));



