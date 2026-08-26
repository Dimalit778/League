# Seasons table normalization — design

**Date:** 2026-08-25
**Scope:** Data-model item #1. Normalization only — no product behavior change,
no season-scoped leaderboards, `pro_seasons` untouched.
**Type:** Staged (expand/contract) schema migration, stage 1 only.

## Problem

The football season is not a first-class entity. Season-specific fields live
denormalized on `competitions`:

- `season_id` (football-data `season.id`, e.g. PL 2026/27 = 2502, La Liga = 2429)
- `current_matchday`, `current_stage`, `total_matchdays`
- `season_start`, `season_end`

`matches.season_id` is a loose integer (indexed via `idx_matches_competition_season`)
with no FK. When a competition rolls to a new season, the `competitions` row is
mutated in place and the prior season's progress/dates are lost. There is no
clean per-(competition, season) record.

## Goal

Introduce a real `seasons` table as a normalized record of each
(competition, football season), maintained from the existing canonical source
(`competitions`) with zero changes to the app or edge functions in this stage.

## Non-goals (explicitly out of scope)

- No season-scoped predictions or leaderboards; `league_member_standings`
  (added in `20260825120000`) stays league/member-scoped.
- No changes to `pro_seasons` (that is the billing/entitlement calendar — a
  different axis from the football season).
- No app changes, no edge-function changes.
- No dropping of any `competitions` column (that is stage 2, documented only).

## Design

### Table

```
seasons (
  id               integer PRIMARY KEY,          -- = football-data season.id
  competition_id   integer NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  current_matchday integer,
  current_stage    text,
  total_matchdays  integer,
  season_start     date,
  season_end       date,
  is_current       boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
)
```

**Key decisions (approved):**
- **PK = football-data `season.id`** (not a surrogate). `matches.season_id`
  already holds this value, so the FK needs no data remap.
- **One-directional sync in stage 1**: `competitions` stays canonical; `seasons`
  is a normalized read-model kept current by a trigger. Nobody writes `seasons`
  directly, so there is no trigger recursion.

Indexes: PK on `id`; `(competition_id)` for per-competition lookups; a partial
unique index enforcing at most one `is_current` season per competition
(`unique (competition_id) where is_current`).

### Sync trigger (competitions → seasons)

`AFTER INSERT OR UPDATE ON competitions` (SECURITY DEFINER): when
`competitions.season_id` is not null, upsert the `seasons` row for that id with
the competition's progress fields and mark it `is_current = true` (clearing the
flag on that competition's other seasons). No back-propagation seasons →
competitions in stage 1.

### FK protection (matches → seasons)

`BEFORE INSERT OR UPDATE ON matches`: if `new.season_id` is not null and no
`seasons` row exists, insert a stub row `(id = new.season_id,
competition_id = new.competition_id)`. This decouples the match-sync job from the
competition-progress job so a match for a new season cannot fail the FK if it
syncs first. Then add FK `matches.season_id → seasons.id` (NULL allowed).

### Backfill

Insert one `seasons` row per `DISTINCT (competition_id, season_id)` drawn from
**both** `competitions` (carry progress fields, set `is_current`) and `matches`
(covers historical/other season ids so the FK never dangles). `season_id IS NULL`
rows are skipped; those matches keep `season_id = NULL`.

### RLS & grants

`seasons` is public read reference data (like `competitions`): enable RLS,
`SELECT` policy `using (true)` for `authenticated`; grant `SELECT` to
`authenticated, service_role`. Writes only via the SECURITY DEFINER triggers.

## Stage 2 (documented in-migration, NOT executed now)

Once no deployed app build reads the legacy columns: move edge functions and the
app to read/write `seasons`, flip canonical direction, then drop
`competitions.{season_id, current_matchday, current_stage, total_matchdays,
season_start, season_end}` and the competitions→seasons trigger.

## Verification (local, per the #2 precedent)

`supabase db reset` is currently blocked by an unrelated migration
(`20260822185228`, see memory), so validate by applying the new migration to the
running local DB and running a functional test in a rolled-back transaction:

1. Seed a competition with `season_id` → assert a `seasons` row appears via the
   trigger, `is_current = true`.
2. Update `competitions.current_matchday`/`current_stage` → assert the `seasons`
   row reflects it.
3. Insert a `matches` row with a brand-new `season_id` (no competition update
   first) → assert the stub `seasons` row is created and the insert succeeds.
4. Assert the FK rejects a `matches.season_id` that cannot be stubbed only if
   `competition_id` is invalid (sanity).
5. Confirm existing app read paths (`competitionApi`, `leagueApi`) are unaffected
   — columns unchanged.

## Risks

- **Trigger overhead on match sync**: the BEFORE trigger does one indexed PK
  existence check per match row. Bounded; acceptable for nightly bulk sync.
- **Ordering of stage-1 migration vs `20260822185228` blocker**: independent;
  this migration does not touch cron.
