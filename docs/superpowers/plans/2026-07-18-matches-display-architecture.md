# Matches Display Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Matches feature so all three competition kinds (regular league, Champions League, World Cup) render from three reusable engines fed by one season-wide query, with the view chosen by a pure classifier and two-legged ties paired client-side into aggregate cards.

**Architecture:** One query (`useSeasonMatches`) loads the whole season; memoized selectors slice it for three presentational engines (`FixtureListEngine`, `GroupsEngine`, `KnockoutEngine`); thin per-competition `views/` compose the engines; `MatchesScreen` picks a view via `resolveCompetitionShape(type, matches)`. Knockout matches are grouped by `(stage, unordered team pair)` into ties with aggregate scores.

**Tech Stack:** Expo React Native, TypeScript, TanStack Query, Zustand (`MemberStore`), NativeWind, Supabase, Jest (`jest-expo`).

## Global Constraints

- `@/` maps to `src/`; `@assets/` maps to `src/assets/`. Use aliases in cross-feature imports.
- All TanStack Query keys come from `KEYS` in `src/lib/queryClient.ts`. Never inline raw key arrays.
- User-facing strings go through `useTranslation()` / `t(key)`.
- Server state via TanStack Query; the client never writes `predictions.points`.
- Tests live in `__tests__/` colocated with the code. Heavy native modules are globally mocked in `jest.setup.ts`.
- Run `npx jest <path>` for one suite; `npm run lint` for lint.
- Commit after every task with a Conventional Commit message.
- `competitions.type` values are lowercase in data (`'league'`, `'cup'`); compare case-insensitively.

---

## File Structure

**New (pure logic, no React):**
- `src/features/matches/model/competitionShape.ts` — `resolveCompetitionShape()`, `CompetitionShape`
- `src/features/matches/model/knockout.ts` — `Tie`, `pairKnockoutTies()`, `selectKnockoutTies()`
- `src/features/matches/model/selectors.ts` — `selectFixtures()`, `selectByFixture()`, `selectGroups()`

**New (data):**
- `src/features/matches/api/matchesApi.ts` — renamed home of the match queries; adds `getSeasonMatches`
- `src/features/matches/hooks/useSeasonMatches.ts`

**New (engines — presentational):**
- `src/features/matches/engines/FixtureListEngine.tsx`
- `src/features/matches/engines/GroupsEngine.tsx`
- `src/features/matches/engines/KnockoutEngine.tsx`

**New (views — thin composition):**
- `src/features/matches/views/RegularLeagueView.tsx`
- `src/features/matches/views/LeaguePhaseKnockoutView.tsx`
- `src/features/matches/views/GroupsKnockoutView.tsx`
- `src/features/matches/views/KnockoutOnlyView.tsx`

**Modified:**
- `src/lib/queryClient.ts` — add `KEYS.matches.season`
- `src/features/matches/screens/MatchesScreen.tsx` — switch on shape
- `src/features/matches/hooks/useMatches.ts` — keep; `useSeasonMatches` is added separately
- `src/features/matches/screens/__tests__/MatchesTabDisplay.test.tsx` — retarget to new views

**Deleted (broken duplication) — last task:**
- `src/features/matches/regularLeague/` (whole dir)
- `src/features/matches/tournament/` (whole dir, incl. empty `api/tournamentService.ts` and neutralized `index.tsx`)

**Reused as-is (moved into engines/ or referenced):** `regularLeague/components/regular-league/FixturesList.tsx`, `MatchesList.tsx`; `tournament/components/tournament/{KnockoutMatches,BracketConnector,TournametTabs,GroupMatches}.tsx`; `tournament/components/champions-league/LeagueStandingsTable.tsx`. Existing pure helpers stay put and are composed: `utils/tournamentMatches.ts` (`computeLeagueStandings`, `getLeagueFixtures`, `getMatchesByFixture`, `getTournamentGroups`, `filterMatchesByGroup`, `normalizedGroupLetter`, `isKnockoutStage`, `getKnockoutStages`, `getStageLabel`), `types/footballStages.ts`, `utils/matchCard.mapper.ts`.

**Note on the current broken state:** `tournament/api/tournamentService.ts` is empty, `tournament/index.tsx` has its render commented out, `tournament/components/tournament/KnockoutMatches.tsx` imports a non-existent `../MatchCard`, `regularLeague/index.tsx` imports a deleted path, and `MatchesTabDisplay.test.tsx` mocks deleted screens. The plan builds the replacement first (Tasks 1–9) and deletes the broken dirs last (Task 10), so the app compiles at each committed step.

---

### Task 1: Competition shape classifier

**Files:**
- Create: `src/features/matches/model/competitionShape.ts`
- Test: `src/features/matches/model/__tests__/competitionShape.test.ts`

**Interfaces:**
- Consumes: `isDomesticLeagueStage`, `isGroupPhaseStage` from `../../types/footballStages`; `MatchBaseType` from `../../types`.
- Produces: `type CompetitionShape = 'REGULAR' | 'LEAGUEPHASE_KO' | 'GROUPS_KO' | 'KNOCKOUT_ONLY'`; `resolveCompetitionShape(type: string | null | undefined, matches: Pick<MatchBaseType, 'stage'>[]): CompetitionShape`.

- [ ] **Step 1: Write the failing test**

```ts
// src/features/matches/model/__tests__/competitionShape.test.ts
import { resolveCompetitionShape } from '../competitionShape';

const m = (stage: string | null) => ({ stage });

describe('resolveCompetitionShape', () => {
  it('returns REGULAR for a LEAGUE competition regardless of stages', () => {
    expect(resolveCompetitionShape('league', [m(null)])).toBe('REGULAR');
    expect(resolveCompetitionShape('League', [m('REGULAR_SEASON')])).toBe('REGULAR');
  });

  it('returns GROUPS_KO when a CUP has any group-stage match (World Cup)', () => {
    expect(resolveCompetitionShape('cup', [m('GROUP_STAGE'), m('FINAL')])).toBe('GROUPS_KO');
  });

  it('returns LEAGUEPHASE_KO when a CUP has a league-phase match (Champions League)', () => {
    expect(resolveCompetitionShape('cup', [m('LEAGUE_STAGE'), m('LAST_16')])).toBe('LEAGUEPHASE_KO');
    expect(resolveCompetitionShape('cup', [m('REGULAR_SEASON'), m('FINAL')])).toBe('LEAGUEPHASE_KO');
  });

  it('returns KNOCKOUT_ONLY for a CUP with only knockout stages', () => {
    expect(resolveCompetitionShape('cup', [m('SEMI_FINALS'), m('FINAL')])).toBe('KNOCKOUT_ONLY');
  });

  it('prefers GROUPS_KO over LEAGUEPHASE_KO if both stage kinds somehow appear', () => {
    expect(resolveCompetitionShape('cup', [m('GROUP_STAGE'), m('LEAGUE_STAGE')])).toBe('GROUPS_KO');
  });

  it('defaults an empty CUP to KNOCKOUT_ONLY', () => {
    expect(resolveCompetitionShape('cup', [])).toBe('KNOCKOUT_ONLY');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/matches/model/__tests__/competitionShape.test.ts`
Expected: FAIL — "Cannot find module '../competitionShape'".

- [ ] **Step 3: Write the implementation**

```ts
// src/features/matches/model/competitionShape.ts
import type { MatchBaseType } from '../types';
import { isDomesticLeagueStage, isGroupPhaseStage } from '../types/footballStages';

export type CompetitionShape = 'REGULAR' | 'LEAGUEPHASE_KO' | 'GROUPS_KO' | 'KNOCKOUT_ONLY';

/**
 * Single source of truth for which Matches view to render.
 * CL vs WC is not stored — it is inferred from the stage vocabulary present.
 */
export function resolveCompetitionShape(
  type: string | null | undefined,
  matches: Pick<MatchBaseType, 'stage'>[],
): CompetitionShape {
  if ((type ?? '').toUpperCase() === 'LEAGUE') return 'REGULAR';
  if (matches.some((match) => isGroupPhaseStage(match.stage))) return 'GROUPS_KO';
  if (matches.some((match) => isDomesticLeagueStage(match.stage))) return 'LEAGUEPHASE_KO';
  return 'KNOCKOUT_ONLY';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/matches/model/__tests__/competitionShape.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/matches/model/competitionShape.ts src/features/matches/model/__tests__/competitionShape.test.ts
git commit -m "feat(matches): add competition shape classifier"
```

---

### Task 2: Knockout tie pairing + aggregate

**Files:**
- Create: `src/features/matches/model/knockout.ts`
- Test: `src/features/matches/model/__tests__/knockout.test.ts`

**Interfaces:**
- Consumes: `MatchCardType` from `../../types`; `isKnockoutStage` from `../../utils/tournamentMatches`.
- Produces:
  - `type Tie = { key: string; stage: string; legs: MatchCardType[]; aggregate: { home: number; away: number } | null; advancingTeamId: number | null }`
  - `pairKnockoutTies(matches: MatchCardType[]): Tie[]` — pairs already-knockout matches.
  - `selectKnockoutTies(matches: MatchCardType[]): Tie[]` — filters to knockout stages then pairs.

**Semantics:** Group by `(stage, unordered {home_team_id, away_team_id})`. Legs ordered by `kick_off` ascending; `legs[0]` fixes the tie's home/away orientation (tie-home = `legs[0].home_team_id`). `aggregate` is non-null only when there are exactly 2 legs and both have numeric `score.fullTime` for both teams. `advancingTeamId`: see rules in code comments (higher aggregate; if level, only a second-leg penalty shootout resolves it; a single leg uses that match's `score.winner`; otherwise `null`).

- [ ] **Step 1: Write the failing test**

```ts
// src/features/matches/model/__tests__/knockout.test.ts
import type { MatchCardType } from '../../types';
import { pairKnockoutTies, selectKnockoutTies } from '../knockout';

const mk = (o: Partial<MatchCardType>): MatchCardType =>
  ({
    id: 0,
    competition_id: 1,
    fixture: null,
    kick_off: '2026-06-01T18:00:00Z',
    stage: 'QUARTER_FINALS',
    group: null,
    home_team_id: 1,
    away_team_id: 2,
    status: 'FINISHED',
    score: { winner: null, duration: 'REGULAR', fullTime: { home: 0, away: 0 } },
    home_team: null,
    away_team: null,
    ai_summary_en: null,
    ai_summary_he: null,
    ai_predicted_home_score: null,
    ai_predicted_away_score: null,
    prediction: null,
    ...o,
  }) as MatchCardType;

describe('pairKnockoutTies', () => {
  it('treats a single-leg World Cup knockout match as a one-leg tie with no aggregate', () => {
    const ties = pairKnockoutTies([mk({ id: 10, stage: 'FINAL', home_team_id: 3, away_team_id: 4 })]);
    expect(ties).toHaveLength(1);
    expect(ties[0].legs.map((l) => l.id)).toEqual([10]);
    expect(ties[0].aggregate).toBeNull();
  });

  it('pairs the two legs of a Champions League tie and orders them by kick_off', () => {
    const legB = mk({ id: 21, home_team_id: 2, away_team_id: 1, kick_off: '2026-03-15T20:00:00Z',
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 2, away: 0 } } });
    const legA = mk({ id: 20, home_team_id: 1, away_team_id: 2, kick_off: '2026-03-08T20:00:00Z',
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 1, away: 0 } } });
    const ties = pairKnockoutTies([legB, legA]);
    expect(ties).toHaveLength(1);
    expect(ties[0].legs.map((l) => l.id)).toEqual([20, 21]); // leg1 = earlier
    // tie-home = team 1 (legs[0].home_team_id). leg1: 1 scores 1. leg2: team1 is away, concedes 2 -> team1 total 1, team2 total 2
    expect(ties[0].aggregate).toEqual({ home: 1, away: 2 });
    expect(ties[0].advancingTeamId).toBe(2);
  });

  it('resolves a level aggregate only via a second-leg penalty shootout', () => {
    const leg1 = mk({ id: 30, home_team_id: 1, away_team_id: 2, kick_off: '2026-03-08T20:00:00Z',
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 1, away: 0 } } });
    const leg2 = mk({ id: 31, home_team_id: 2, away_team_id: 1, kick_off: '2026-03-15T20:00:00Z',
      score: { winner: 'HOME_TEAM', duration: 'PENALTY_SHOOTOUT', fullTime: { home: 1, away: 0 } } });
    const [tie] = pairKnockoutTies([leg1, leg2]);
    expect(tie.aggregate).toEqual({ home: 1, away: 1 });
    expect(tie.advancingTeamId).toBe(2); // leg2 home team won the shootout
  });

  it('leaves advancingTeamId null for an unfinished tie', () => {
    const leg1 = mk({ id: 40, status: 'FINISHED', home_team_id: 1, away_team_id: 2,
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 1, away: 0 } } });
    const leg2 = mk({ id: 41, status: 'SCHEDULED', home_team_id: 2, away_team_id: 1,
      kick_off: '2026-03-15T20:00:00Z', score: null });
    const [tie] = pairKnockoutTies([leg1, leg2]);
    expect(tie.aggregate).toBeNull();
    expect(tie.advancingTeamId).toBeNull();
  });
});

describe('selectKnockoutTies', () => {
  it('ignores non-knockout matches before pairing', () => {
    const group = mk({ id: 1, stage: 'GROUP_STAGE' });
    const ko = mk({ id: 2, stage: 'SEMI_FINALS', home_team_id: 5, away_team_id: 6 });
    expect(selectKnockoutTies([group, ko]).map((t) => t.stage)).toEqual(['SEMI_FINALS']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/matches/model/__tests__/knockout.test.ts`
Expected: FAIL — "Cannot find module '../knockout'".

- [ ] **Step 3: Write the implementation**

```ts
// src/features/matches/model/knockout.ts
import type { MatchCardType } from '../types';
import { isKnockoutStage } from '../utils/tournamentMatches';

export type Tie = {
  key: string;
  stage: string;
  legs: MatchCardType[]; // 1..2, ordered by kick_off ascending
  aggregate: { home: number; away: number } | null;
  advancingTeamId: number | null;
};

const teamPairKey = (a: number, b: number) => (a <= b ? `${a}-${b}` : `${b}-${a}`);

const winnerTeamId = (match: MatchCardType): number | null => {
  const winner = match.score?.winner;
  if (winner === 'HOME_TEAM') return match.home_team_id;
  if (winner === 'AWAY_TEAM') return match.away_team_id;
  return null;
};

const legGoalsForTeam = (match: MatchCardType, teamId: number): number | null => {
  const ft = match.score?.fullTime;
  if (!ft || ft.home == null || ft.away == null) return null;
  if (match.home_team_id === teamId) return ft.home;
  if (match.away_team_id === teamId) return ft.away;
  return null;
};

const isFinished = (match: MatchCardType) => match.status === 'FINISHED';

function buildTie(stage: string, key: string, unordered: MatchCardType[]): Tie {
  const legs = [...unordered].sort(
    (a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime(),
  );
  const homeId = legs[0].home_team_id;
  const awayId = legs[0].away_team_id;

  let aggregate: Tie['aggregate'] = null;
  if (legs.length === 2 && homeId != null && awayId != null) {
    let home = 0;
    let away = 0;
    let complete = true;
    for (const leg of legs) {
      const h = legGoalsForTeam(leg, homeId);
      const a = legGoalsForTeam(leg, awayId);
      if (h == null || a == null) { complete = false; break; }
      home += h;
      away += a;
    }
    if (complete) aggregate = { home, away };
  }

  let advancingTeamId: number | null = null;
  if (legs.length === 1) {
    advancingTeamId = isFinished(legs[0]) ? winnerTeamId(legs[0]) : null;
  } else if (aggregate && legs.every(isFinished)) {
    if (aggregate.home > aggregate.away) advancingTeamId = homeId;
    else if (aggregate.away > aggregate.home) advancingTeamId = awayId;
    else {
      const secondLeg = legs[1];
      advancingTeamId =
        secondLeg.score?.duration === 'PENALTY_SHOOTOUT' ? winnerTeamId(secondLeg) : null;
    }
  }

  return { key, stage, legs, aggregate, advancingTeamId };
}

export function pairKnockoutTies(matches: MatchCardType[]): Tie[] {
  const groups = new Map<string, MatchCardType[]>();
  for (const match of matches) {
    if (match.home_team_id == null || match.away_team_id == null || !match.stage) continue;
    const key = `${match.stage}:${teamPairKey(match.home_team_id, match.away_team_id)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(match);
    else groups.set(key, [match]);
  }

  return Array.from(groups.entries()).map(([key, legs]) => buildTie(legs[0].stage as string, key, legs));
}

export const selectKnockoutTies = (matches: MatchCardType[]): Tie[] =>
  pairKnockoutTies(matches.filter((match) => isKnockoutStage(match.stage)));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/matches/model/__tests__/knockout.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/matches/model/knockout.ts src/features/matches/model/__tests__/knockout.test.ts
git commit -m "feat(matches): pair two-legged knockout ties with aggregate scores"
```

---

### Task 3: Fixture & group selectors

**Files:**
- Create: `src/features/matches/model/selectors.ts`
- Test: `src/features/matches/model/__tests__/selectors.test.ts`

**Interfaces:**
- Consumes: `MatchCardType` from `../../types`; `computeLeagueStandings`, `getLeagueFixtures`, `getMatchesByFixture`, `getTournamentGroups`, `filterMatchesByGroup`, `ComputedStandingRow` from `../../utils/tournamentMatches`.
- Produces:
  - `selectFixtures(matches: MatchCardType[]): number[]`
  - `selectByFixture(matches: MatchCardType[], fixture: number): MatchCardType[]`
  - `type GroupsSlice = { groups: string[]; matchesByGroup: Record<string, MatchCardType[]>; standingsByGroup: Record<string, ComputedStandingRow[]> }`
  - `selectGroups(matches: MatchCardType[]): GroupsSlice`

These compose existing helpers (DRY) — no re-implementation of standings/fixture logic.

- [ ] **Step 1: Write the failing test**

```ts
// src/features/matches/model/__tests__/selectors.test.ts
import type { MatchCardType } from '../../types';
import { selectByFixture, selectFixtures, selectGroups } from '../selectors';

const mk = (o: Partial<MatchCardType>): MatchCardType =>
  ({ id: 0, fixture: 1, stage: null, group: null, kick_off: '2026-06-01T12:00:00Z',
     home_team_id: 1, away_team_id: 2, status: 'SCHEDULED', score: null,
     home_team: null, away_team: null, prediction: null } as MatchCardType);

describe('selectors', () => {
  it('lists unique sorted fixtures', () => {
    expect(selectFixtures([mk({ fixture: 3 }), mk({ fixture: 1 }), mk({ fixture: 3 })])).toEqual([1, 3]);
  });

  it('filters a fixture and sorts by kick_off', () => {
    const a = mk({ id: 1, fixture: 2, kick_off: '2026-06-02T18:00:00Z' });
    const b = mk({ id: 2, fixture: 2, kick_off: '2026-06-02T12:00:00Z' });
    const c = mk({ id: 3, fixture: 1 });
    expect(selectByFixture([a, b, c], 2).map((m) => m.id)).toEqual([2, 1]);
  });

  it('builds groups slice with matches and standings per group', () => {
    const g = selectGroups([
      mk({ id: 1, stage: 'GROUP_STAGE', group: 'A' }),
      mk({ id: 2, stage: 'GROUP_STAGE', group: 'Group B' }),
    ]);
    expect(g.groups).toEqual(['A', 'B']);
    expect(g.matchesByGroup['A'].map((m) => m.id)).toEqual([1]);
    expect(Array.isArray(g.standingsByGroup['A'])).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/matches/model/__tests__/selectors.test.ts`
Expected: FAIL — "Cannot find module '../selectors'".

- [ ] **Step 3: Write the implementation**

```ts
// src/features/matches/model/selectors.ts
import type { MatchCardType } from '../types';
import {
  ComputedStandingRow,
  computeLeagueStandings,
  filterMatchesByGroup,
  getLeagueFixtures,
  getMatchesByFixture,
  getTournamentGroups,
} from '../utils/tournamentMatches';

export const selectFixtures = (matches: MatchCardType[]): number[] => getLeagueFixtures(matches);

export const selectByFixture = (matches: MatchCardType[], fixture: number): MatchCardType[] =>
  getMatchesByFixture(matches, fixture);

export type GroupsSlice = {
  groups: string[];
  matchesByGroup: Record<string, MatchCardType[]>;
  standingsByGroup: Record<string, ComputedStandingRow[]>;
};

export const selectGroups = (matches: MatchCardType[]): GroupsSlice => {
  const groups = getTournamentGroups(matches);
  const matchesByGroup: Record<string, MatchCardType[]> = {};
  const standingsByGroup: Record<string, ComputedStandingRow[]> = {};

  for (const group of groups) {
    const groupMatches = filterMatchesByGroup(matches, group);
    matchesByGroup[group] = groupMatches;
    standingsByGroup[group] = computeLeagueStandings(groupMatches);
  }

  return { groups, matchesByGroup, standingsByGroup };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/matches/model/__tests__/selectors.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/matches/model/selectors.ts src/features/matches/model/__tests__/selectors.test.ts
git commit -m "feat(matches): add fixture and group selectors"
```

---

### Task 4: Season query API + query key

**Files:**
- Create: `src/features/matches/api/matchesApi.ts`
- Modify: `src/lib/queryClient.ts` (add `season` key under `matches`)

**Interfaces:**
- Consumes: the existing `matchesApi` object in `src/features/matches/regularLeague/api/matchesService.ts` (still present until Task 10).
- Produces: `matchesApi.getSeasonMatches(competitionId: number, memberId: string): Promise<MatchCardType[]>`; `KEYS.matches.season(competitionId, memberId)`.

**Context:** `getSeasonMatches` is the season-wide load. It is identical in behaviour to the existing `getCompetitionMatchesWithMemberPredictions`. To avoid duplicating the large Supabase select string before Task 10, this new module **re-exports** from the existing service and adds the season alias. Task 10 collapses the old file into this one.

- [ ] **Step 1: Add the query key**

In `src/lib/queryClient.ts`, inside the `matches` object (after `byCompetition`), add:

```ts
    season: (competitionId: number, memberId: string) =>
      ['matches', competitionId, 'season', memberId] as const,
```

- [ ] **Step 2: Create the API module**

```ts
// src/features/matches/api/matchesApi.ts
import type { MatchCardType } from '../types';
import { matchesApi as legacyMatchesApi } from '../regularLeague/api/matchesService';

/**
 * All match queries. `getSeasonMatches` loads the whole competition once;
 * every Matches view slices it client-side (see model/selectors, model/knockout).
 */
export const matchesApi = {
  ...legacyMatchesApi,
  getSeasonMatches: (competitionId: number, memberId: string): Promise<MatchCardType[]> =>
    legacyMatchesApi.getCompetitionMatchesWithMemberPredictions(competitionId, memberId),
};
```

- [ ] **Step 3: Typecheck the module**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "matchesApi|queryClient" || echo "no type errors in new files"`
Expected: `no type errors in new files`.

- [ ] **Step 4: Commit**

```bash
git add src/features/matches/api/matchesApi.ts src/lib/queryClient.ts
git commit -m "feat(matches): add season-wide match query and key"
```

---

### Task 5: useSeasonMatches hook

**Files:**
- Create: `src/features/matches/hooks/useSeasonMatches.ts`
- Test: `src/features/matches/hooks/__tests__/useSeasonMatches.test.ts`

**Interfaces:**
- Consumes: `matchesApi.getSeasonMatches` (Task 4); `KEYS.matches.season`; `usePrimaryMember` from `@/store/MemberStore`.
- Produces: `useSeasonMatches({ competitionId, memberId, enabled? }): UseQueryResult<MatchCardType[]>`.

**Test note:** `@tanstack/react-query` is globally mocked in `jest.setup.ts`. Assert the hook builds the right query options (queryKey + enabled), following the pattern in `src/features/leagues/hooks/__tests__/useLeagues.test.ts`. Inspect that file first to match the exact mock shape; if the mock returns the passed options, assert on them; otherwise assert the hook renders without throwing given valid inputs.

- [ ] **Step 1: Write the hook**

```ts
// src/features/matches/hooks/useSeasonMatches.ts
import { KEYS } from '@/lib/queryClient';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { matchesApi } from '../api/matchesApi';

export const useSeasonMatches = ({
  competitionId,
  memberId,
  enabled = true,
}: {
  competitionId: number | null;
  memberId: string | null;
  enabled?: boolean;
}) => {
  const isReady = enabled && competitionId != null && memberId != null;

  const query = useQuery({
    queryKey: isReady
      ? KEYS.matches.season(competitionId, memberId)
      : (['matches', 'season', 'disabled', competitionId ?? 'none', memberId ?? 'none'] as const),
    queryFn: isReady ? () => matchesApi.getSeasonMatches(competitionId, memberId) : skipToken,
    enabled: isReady,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (query.data) void prefetchMatchTeamLogos(query.data);
  }, [query.data]);

  return query;
};
```

- [ ] **Step 2: Write the test** (adapt to the query mock shape used in `useLeagues.test.ts`)

```ts
// src/features/matches/hooks/__tests__/useSeasonMatches.test.ts
import { renderHook } from '@testing-library/react-native';
import { useSeasonMatches } from '../useSeasonMatches';

describe('useSeasonMatches', () => {
  it('runs disabled when ids are missing', () => {
    const { result } = renderHook(() => useSeasonMatches({ competitionId: null, memberId: null }));
    expect(result.current).toBeDefined();
  });

  it('runs enabled with valid ids', () => {
    const { result } = renderHook(() => useSeasonMatches({ competitionId: 1, memberId: 'm1' }));
    expect(result.current).toBeDefined();
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npx jest src/features/matches/hooks/__tests__/useSeasonMatches.test.ts`
Expected: PASS. If the global mock requires a wrapper/provider, copy the wrapper from `useLeagues.test.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/features/matches/hooks/useSeasonMatches.ts src/features/matches/hooks/__tests__/useSeasonMatches.test.ts
git commit -m "feat(matches): add useSeasonMatches hook"
```

---

### Task 6: FixtureListEngine

**Files:**
- Move: `src/features/matches/regularLeague/components/regular-league/FixturesList.tsx` → `src/features/matches/engines/fixture-list/FixturesList.tsx`
- Move: `src/features/matches/regularLeague/components/regular-league/MatchesList.tsx` → `src/features/matches/engines/fixture-list/MatchesList.tsx`
- Create: `src/features/matches/engines/FixtureListEngine.tsx`

**Interfaces:**
- Consumes: `MatchCardType`; `mapMatchToCardData` from `../utils/matchCard.mapper`; `selectFixtures`, `selectByFixture` from `../model/selectors`; `formatDateRange` from `@/utils/formats`; `FixturesList`, `MatchesList` (moved).
- Produces: `FixtureListEngine({ matches, currentFixture, selectedFixture, onSelectFixture, onRefresh, animateScroll?, bottomInset?, locale })`.

**Context:** This extracts the fixture-list body from the old `regularLeague/index.tsx` into a reusable, data-sliced engine. The navigation/focus preservation logic from `regularLeague/index.tsx` moves to `RegularLeagueView` (Task 8), not here — the engine is presentational.

- [ ] **Step 1: Move the two components with git mv**

```bash
mkdir -p src/features/matches/engines/fixture-list
git mv src/features/matches/regularLeague/components/regular-league/FixturesList.tsx src/features/matches/engines/fixture-list/FixturesList.tsx
git mv src/features/matches/regularLeague/components/regular-league/MatchesList.tsx src/features/matches/engines/fixture-list/MatchesList.tsx
```

- [ ] **Step 2: Fix imports in the moved files**

In `engines/fixture-list/MatchesList.tsx`, change `import MatchesSkeleton from '../MatchesSkeleton';` to `import MatchesSkeleton from '../../components/MatchesSkeleton';`. Verify `MatchCardData` import path becomes `../../utils/matchCard.mapper`. `FixturesList.tsx` imports only from `@/` aliases — no change needed. Confirm:

Run: `grep -nE "\.\./" src/features/matches/engines/fixture-list/FixturesList.tsx src/features/matches/engines/fixture-list/MatchesList.tsx`
Expected: only `../../components/...` and `../../utils/...` relative paths remain.

- [ ] **Step 3: Create the engine**

```tsx
// src/features/matches/engines/FixtureListEngine.tsx
import { formatDateRange } from '@/utils/formats';
import { useMemo } from 'react';
import { mapMatchToCardData } from '../utils/matchCard.mapper';
import { selectByFixture, selectFixtures } from '../model/selectors';
import type { MatchCardType } from '../types';
import FixturesList from './fixture-list/FixturesList';
import MatchesList from './fixture-list/MatchesList';

type FixtureListEngineProps = {
  matches: MatchCardType[];
  currentFixture: number;
  selectedFixture: number;
  onSelectFixture: (fixture: number) => void;
  onRefresh: () => void;
  animateScroll?: boolean;
  bottomInset?: number;
  locale: string;
  fixtures?: number[];
};

export default function FixtureListEngine({
  matches,
  currentFixture,
  selectedFixture,
  onSelectFixture,
  onRefresh,
  animateScroll = false,
  bottomInset = 0,
  locale,
  fixtures,
}: FixtureListEngineProps) {
  const allFixtures = useMemo(() => fixtures ?? selectFixtures(matches), [fixtures, matches]);

  const fixtureDateRanges = useMemo(() => {
    const ranges: Record<number, string> = {};
    for (const fixture of allFixtures) {
      const fixtureMatches = selectByFixture(matches, fixture).filter((m) => m.kick_off);
      if (fixtureMatches.length === 0) continue;
      const dates = fixtureMatches
        .map((m) => new Date(m.kick_off))
        .sort((a, b) => a.getTime() - b.getTime());
      ranges[fixture] = formatDateRange(dates[0].toISOString(), dates[dates.length - 1].toISOString(), locale);
    }
    return ranges;
  }, [allFixtures, matches, locale]);

  const cards = useMemo(
    () => selectByFixture(matches, selectedFixture).map(mapMatchToCardData),
    [matches, selectedFixture],
  );

  return (
    <>
      <FixturesList
        fixtures={allFixtures}
        selectedFixture={selectedFixture}
        currentFixture={currentFixture}
        handleFixturePress={onSelectFixture}
        animateScroll={animateScroll}
        fixtureDateRanges={fixtureDateRanges}
      />
      <MatchesList matches={cards} onRefresh={onRefresh} bottomInset={bottomInset} />
    </>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "FixtureListEngine|fixture-list/" || echo "clean"`
Expected: `clean`.

- [ ] **Step 5: Commit**

```bash
git add src/features/matches/engines
git commit -m "feat(matches): add FixtureListEngine from relocated fixture components"
```

---

### Task 7: GroupsEngine and KnockoutEngine

**Files:**
- Move: `src/features/matches/tournament/components/tournament/BracketConnector.tsx` → `src/features/matches/engines/knockout/BracketConnector.tsx`
- Move: `src/features/matches/tournament/components/tournament/TournametTabs.tsx` → `src/features/matches/engines/shared/TournamentTabs.tsx`
- Move: `src/features/matches/tournament/components/champions-league/LeagueStandingsTable.tsx` → `src/features/matches/engines/groups/LeagueStandingsTable.tsx`
- Create: `src/features/matches/engines/GroupsEngine.tsx`
- Create: `src/features/matches/engines/KnockoutEngine.tsx`
- Create: `src/features/matches/engines/shared/MatchCard.tsx` (re-export of `../../components/MatchCard`)

**Interfaces:**
- Consumes: `Tie`, `selectKnockoutTies` (Task 2); `GroupsSlice`, `selectGroups` (Task 3); `getKnockoutStages`, `getStageLabel`, `normalizedGroupLetter` from `../utils/tournamentMatches`; `mapMatchToCardData`; `MatchCard` from `../components/MatchCard`.
- Produces:
  - `GroupsEngine({ matches, onRefresh })` — renders group tabs + standings + group matches.
  - `KnockoutEngine({ matches, onRefresh, initialStage? })` — renders stage tabs + tie bracket.

**Context:** `KnockoutEngine` replaces the old `KnockoutMatches` naive 2-by-2 `chunkMatches` with tie-based rendering: each `Tie` renders its `legs` stacked and, when `tie.aggregate` is set, an aggregate header. Reuse `BracketConnector`, `KnockoutStageTabs`, and `MatchCard`. `GroupsEngine` wraps the existing `GroupMatches` body but sources standings via `selectGroups`.

- [ ] **Step 1: Move shared/knockout/groups components**

```bash
mkdir -p src/features/matches/engines/knockout src/features/matches/engines/groups src/features/matches/engines/shared
git mv src/features/matches/tournament/components/tournament/BracketConnector.tsx src/features/matches/engines/knockout/BracketConnector.tsx
git mv src/features/matches/tournament/components/tournament/TournametTabs.tsx src/features/matches/engines/shared/TournamentTabs.tsx
git mv src/features/matches/tournament/components/champions-league/LeagueStandingsTable.tsx src/features/matches/engines/groups/LeagueStandingsTable.tsx
```

- [ ] **Step 2: Fix imports in the moved files**

- `engines/shared/TournamentTabs.tsx` — imports only `@/` aliases + `TournamentView` from `../../utils/tournamentMatches`; update that relative import to `../../utils/tournamentMatches`.
- `engines/groups/LeagueStandingsTable.tsx` — update `ComputedStandingRow` import to `../../utils/tournamentMatches`.
- `engines/knockout/BracketConnector.tsx` — verify only `@/` imports; no change likely.

Run: `grep -rnE "from '\.\." src/features/matches/engines/shared src/features/matches/engines/knockout src/features/matches/engines/groups`
Expected: every relative path resolves to `../../utils/...` or `../../components/...` or `../../providers/...`; fix any that still point at old `tournament/` or `champions-league/` siblings.

- [ ] **Step 3: Create the MatchCard re-export**

```tsx
// src/features/matches/engines/shared/MatchCard.tsx
export { MatchCard } from '../../components/MatchCard';
```

- [ ] **Step 4: Create KnockoutEngine**

```tsx
// src/features/matches/engines/KnockoutEngine.tsx
import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { selectKnockoutTies, type Tie } from '../model/knockout';
import type { MatchCardType } from '../types';
import { getKnockoutStages, getStageLabel } from '../utils/tournamentMatches';
import { mapMatchToCardData } from '../utils/matchCard.mapper';
import { KnockoutStageTabs } from './shared/TournamentTabs';

function TieBlock({ tie }: { tie: Tie }) {
  const { t } = useTranslation();
  return (
    <View className="mb-3 rounded-2xl border border-border bg-surfaceSecondary/60 p-2">
      {tie.legs.map((leg) => {
        const card = mapMatchToCardData(leg);
        return (
          <MatchCard
            key={leg.id}
            id={card.id}
            home={card.home}
            away={card.away}
            prediction={card.prediction}
            predictionStatus={card.predictionStatus}
            status={card.status}
            logoVariant="flag"
            date={card.date}
            time={card.time}
            onPress={() => router.push(`/(app)/(league)/match/${leg.id}`)}
          />
        );
      })}
      {tie.aggregate && (
        <Text variant="caption" className="text-muted mt-1 text-center">
          {t('Aggregate')}: {tie.aggregate.home}–{tie.aggregate.away}
        </Text>
      )}
    </View>
  );
}

export default function KnockoutEngine({
  matches,
  onRefresh,
  initialStage,
}: {
  matches: MatchCardType[];
  onRefresh: () => void;
  initialStage?: string;
}) {
  const { t } = useTranslation();
  const ties = useMemo(() => selectKnockoutTies(matches), [matches]);
  const stages = useMemo(() => getKnockoutStages(matches), [matches]);
  const [selectedStage, setSelectedStage] = useState(initialStage ?? stages[0] ?? '');
  const activeStage = stages.includes(selectedStage) ? selectedStage : stages[0] ?? '';
  const stageTies = useMemo(() => ties.filter((tie) => tie.stage === activeStage), [ties, activeStage]);

  if (stages.length === 0) {
    return <Text className="text-text mt-6 text-center">{t('No matches found')}</Text>;
  }

  return (
    <View className="flex-1">
      <KnockoutStageTabs
        stages={stages}
        selectedStage={activeStage}
        onSelectStage={setSelectedStage}
        getLabel={getStageLabel}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, flexGrow: 1 }}
      >
        {stageTies.length > 0 ? (
          stageTies.map((tie) => <TieBlock key={tie.key} tie={tie} />)
        ) : (
          <Text className="text-text mt-6 text-center">{t('No matches found')}</Text>
        )}
      </ScrollView>
    </View>
  );
}
```

Add the `Aggregate` key to `src/lib/i18n/translations.ts` under the matches section (EN: `Aggregate`, HE: `מצרפי`).

- [ ] **Step 5: Create GroupsEngine**

```tsx
// src/features/matches/engines/GroupsEngine.tsx
import { useFloatBottomTabsInset } from '@/components/layout';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import LeagueStandingsTable from './groups/LeagueStandingsTable';
import { GroupTabs } from './shared/TournamentTabs';
import { selectGroups } from '../model/selectors';
import type { MatchCardType } from '../types';
import { mapMatchToCardData } from '../utils/matchCard.mapper';

export default function GroupsEngine({
  matches,
  onRefresh,
}: {
  matches: MatchCardType[];
  onRefresh: () => void;
}) {
  const bottomInset = useFloatBottomTabsInset();
  const { groups, matchesByGroup, standingsByGroup } = useMemo(() => selectGroups(matches), [matches]);
  const [selectedGroup, setSelectedGroup] = useState(groups[0] ?? '');
  const activeGroup = groups.includes(selectedGroup) ? selectedGroup : groups[0] ?? '';

  return (
    <View className="flex-1">
      <GroupTabs groups={groups} selectedGroup={activeGroup} onSelectGroup={setSelectedGroup} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, paddingBottom: bottomInset + 24, flexGrow: 1 }}
      >
        <LeagueStandingsTable rows={standingsByGroup[activeGroup] ?? []} />
        <View className="mt-4 gap-2">
          {(matchesByGroup[activeGroup] ?? []).map((match) => {
            const card = mapMatchToCardData(match);
            return (
              <MatchCard
                key={match.id}
                id={card.id}
                home={card.home}
                away={card.away}
                prediction={card.prediction}
                predictionStatus={card.predictionStatus}
                status={card.status}
                logoVariant="flag"
                date={card.date}
                time={card.time}
                onPress={() => router.push(`/(app)/(league)/match/${match.id}`)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
```

Verify `MatchCard` prop names against `src/features/matches/components/MatchCard.tsx` before finalizing; adjust `logoVariant`/prop names to match its actual signature.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "engines/" || echo "clean"`
Expected: `clean` (fix any prop-name mismatches surfaced against the real `MatchCard`).

- [ ] **Step 7: Commit**

```bash
git add src/features/matches/engines src/lib/i18n/translations.ts
git commit -m "feat(matches): add GroupsEngine and tie-based KnockoutEngine"
```

---

### Task 8: Views (thin composition)

**Files:**
- Create: `src/features/matches/views/RegularLeagueView.tsx`
- Create: `src/features/matches/views/LeaguePhaseKnockoutView.tsx`
- Create: `src/features/matches/views/GroupsKnockoutView.tsx`
- Create: `src/features/matches/views/KnockoutOnlyView.tsx`

**Interfaces:**
- Consumes: `FixtureListEngine` (Task 6), `GroupsEngine`, `KnockoutEngine` (Task 7); `isFirstPhaseStage`, `isKnockoutStage`, `TournamentView` from `../utils/tournamentMatches`; `HorizontalTabs` from `../engines/shared/TournamentTabs`; `MatchCardType`.
- Produces: four default-exported components, each `({ matches, currentFixture, currentStage, onRefresh, memberId, competitionId })` where relevant. All receive already-loaded `matches`.

**Context:** Views own tab state and first-phase/knockout splitting; engines stay dumb. `RegularLeagueView` also owns the fixture-selection + focus-preservation logic previously in `regularLeague/index.tsx` (copy it, swapping the data source to the passed `matches` and `useGetMatchesByFixture` for local `selectByFixture`).

- [ ] **Step 1: RegularLeagueView**

```tsx
// src/features/matches/views/RegularLeagueView.tsx
import { useFloatBottomTabsInset } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useState } from 'react';
import FixtureListEngine from '../engines/FixtureListEngine';
import type { MatchCardType } from '../types';

export default function RegularLeagueView({
  matches,
  currentFixture,
  onRefresh,
}: {
  matches: MatchCardType[];
  currentFixture: number;
  onRefresh: () => void;
}) {
  const bottomInset = useFloatBottomTabsInset();
  const { language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const [selectedFixture, setSelectedFixture] = useState(currentFixture || 1);
  const [animateScroll, setAnimateScroll] = useState(false);

  const onSelectFixture = useCallback((fixture: number) => {
    setAnimateScroll(true);
    setSelectedFixture(fixture);
  }, []);

  return (
    <FixtureListEngine
      matches={matches}
      currentFixture={currentFixture}
      selectedFixture={selectedFixture}
      onSelectFixture={onSelectFixture}
      onRefresh={onRefresh}
      animateScroll={animateScroll}
      bottomInset={bottomInset}
      locale={locale}
    />
  );
}
```

- [ ] **Step 2: LeaguePhaseKnockoutView (Champions League)**

```tsx
// src/features/matches/views/LeaguePhaseKnockoutView.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import FixtureListEngine from '../engines/FixtureListEngine';
import KnockoutEngine from '../engines/KnockoutEngine';
import { HorizontalTabs } from '../engines/shared/TournamentTabs';
import type { MatchCardType } from '../types';
import { isFirstPhaseStage, isKnockoutStage, type TournamentView } from '../utils/tournamentMatches';

export default function LeaguePhaseKnockoutView({
  matches,
  currentFixture,
  currentStage,
  onRefresh,
}: {
  matches: MatchCardType[];
  currentFixture: number;
  currentStage: string | null;
  onRefresh: () => void;
}) {
  const { t, language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const leaguePhase = useMemo(() => matches.filter((m) => isFirstPhaseStage(m.stage)), [matches]);
  const knockout = useMemo(() => matches.filter((m) => isKnockoutStage(m.stage)), [matches]);
  const [view, setView] = useState<TournamentView>(isKnockoutStage(currentStage) ? 'knockout' : 'groups');
  const [selectedFixture, setSelectedFixture] = useState(currentFixture || 1);
  const onSelectFixture = useCallback((f: number) => setSelectedFixture(f), []);

  return (
    <View className="flex-1">
      <HorizontalTabs
        value={view}
        onChange={setView}
        options={[
          { value: 'groups', label: t('League Phase') },
          { value: 'knockout', label: t('Knockout') },
        ]}
      />
      {view === 'groups' ? (
        <FixtureListEngine
          matches={leaguePhase}
          currentFixture={currentFixture}
          selectedFixture={selectedFixture}
          onSelectFixture={onSelectFixture}
          onRefresh={onRefresh}
          locale={locale}
        />
      ) : (
        <KnockoutEngine matches={knockout} onRefresh={onRefresh} initialStage={currentStage ?? undefined} />
      )}
    </View>
  );
}
```

- [ ] **Step 3: GroupsKnockoutView (World Cup)**

```tsx
// src/features/matches/views/GroupsKnockoutView.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import GroupsEngine from '../engines/GroupsEngine';
import KnockoutEngine from '../engines/KnockoutEngine';
import { HorizontalTabs } from '../engines/shared/TournamentTabs';
import type { MatchCardType } from '../types';
import { isFirstPhaseStage, isKnockoutStage, type TournamentView } from '../utils/tournamentMatches';

export default function GroupsKnockoutView({
  matches,
  currentStage,
  onRefresh,
}: {
  matches: MatchCardType[];
  currentStage: string | null;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const groupMatches = useMemo(() => matches.filter((m) => isFirstPhaseStage(m.stage)), [matches]);
  const knockout = useMemo(() => matches.filter((m) => isKnockoutStage(m.stage)), [matches]);
  const [view, setView] = useState<TournamentView>(isKnockoutStage(currentStage) ? 'knockout' : 'groups');

  return (
    <View className="flex-1">
      <HorizontalTabs
        value={view}
        onChange={setView}
        options={[
          { value: 'groups', label: t('Groups') },
          { value: 'knockout', label: t('Knockout') },
        ]}
      />
      {view === 'groups' ? (
        <GroupsEngine matches={groupMatches} onRefresh={onRefresh} />
      ) : (
        <KnockoutEngine matches={knockout} onRefresh={onRefresh} initialStage={currentStage ?? undefined} />
      )}
    </View>
  );
}
```

- [ ] **Step 4: KnockoutOnlyView**

```tsx
// src/features/matches/views/KnockoutOnlyView.tsx
import KnockoutEngine from '../engines/KnockoutEngine';
import type { MatchCardType } from '../types';

export default function KnockoutOnlyView({
  matches,
  currentStage,
  onRefresh,
}: {
  matches: MatchCardType[];
  currentStage: string | null;
  onRefresh: () => void;
}) {
  return <KnockoutEngine matches={matches} onRefresh={onRefresh} initialStage={currentStage ?? undefined} />;
}
```

- [ ] **Step 5: Add i18n keys**

Add to `src/lib/i18n/translations.ts` (matches section) any missing keys: `Knockout` (HE: `נוקאאוט`), `Groups` (HE: `בתים`), `League Phase` (already exists per `getStageLabel`; add to translations if absent).

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "views/" || echo "clean"`
Expected: `clean`. Adjust `HorizontalTabs` `options` prop shape to match `engines/shared/TournamentTabs.tsx` (`TabOption<T> = { value, label }`).

- [ ] **Step 7: Commit**

```bash
git add src/features/matches/views src/lib/i18n/translations.ts
git commit -m "feat(matches): add per-competition composition views"
```

---

### Task 9: Wire MatchesScreen to the classifier

**Files:**
- Rewrite: `src/features/matches/screens/MatchesScreen.tsx`
- Rewrite: `src/features/matches/screens/__tests__/MatchesTabDisplay.test.tsx`

**Interfaces:**
- Consumes: `useSeasonMatches` (Task 5); `useGetCompetitionsDetails` from `@/features/leagues/hooks/useCompetition`; `resolveCompetitionShape` (Task 1); the four views (Task 8); `usePrimaryMember` from `@/store/MemberStore`.
- Produces: the Matches tab entry (already re-exported by `src/app/(app)/(league)/(tabs)/Matches.tsx`).

- [ ] **Step 1: Rewrite the screen**

```tsx
// src/features/matches/screens/MatchesScreen.tsx
import { Error, Screen } from '@/components/layout';
import { useGetCompetitionsDetails } from '@/features/leagues/hooks/useCompetition';
import { usePrimaryMember } from '@/store/MemberStore';
import MatchesSkeleton from '../components/MatchesSkeleton';
import { useSeasonMatches } from '../hooks/useSeasonMatches';
import { resolveCompetitionShape } from '../model/competitionShape';
import GroupsKnockoutView from '../views/GroupsKnockoutView';
import KnockoutOnlyView from '../views/KnockoutOnlyView';
import LeaguePhaseKnockoutView from '../views/LeaguePhaseKnockoutView';
import RegularLeagueView from '../views/RegularLeagueView';

export default function MatchesScreen() {
  const { memberId, competitionId } = usePrimaryMember();
  const { data: meta, isLoading: metaLoading, error: metaError } = useGetCompetitionsDetails();
  const {
    data: matches = [],
    isLoading: matchesLoading,
    error: matchesError,
    refetch,
  } = useSeasonMatches({ competitionId, memberId, enabled: !!meta });

  if (metaLoading || matchesLoading || !meta) return <MatchesSkeleton />;
  if (metaError || matchesError) return <Error error={metaError?.message || matchesError?.message || 'Unknown error'} />;

  const shape = resolveCompetitionShape(meta.type, matches);
  const currentFixture = meta.currentFixture ?? 1;
  const currentStage = meta.currentStage ?? null;

  return (
    <Screen className="pt-2">
      {shape === 'REGULAR' && (
        <RegularLeagueView matches={matches} currentFixture={currentFixture} onRefresh={refetch} />
      )}
      {shape === 'LEAGUEPHASE_KO' && (
        <LeaguePhaseKnockoutView
          matches={matches}
          currentFixture={currentFixture}
          currentStage={currentStage}
          onRefresh={refetch}
        />
      )}
      {shape === 'GROUPS_KO' && (
        <GroupsKnockoutView matches={matches} currentStage={currentStage} onRefresh={refetch} />
      )}
      {shape === 'KNOCKOUT_ONLY' && (
        <KnockoutOnlyView matches={matches} currentStage={currentStage} onRefresh={refetch} />
      )}
    </Screen>
  );
}
```

- [ ] **Step 2: Rewrite the screen test**

```tsx
// src/features/matches/screens/__tests__/MatchesTabDisplay.test.tsx
import MatchesTab from '@/app/(app)/(league)/(tabs)/Matches';
import { useGetCompetitionsDetails } from '@/features/leagues/hooks/useCompetition';
import { useSeasonMatches } from '@/features/matches/hooks/useSeasonMatches';
import { usePrimaryMember } from '@/store/MemberStore';
import { render } from '@testing-library/react-native';

jest.mock('@/store/MemberStore', () => ({ usePrimaryMember: jest.fn() }));
jest.mock('@/features/leagues/hooks/useCompetition', () => ({ useGetCompetitionsDetails: jest.fn() }));
jest.mock('@/features/matches/hooks/useSeasonMatches', () => ({ useSeasonMatches: jest.fn() }));

jest.mock('@/features/matches/views/RegularLeagueView', () => {
  const { Text } = require('react-native');
  return () => <Text>RegularLeagueView</Text>;
});
jest.mock('@/features/matches/views/GroupsKnockoutView', () => {
  const { Text } = require('react-native');
  return () => <Text>GroupsKnockoutView</Text>;
});
jest.mock('@/features/matches/views/LeaguePhaseKnockoutView', () => {
  const { Text } = require('react-native');
  return () => <Text>LeaguePhaseKnockoutView</Text>;
});

const setup = (type: string, stages: string[]) => {
  jest.mocked(usePrimaryMember).mockReturnValue({ memberId: 'm1', competitionId: 100 } as any);
  jest.mocked(useGetCompetitionsDetails).mockReturnValue({
    data: { type, currentFixture: 1, currentStage: stages[0] ?? null },
    isLoading: false,
    error: null,
  } as any);
  jest.mocked(useSeasonMatches).mockReturnValue({
    data: stages.map((s) => ({ stage: s })),
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  } as any);
};

describe('Matches tab display selection', () => {
  it('renders RegularLeagueView for a LEAGUE competition', () => {
    setup('league', []);
    expect(render(<MatchesTab />).getByText('RegularLeagueView')).toBeTruthy();
  });
  it('renders GroupsKnockoutView for a CUP with group stage', () => {
    setup('cup', ['GROUP_STAGE', 'FINAL']);
    expect(render(<MatchesTab />).getByText('GroupsKnockoutView')).toBeTruthy();
  });
  it('renders LeaguePhaseKnockoutView for a CUP with a league phase', () => {
    setup('cup', ['LEAGUE_STAGE', 'LAST_16']);
    expect(render(<MatchesTab />).getByText('LeaguePhaseKnockoutView')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npx jest src/features/matches/screens/__tests__/MatchesTabDisplay.test.tsx`
Expected: PASS (3 tests). If `Screen`/`Error`/`MatchesSkeleton` need mocking, add lightweight mocks like the view mocks.

- [ ] **Step 4: Commit**

```bash
git add src/features/matches/screens/MatchesScreen.tsx src/features/matches/screens/__tests__/MatchesTabDisplay.test.tsx
git commit -m "feat(matches): route Matches tab through competition-shape classifier"
```

---

### Task 10: Remove the broken duplicated folders and consolidate the API

**Files:**
- Modify: `src/features/matches/api/matchesApi.ts` (inline the query bodies from the legacy service)
- Modify: `src/features/matches/hooks/useMatches.ts` (repoint `../regularLeague/api/matchesService` → `../api/matchesApi`)
- Delete: `src/features/matches/regularLeague/` and `src/features/matches/tournament/` (whatever remains)

**Interfaces:**
- Produces: `matchesApi` in `api/matchesApi.ts` becomes the single, self-contained source (no re-export of a deleted file).

- [ ] **Step 1: Inline the legacy service into `api/matchesApi.ts`**

Move the full contents of `regularLeague/api/matchesService.ts` (the select-string constants and all `matchesApi` methods) into `src/features/matches/api/matchesApi.ts`, fixing the two relative imports: `../../types` → `../types`, `../../types/footballStages` → `../types/footballStages`, `../../utils/tournamentMatches` → `../utils/tournamentMatches`. Add the `getSeasonMatches` method inside the object (aliasing `getCompetitionMatchesWithMemberPredictions`). Remove the temporary `...legacyMatchesApi` re-export.

- [ ] **Step 2: Repoint remaining importers**

Run: `grep -rln "regularLeague/api/matchesService" src`
For each hit (expect `hooks/useMatches.ts`), change the import to `../api/matchesApi`.

- [ ] **Step 3: Find any other importers of the doomed folders**

Run: `grep -rln "matches/regularLeague\|matches/tournament\|regularLeague/index\|tournament/index" src`
Repoint any hits to the new engines/views. Expected remaining after Tasks 6–9: none outside the folders themselves.

- [ ] **Step 4: Delete the folders**

```bash
git rm -r src/features/matches/regularLeague src/features/matches/tournament
```

- [ ] **Step 5: Typecheck the whole project**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors. Fix any dangling imports the deletion surfaced.

- [ ] **Step 6: Full matches test run**

Run: `npx jest src/features/matches`
Expected: all suites pass (including the pre-existing `MatchStats`, `PredictionRank`, `tournamentMatches`, `matchStatus`, `pointsColor`).

- [ ] **Step 7: Commit**

```bash
git add -A src/features/matches
git commit -m "refactor(matches): consolidate API and remove duplicated view folders"
```

---

### Task 11: Verify security, lint, and drive the app

**Files:**
- Read/verify: `supabase/migrations/20260706120100_restrict_league_read.sql`
- Modify: `CLAUDE.md` (competition/match display section)

- [ ] **Step 1: Verify RLS**

Read `supabase/migrations/20260706120100_restrict_league_read.sql` and confirm: `matches` is readable by authenticated users; `predictions` SELECT is restricted so a member only reads predictions within their own league. If `predictions` lacks a league-scoped SELECT policy, note it as a follow-up migration (do not change schema in this plan — it is out of scope per the spec) and record the gap in the task's commit message.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors in `src/features/matches`. Fix any introduced.

- [ ] **Step 3: Drive the app (manual, per competition kind)**

Use the `run` skill or `npm run ios`. For a member in each competition kind, confirm: regular league shows the fixture list; a Champions League member sees League Phase + Knockout tabs with two-leg ties showing an aggregate line; a World Cup member sees Groups (with standings) + Knockout. Confirm tab switches trigger zero new network requests (React Query devtools or `console` in `useSeasonMatches`).

- [ ] **Step 4: Update CLAUDE.md**

Replace the "Competition/match display logic" section's file references with the new structure: `MatchesScreen` → `resolveCompetitionShape` (`src/features/matches/model/competitionShape.ts`) → `views/{RegularLeagueView,LeaguePhaseKnockoutView,GroupsKnockoutView,KnockoutOnlyView}.tsx`, fed by `useSeasonMatches` and sliced by `model/selectors.ts` + `model/knockout.ts`. Keep the stage-helper references (`footballStages.ts`).

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for the matches display architecture"
```

---

## Self-Review

**Spec coverage:**
- §2 classifier → Task 1. §3 one-query + selectors → Tasks 3, 4, 5. §4 aggregate ties → Task 2. §4 engines → Tasks 6, 7. §6 views → Task 8. §2/§6 screen switch → Task 9. §7 folder structure + deletions → Tasks 6–10. §8 security → Task 11 Step 1. §10 testing → Tasks 1–3, 5, 9. §12 build sequence → task order matches. §11 out-of-scope (no schema change) respected in Task 11 Step 1.
- Gap noted: §7 lists a `model/stages.ts` / `model/standings.ts` relocation. To limit churn and risk, this plan **keeps** `types/footballStages.ts` and `utils/tournamentMatches.ts` in place and composes them from `model/`. This is a deliberate, smaller-footprint deviation; the behavioural architecture (engines, one query, classifier, aggregate ties) is fully delivered. Flag to the user before executing if strict §7 file relocation is required.

**Placeholder scan:** No TBD/TODO; every code step carries full code. Manual verification steps (Task 11 Step 3, prop-name checks in Tasks 7–8) are explicit instructions, not placeholders.

**Type consistency:** `MatchCardType`, `Tie`, `CompetitionShape`, `GroupsSlice` names are used identically across tasks. `getSeasonMatches` signature matches between Tasks 4 and 5. View prop shapes match `MatchesScreen` usage in Task 9. `HorizontalTabs`/`KnockoutStageTabs`/`GroupTabs` prop names are taken from the real `TournamentTabs.tsx` signatures read during planning; Tasks 7–8 include explicit "verify against the real component" steps to catch drift in `MatchCard`.
