-- Rename the mis-named competition progress columns to reflect what they
-- actually hold: MATCHDAYS, not individual fixtures.
--
--   current_fixture  -> current_matchday
--   total_fixtures   -> total_matchdays
--
-- This is done as a SAFE, STAGED (expand/contract) migration rather than a hard
-- `ALTER ... RENAME COLUMN`, because the deployed mobile app (versions already
-- installed on user devices) still SELECTs and relies on the legacy column
-- names. A hard rename would break every older build until every user updates.
--
-- Stage 1 (this migration):
--   * add the new columns
--   * backfill them from the legacy columns
--   * keep both names in sync via a BEFORE INSERT/UPDATE trigger, so old app
--     builds (reading/writing legacy names) and new writers (using the new
--     names) stay consistent in both directions
--
-- Stage 2 (a LATER migration, only once no old app build reads the legacy
-- columns): drop the trigger + function and the legacy columns. See the
-- commented template at the bottom of this file.

-- 1. New columns ------------------------------------------------------------
alter table "public"."competitions"
  add column if not exists "current_matchday" integer,
  add column if not exists "total_matchdays" integer;

alter table "public"."competitions"
  alter column "total_matchdays" set default 0;

-- 2. Backfill from the legacy columns --------------------------------------
update "public"."competitions"
set
  "current_matchday" = "current_fixture",
  "total_matchdays" = coalesce("total_fixtures", 0)
where
  "current_matchday" is null
  and "total_matchdays" is null;

-- 3. Bidirectional keep-in-sync trigger ------------------------------------
-- New-name columns are treated as canonical. Whichever side a writer actually
-- changed is propagated to the other, so:
--   * an old app build writing current_fixture updates current_matchday
--   * a new function writing current_matchday updates current_fixture
create or replace function "public"."sync_competition_matchday_columns"()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    -- Mirror whichever pair was supplied on insert.
    if new."current_matchday" is null and new."current_fixture" is not null then
      new."current_matchday" := new."current_fixture";
    elsif new."current_fixture" is null and new."current_matchday" is not null then
      new."current_fixture" := new."current_matchday";
    end if;

    if new."total_matchdays" is null and new."total_fixtures" is not null then
      new."total_matchdays" := new."total_fixtures";
    elsif new."total_fixtures" is null and new."total_matchdays" is not null then
      new."total_fixtures" := new."total_matchdays";
    end if;

    return new;
  end if;

  -- UPDATE: prefer the new-name column when it changed, else mirror the legacy
  -- column that changed. `is distinct from` is null-safe.
  if new."current_matchday" is distinct from old."current_matchday" then
    new."current_fixture" := new."current_matchday";
  elsif new."current_fixture" is distinct from old."current_fixture" then
    new."current_matchday" := new."current_fixture";
  end if;

  if new."total_matchdays" is distinct from old."total_matchdays" then
    new."total_fixtures" := new."total_matchdays";
  elsif new."total_fixtures" is distinct from old."total_fixtures" then
    new."total_matchdays" := new."total_fixtures";
  end if;

  return new;
end;
$$;

drop trigger if exists "competitions_sync_matchday_columns" on "public"."competitions";

create trigger "competitions_sync_matchday_columns"
  before insert or update on "public"."competitions"
  for each row
  execute function "public"."sync_competition_matchday_columns"();

-- ---------------------------------------------------------------------------
-- Stage 2 (run in a FUTURE migration once no deployed app reads the legacy
-- columns). Kept here only as documentation — do NOT run it now:
--
--   drop trigger if exists "competitions_sync_matchday_columns" on "public"."competitions";
--   drop function if exists "public"."sync_competition_matchday_columns"();
--   alter table "public"."competitions" drop column if exists "current_fixture";
--   alter table "public"."competitions" drop column if exists "total_fixtures";
-- ---------------------------------------------------------------------------
