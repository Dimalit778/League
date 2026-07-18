# Matches Display Architecture — Design Spec
**Date:** 2026-07-18
**Status:** Approved

## תקציר (Hebrew summary)

הצגת המשחקים תבנה מ־**3 מנועי רינדור לשימוש חוזר** (`FixtureListEngine`, `GroupsEngine`, `KnockoutEngine`) שכל סוג תחרות רק *מרכיב* בצורה שונה, במקום 3 תיקיות משוכפלות. **query אחד לכל העונה** (`useSeasonMatches`) מזין את כל התצוגות, וכל השאר נגזר בצד הלקוח עם selectors ממואיזים. סוג התצוגה נקבע ע"י **מסווג טהור** (`resolveCompetitionShape`) מתוך הנתונים — בלי שדה sub-type ב־DB ובלי query ייעודי. עמתי נוקאאוט דו-שלביים (גומלין) מזווגים בצד הלקוח ומוצגים ככרטיס עמת עם תוצאה מצרפית (aggregate).

---

## Overview

The Matches feature must render three competition kinds that today live in two half-finished, partly-broken folders (`regularLeague/`, `tournament/`). The stored data distinguishes only `competitions.type` (`LEAGUE` | `CUP`); Champions League vs World Cup is **not** stored and must be inferred from the stage vocabulary present in the fetched matches.

This design replaces the duplicated view folders with **three reusable rendering engines** composed per competition, fed by **a single season-wide query** with all slicing done client-side. It is the smallest structure that removes duplication while supporting all current and foreseeable competition shapes.

---

## 1. Data model (as-is — no schema change)

From `src/types/database.types.ts` and the sync edge functions:

| Table | Relevant columns |
|---|---|
| `competitions` | `type` (`LEAGUE`\|`CUP`), `current_stage`, `current_fixture`, `total_fixtures`, `season_id` |
| `matches` | `fixture` (matchday int), `stage` (string), `group` (string), `home_team_id`, `away_team_id`, `kick_off`, `status`, `score` (Json), `ai_*` |
| `predictions` | `match_id`, `league_member_id`, `home_score`, `away_score`, `points`, `is_finished` |

Facts that drive the design:
- **CL vs WC is inferred, not stored.** CL first phase → `stage ∈ {LEAGUE_STAGE, REGULAR_SEASON}` + a `fixture`. WC first phase → `stage = GROUP_STAGE` + a `group` letter. Both share knockout stages (`LAST_16`…`FINAL`).
- **Two-legged ties have no modeling.** football-data.org gives no `leg`/`tie_id`; home & away legs are two separate `matches` rows with the same `stage` and swapped teams. Pairing is a client-side concern.
- `score` is JSON: `{ winner, duration, fullTime:{home,away}, halfTime:{home,away} }`.

**No migration is required.** (An explicit `sub_type` column was considered and rejected — see §9.)

---

## 2. Competition shape classifier

A single pure function is the source of truth for "which view":

```ts
// model/competitionShape.ts
export type CompetitionShape =
  | 'REGULAR'         // type = LEAGUE
  | 'LEAGUEPHASE_KO'  // CUP + any LEAGUE_STAGE/REGULAR_SEASON match  → Champions League
  | 'GROUPS_KO'       // CUP + any GROUP_STAGE match                  → World Cup
  | 'KNOCKOUT_ONLY';  // CUP + only knockout stages                   → pure cup (free fallback)

export function resolveCompetitionShape(
  type: string | null,
  matches: Pick<MatchBaseType, 'stage'>[],
): CompetitionShape;
```

Rules (first match wins):
1. `type` is `LEAGUE` (case-insensitive) → `REGULAR`.
2. any match `isGroupPhaseStage(stage)` → `GROUPS_KO`.
3. any match `isDomesticLeagueStage(stage)` → `LEAGUEPHASE_KO`.
4. otherwise → `KNOCKOUT_ONLY`.

**Why classify from `matches` and not `current_stage`:** if the competition is currently at `FINAL`, `current_stage` reveals nothing about whether the first phase was groups or a league. The full match list is authoritative, and the single season query (§3) already has it in memory — classification costs zero extra queries and is fully unit-testable.

`MatchesScreen` becomes a 4-way switch that picks a `View`.

---

## 3. Data layer — one query, client-side slicing

**One API function** serves every view:

```ts
// api/matchesApi.ts
matchesApi.getSeasonMatches(competitionId, memberId): Promise<MatchCardType[]>
```

This is the existing `getCompetitionMatchesWithMemberPredictions` (one `.select()` embedding home/away team + the member's single prediction via `.eq('predictions.league_member_id', memberId)`, ordered by `kick_off`), renamed for clarity.

**One hook:** `useSeasonMatches({ competitionId, memberId, enabled })` — `staleTime` 5 min, `placeholderData: keepPrevious`, prefetches team logos. Everything else is derived client-side via memoized selectors:

```
useSeasonMatches ──┬─ selectByFixture(matches, n)   → FixtureListEngine
                   ├─ selectGroups(matches)         → GroupsEngine (+ computeStandings)
                   └─ selectKnockoutTies(matches)   → KnockoutEngine
```

**Efficiency:** a full season is at most a few hundred rows (CL league phase ≈ 144 matches, WC ≈ 104). One fetch; tab switches cost **zero** network. Standings and tie-pairing are `useMemo`-cheap.

Retained specialized queries (unchanged, used outside the Matches tab — e.g. Home/overview): `getMatchWithPredictions` (detail, all members' predictions), `getNearestUpcomingMatch`, `getTodayMatches`, `getFinishedFixtures`, `getMemberFinishedMatches`.

---

## 4. The three engines (dumb, props-only)

Each engine is presentational: it receives already-sliced data and renders. No data fetching, no competition awareness.

- **`FixtureListEngine`** — horizontal fixtures selector + list of match cards for the selected fixture. Reuses today's `FixturesList` + `MatchesList`. Props: `{ fixtures, selectedFixture, currentFixture, matches, onSelectFixture, onRefresh }`.
- **`GroupsEngine`** — per-group standings table (`computeLeagueStandings`) + that group's matches. Props: `{ groups, standingsByGroup, matchesByGroup, selectedGroup, onSelectGroup, onRefresh }`.
- **`KnockoutEngine`** — bracket of `Tie[]` (see §5). Reuses today's `KnockoutMatches`/`BracketConnector` but keyed on **ties**, not naive 2-by-2 `chunkMatches` (which is replaced). Props: `{ ties, stages, selectedStage, onSelectStage, onRefresh }`.

---

## 5. Two-legged tie pairing (client-side, aggregate display)

Since there is no `leg`/`tie_id`, knockout matches are grouped by an unordered team pair within a stage:

> **Group knockout matches by `(stage, unorderedTeamPair {A,B})`.**
> Each group is a **tie** with 1 or 2 legs.

```ts
// model/knockout.ts
export type Tie = {
  key: string;               // `${stage}:${minTeamId}-${maxTeamId}`
  stage: string;
  legs: MatchCardType[];     // 1..2, ordered by kick_off (leg1 = earlier)
  aggregate: { home: number; away: number } | null; // null when only 1 leg
  advancingTeamId: number | null;
};
```

This one algorithm covers both competitions uniformly:
- **WC knockout** → always one leg per pair → `aggregate = null` → renders as a single card.
- **CL knockout** → two legs → aggregate = sum of each team's goals across both legs.
- **CL final** → single match → naturally one leg. No special-casing.

**Correctness notes (kept minimal, refined during implementation):**
- Away-goals rule was abolished by UEFA in 2021 — do **not** apply it. Higher aggregate advances.
- `advancingTeamId` (2-leg tie, both legs `FINISHED`): the team with the strictly higher aggregate. If the aggregate is level, resolve **only** when the second leg was decided by a shootout (`score.duration = 'PENALTY_SHOOTOUT'` with a non-null `score.winner`, mapped to a team id via that leg's home/away); a level aggregate with no shootout signal → `null`. Note: a leg's `score.winner` reflects that single match, **not** the tie, so it must never be used directly as the tie advancer. For a 1-leg tie, use that match's `score.winner`. Any unfinished tie → `null` (UI shows no advancer).
- Orientation for aggregate: each leg swaps home/away, so aggregate is computed **per team id**, then presented from leg1's home-team perspective.

Selector: `selectKnockoutTies(matches)` filters `isKnockoutStage`, groups, orders legs, computes aggregate. Fully unit-tested against fixtures for WC (single-leg), CL (two-leg), and CL final (single-leg).

---

## 6. Composition layer (thin per-competition views)

Each view is ~20–40 lines: resolve slices, wire tabs, delegate to engines.

```
RegularLeagueView       = FixtureListEngine(all matches)
LeaguePhaseKnockoutView = Tabs[ FixtureListEngine(leaguePhase) | KnockoutEngine(ties) ]   // CL
GroupsKnockoutView      = Tabs[ GroupsEngine(groups)          | KnockoutEngine(ties) ]     // WC
KnockoutOnlyView        = KnockoutEngine(ties)                                             // pure cup
```

The default tab is chosen from `competition.current_stage`: a knockout `current_stage` opens the Knockout tab, otherwise the first-phase tab.

---

## 7. Folder structure (target)

```
src/features/matches/
  api/matchesApi.ts          # getSeasonMatches · getMatchWithPredictions · today · nearest · finished
  hooks/
    useSeasonMatches.ts       # the single query feeding all views
    useMatchDetail.ts
    useMatchLists.ts          # nearest / today / finished (split out of the current mega useMatches.ts)
  model/                      # pure, no React
    competitionShape.ts       # resolveCompetitionShape()
    stages.ts                 # (relocated footballStages.ts)
    standings.ts              # computeLeagueStandings()
    knockout.ts               # pairKnockoutTies() + aggregate
    selectors.ts              # selectByFixture / selectGroups / selectKnockoutTies (memoizable)
  engines/
    FixtureListEngine/  GroupsEngine/  KnockoutEngine/
  views/
    RegularLeagueView.tsx  ·  LeaguePhaseKnockoutView.tsx  ·  GroupsKnockoutView.tsx  ·  KnockoutOnlyView.tsx
  screens/
    MatchesScreen.tsx         # resolveCompetitionShape → pick a View
    MatchDetailScreen.tsx
  components/                 # MatchCard, skeletons, match-details (shared)
  types/
```

**Deleted / absorbed:** `regularLeague/`, `tournament/`, the empty `tournament/api/tournamentService.ts`, the neutralized `tournament/index.tsx`, and the naive `chunkMatches` pairing. Query keys in `src/lib/queryClient.ts` are consolidated under `KEYS.matches.season(competitionId, memberId)` plus the retained detail/nearest/today/finished keys.

---

## 8. Security

- **Client filters are convenience, not protection.** `.eq('predictions.league_member_id', memberId)` must be backed by RLS: `matches` publicly readable; `predictions` restricted so a member reads only predictions within their own league. Verify the existing `20260706120100_restrict_league_read` migration covers this; add coverage if not.
- **Points are server-computed** (edge functions); the client never writes `predictions.points`. Preserve this.
- Match-detail query already scopes predictions by `league_id` — preserve.

---

## 9. Decisions made & rejected alternatives

- **Three folders each with its own api/hook (rejected):** duplicates `FixtureListEngine` (regular ↔ CL) and `KnockoutEngine` (CL ↔ WC); higher maintenance, no benefit.
- **Explicit `competitions.sub_type` column (rejected):** the stage vocabulary already determines shape deterministically; a stored sub-type is one more field to keep in sync and can drift. Revisit only if a future competition can't be distinguished by stages.
- **Per-view / per-stage fetching (rejected):** more requests and round-trips, and it blocks client-side standings and tie-pairing that need the whole season in memory. A season is small enough for one fetch.
- **Aggregate two-leg display (chosen):** correct UX for CL gomlin; the single grouping algorithm also handles WC single-leg and the CL single-leg final with no branching.

---

## 10. Testing

- `resolveCompetitionShape` — unit tests for `LEAGUE`, CL (LEAGUE_STAGE present), WC (GROUP_STAGE present), knockout-only.
- `pairKnockoutTies` / `selectKnockoutTies` — WC single-leg, CL two-leg (aggregate + leg order), CL single-leg final, unfinished tie (`advancingTeamId = null`), level-aggregate resolved by second leg.
- `computeLeagueStandings` — existing tests retained.
- Selectors — `selectByFixture`, `selectGroups` grouping/ordering.
- Screen: `MatchesScreen` renders the correct View per shape (extend existing `MatchesTabDisplay.test.tsx`).

---

## 11. Out of scope

- No schema/migration changes.
- No change to the sync edge functions or the football-data ingestion.
- No redesign of `MatchCard` visuals or match-detail screen internals (only relocation/reuse).
- Advanced tie tie-breakers beyond aggregate + second-leg result.

---

## 12. Build sequence (high-level — detailed steps in the implementation plan)

1. `model/` pure logic + tests (`competitionShape`, `knockout`, `selectors`; relocate `stages`, `standings`).
2. `api/matchesApi.ts` consolidation + `hooks/useSeasonMatches.ts`; split the mega `useMatches.ts`.
3. Engines (relocate/adapt existing fixture, groups, knockout components; replace `chunkMatches` with ties).
4. Views (thin composition) + `MatchesScreen` switch.
5. Delete `regularLeague/` + `tournament/`; consolidate query keys.
6. Verify RLS; run `npm test`, `npm run lint`, and drive the app for each competition kind.
7. Update `CLAUDE.md` to match the final structure and names.
