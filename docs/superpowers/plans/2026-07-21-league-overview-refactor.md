# League Overview Container Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-engineer `features/league-overview` into a clean Container/Presentational split — one data hook assembles a typed view-model, a pure screen composes prop-driven sections — fixing the currently broken wiring.

**Architecture:** `useLeagueOverview()` runs all queries and returns a `LeagueOverviewVM` with a `header` slice, `stats`, and `upcomingMatches`. `OverviewScreen` is pure layout. `Header` becomes fully prop-driven (no store access). League display fields + members count come from a single `useGetLeagueAndMembers(leagueId)` query.

**Tech Stack:** Expo React Native, expo-router, TanStack Query, Zustand (MemberStore), NativeWind, jest-expo (global mocks in `jest.setup.ts`).

## Global Constraints

- All user-facing strings via `useTranslation()` / `t(key)`; keys in `src/lib/i18n/translations.ts`.
- Query keys only via `KEYS.*` from `src/lib/queryClient.ts`.
- `usePrimaryMember()` throws if no primary member — only call it inside the `(league)` subtree (Overview is there).
- Presentational components must not read the store — data flows in via props.
- `nickname`/`avatarUrl` are read from the store (`usePrimaryMember`); league display fields (`leagueName`, `logoUrl`, `flagUrl`) come from React Query.
- Tests colocate in `__tests__/`; heavy native modules globally mocked in `jest.setup.ts`. Run a file with `npx jest <path>`.
- Lint with `npm run lint`; do not commit files edited by the concurrent process (`memberStats/types`, `memberStats/components/StatsPredictionSection`, `memberStats/api/memberStatsApi`, and any `OverviewScreen` edits not made here) — stage only the files each task names.

---

### Task 1: Define the view-model type

**Files:**
- Modify: `src/features/leagues/types/leagueOverviewType.ts` (replace contents)

**Interfaces:**
- Consumes: `MatchCardData` from `@/features/matches/utils/matchCard.mapper`; `MemberStatsType` from `@/features/memberStats/types`.
- Produces: `LeagueOverviewHeader` and `LeagueOverviewVM` types used by the hook, screen, and Header.

- [ ] **Step 1: Replace the type file**

Replace the entire contents of `src/features/leagues/types/leagueOverviewType.ts` with:
```ts
import { MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { MemberStatsType } from '@/features/memberStats/types';

export type LeagueOverviewHeader = {
  nickname: string;
  avatarUrl: string | null;
  leagueName: string;
  logoUrl: string;
  flagUrl: string;
  rank: number;
  points: number;
  membersCount: number;
};

export type LeagueOverviewVM = {
  header: LeagueOverviewHeader;
  stats: MemberStatsType | undefined;
  upcomingMatches: MatchCardData[];
  isLoading: boolean;
};
```

- [ ] **Step 2: Typecheck the file**

Run: `npx tsc --noEmit 2>&1 | grep "leagueOverviewType"`
Expected: no output (the file itself has no type errors). Consumers (`useLeagueOverview`, `Header`) will error until Tasks 2–3 — that is expected and not checked here.

- [ ] **Step 3: Commit**

```bash
git add src/features/leagues/types/leagueOverviewType.ts
git commit -m "refactor(league-overview): define LeagueOverviewVM view-model type

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Make Header fully prop-driven

**Files:**
- Modify: `src/features/league-overview/components/Header.tsx`
- Test: `src/features/league-overview/components/__tests__/Header.test.tsx` (create)

**Interfaces:**
- Consumes: `LeagueOverviewHeader` from `@/features/leagues/types/leagueOverviewType`.
- Produces: `Header` (default export) — a pure component taking `LeagueOverviewHeader` props.

- [ ] **Step 1: Write the failing test**

Create `src/features/league-overview/components/__tests__/Header.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import Header from '@/features/league-overview/components/Header';

const props = {
  nickname: 'Tester',
  avatarUrl: null,
  leagueName: 'My League',
  logoUrl: '',
  flagUrl: '',
  rank: 3,
  points: 42,
  membersCount: 8,
};

describe('Header (league overview)', () => {
  it('renders league name, rank, points and members count from props', () => {
    const { queryByText, queryAllByText } = render(<Header {...props} />);
    expect(queryAllByText('My League').length).toBeGreaterThan(0); // shown twice (title + subtitle)
    expect(queryByText('#3')).toBeTruthy();
    expect(queryByText('42')).toBeTruthy();
    expect(queryByText('8')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/league-overview/components/__tests__/Header.test.tsx`
Expected: FAIL — Header currently reads `usePrimaryMember` and uses undefined `logoUrl`/`leagueName`; without the store mock it throws "Primary member not found" (or renders undefined text).

- [ ] **Step 3: Rewrite Header to be prop-driven**

In `src/features/league-overview/components/Header.tsx`:

Remove the store import line:
```tsx
import { usePrimaryMember } from '@/store/MemberStore';
```

Replace the `HeaderProps` type block with an import + alias:
```tsx
import { LeagueOverviewHeader } from '@/features/leagues/types/leagueOverviewType';
```
and delete the local `type HeaderProps = { ... }` declaration.

Change the function signature and delete the store read + stray comment. Replace:
```tsx
export default function Header({ rank, points, membersCount }: HeaderProps) {
  const { colors } = useThemeTokens();
  // ✅ צריך כמה שדות + רוצה את ההבטחה של non-null
  const { memberId, nickname, avatarUrl, leagueId } = usePrimaryMember();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
```
with:
```tsx
export default function Header({
  nickname,
  avatarUrl,
  leagueName,
  logoUrl,
  flagUrl,
  rank,
  points,
  membersCount,
}: LeagueOverviewHeader) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
```

The JSX already references `logoUrl`, `flagUrl`, `leagueName`, `nickname`, `avatarUrl`, `rank`, `points`, `membersCount` — now all satisfied by props. No JSX changes needed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/league-overview/components/__tests__/Header.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit 2>&1 | grep "Header.tsx"` → expect no output for `league-overview/components/Header.tsx`.
Run: `npx eslint src/features/league-overview/components/Header.tsx` → no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/league-overview/components/Header.tsx src/features/league-overview/components/__tests__/Header.test.tsx
git commit -m "refactor(league-overview): make Header pure prop-driven

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Rewrite useLeagueOverview to assemble the VM

**Files:**
- Modify: `src/features/league-overview/hooks/useLeagueOverview.ts` (replace contents)
- Test: `src/features/league-overview/hooks/__tests__/useLeagueOverview.test.tsx` (create)

**Interfaces:**
- Consumes: `useGetLeagueAndMembers(leagueId)` from `@/features/leagues/hooks/useLeagues` (returns `{ data: league }` with `league.name`, `league.competition.logo`, `league.competition.flag`, `league.league_members[]`); `useMemberStats(memberId)` from `@/features/memberStats/hooks/useMemberStats` (`data.position`, `data.totalPoints`); `useGetTodayMatches({ competitionId, memberId })` from `@/features/matches/hooks/useMatches`; `mapMatchToCardData` from `@/features/matches/utils/matchCard.mapper`; `usePrimaryMember` from `@/store/MemberStore`; `LeagueOverviewVM` from Task 1.
- Produces: `useLeagueOverview(): LeagueOverviewVM`.

- [ ] **Step 1: Write the failing test**

Create `src/features/league-overview/hooks/__tests__/useLeagueOverview.test.tsx`:
```tsx
import { renderHook } from '@testing-library/react-native';
import { useLeagueOverview } from '@/features/league-overview/hooks/useLeagueOverview';

jest.mock('@/store/MemberStore', () => ({
  usePrimaryMember: () => ({
    memberId: 'm1',
    leagueId: 'l1',
    competitionId: 39,
    nickname: 'tester',
    avatarUrl: 'a.png',
  }),
}));

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetLeagueAndMembers: () => ({
    data: {
      name: 'My League',
      competition: { logo: 'logo.png', flag: 'flag.png' },
      league_members: [{ id: '1' }, { id: '2' }, { id: '3' }],
    },
    isLoading: false,
  }),
}));

jest.mock('@/features/memberStats/hooks/useMemberStats', () => ({
  useMemberStats: () => ({
    data: { totalPoints: 42, position: 3 },
    isLoading: false,
  }),
}));

jest.mock('@/features/matches/hooks/useMatches', () => ({
  useGetTodayMatches: () => ({ data: [], isLoading: false }),
}));

describe('useLeagueOverview', () => {
  it('assembles the header slice from queries + store', () => {
    const { result } = renderHook(() => useLeagueOverview());
    const { header } = result.current;
    expect(header.leagueName).toBe('My League');
    expect(header.logoUrl).toBe('logo.png');
    expect(header.flagUrl).toBe('flag.png');
    expect(header.membersCount).toBe(3);
    expect(header.rank).toBe(3);
    expect(header.points).toBe(42);
    expect(header.nickname).toBe('tester');
    expect(header.avatarUrl).toBe('a.png');
  });

  it('returns mapped (empty) upcoming matches and combined loading', () => {
    const { result } = renderHook(() => useLeagueOverview());
    expect(result.current.upcomingMatches).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/league-overview/hooks/__tests__/useLeagueOverview.test.tsx`
Expected: FAIL — current hook returns the old `LeagueOverviewData` shape (`league`, `memberStats`, `leaderboard`, `todayMatches`), so `result.current.header` is undefined.

- [ ] **Step 3: Rewrite the hook**

Replace the entire contents of `src/features/league-overview/hooks/useLeagueOverview.ts` with:
```ts
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { LeagueOverviewVM } from '@/features/leagues/types/leagueOverviewType';
import { useGetTodayMatches } from '@/features/matches/hooks/useMatches';
import { mapMatchToCardData } from '@/features/matches/utils/matchCard.mapper';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';
import { usePrimaryMember } from '@/store/MemberStore';

export function useLeagueOverview(): LeagueOverviewVM {
  const { memberId, leagueId, competitionId, nickname, avatarUrl } = usePrimaryMember();

  const { data: league, isLoading: leagueLoading } = useGetLeagueAndMembers(leagueId);
  const { data: stats, isLoading: statsLoading } = useMemberStats(memberId);
  const { data: todayMatches, isLoading: matchesLoading } = useGetTodayMatches({
    competitionId,
    memberId,
  });

  return {
    header: {
      nickname: nickname ?? '',
      avatarUrl: avatarUrl ?? null,
      leagueName: league?.name ?? '',
      logoUrl: league?.competition?.logo ?? '',
      flagUrl: league?.competition?.flag ?? '',
      rank: stats?.position ?? 0,
      points: stats?.totalPoints ?? 0,
      membersCount: league?.league_members?.length ?? 0,
    },
    stats,
    upcomingMatches: (todayMatches ?? []).map(mapMatchToCardData),
    isLoading: leagueLoading || statsLoading || matchesLoading,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/league-overview/hooks/__tests__/useLeagueOverview.test.tsx`
Expected: PASS (both cases).

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit 2>&1 | grep "useLeagueOverview.ts"` → expect no output.
Run: `npx eslint src/features/league-overview/hooks/useLeagueOverview.ts` → no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/league-overview/hooks/useLeagueOverview.ts src/features/league-overview/hooks/__tests__/useLeagueOverview.test.tsx
git commit -m "refactor(league-overview): assemble view-model in useLeagueOverview

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Make OverviewScreen a pure layout

**Files:**
- Modify: `src/features/league-overview/screen/OverviewScreen.tsx` (replace contents)
- Test: `src/features/league-overview/screen/__tests__/OverviewScreen.test.tsx` (create)

**Interfaces:**
- Consumes: `useLeagueOverview` (Task 3); `Header` (Task 2); `UpcomingMatches` from `../components/Upcoming-matches`; `StatsPredictionSection` from `@/features/memberStats/components/StatsPredictionSection`; `Screen` from `@/components/layout`.
- Produces: `OverviewScreen` (default export) rendering the three sections.

- [ ] **Step 1: Write the failing test**

Create `src/features/league-overview/screen/__tests__/OverviewScreen.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import OverviewScreen from '@/features/league-overview/screen/OverviewScreen';

jest.mock('@/features/league-overview/hooks/useLeagueOverview', () => ({
  useLeagueOverview: () => ({
    header: {
      nickname: 'Tester',
      avatarUrl: null,
      leagueName: 'My League',
      logoUrl: '',
      flagUrl: '',
      rank: 3,
      points: 42,
      membersCount: 8,
    },
    stats: undefined,
    upcomingMatches: [],
    isLoading: false,
  }),
}));

// Heavy SVG section — stub so the screen test focuses on composition.
jest.mock('@/features/memberStats/components/StatsPredictionSection', () => {
  const { Text } = require('react-native');
  return { StatsPredictionSection: () => <Text>stats-section</Text> };
});

describe('OverviewScreen', () => {
  it('renders the three sections without crashing', () => {
    const { queryByText, queryAllByText } = render(<OverviewScreen />);
    expect(queryAllByText('My League').length).toBeGreaterThan(0); // Header
    expect(queryByText('stats-section')).toBeTruthy(); // Stats
    expect(queryByText('No matches today')).toBeTruthy(); // UpcomingMatches empty state
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/league-overview/screen/__tests__/OverviewScreen.test.tsx`
Expected: FAIL — current screen references an undefined `leaderboard` and renders `<Header />` without props, so it throws before the sections render.

- [ ] **Step 3: Rewrite the screen**

Replace the entire contents of `src/features/league-overview/screen/OverviewScreen.tsx` with:
```tsx
import { Screen } from '@/components/layout';
import { StatsPredictionSection } from '@/features/memberStats/components/StatsPredictionSection';
import { ScrollView } from 'react-native';
import Header from '../components/Header';
import { UpcomingMatches } from '../components/Upcoming-matches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const vm = useLeagueOverview();

  return (
    <Screen>
      <Header {...vm.header} />
      <ScrollView className="flex-1">
        <StatsPredictionSection stats={vm.stats} />
        <UpcomingMatches matches={vm.upcomingMatches} />
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/league-overview/screen/__tests__/OverviewScreen.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + lint + related tests**

Run: `npx tsc --noEmit 2>&1 | grep -E "league-overview"` → expect no output.
Run: `npx eslint src/features/league-overview/screen/OverviewScreen.tsx` → no errors.
Run: `npx jest src/features/league-overview` → all league-overview tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/league-overview/screen/OverviewScreen.tsx src/features/league-overview/screen/__tests__/OverviewScreen.test.tsx
git commit -m "refactor(league-overview): make OverviewScreen a pure layout

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Build verification

**Files:** none (verification only).

- [ ] **Step 1: Force a full iOS bundle**

Run: `npx expo export --platform ios --output-dir "$TMPDIR/lo-export"`
Expected: `Exported: …` with no unresolved-module / broken-route errors. This confirms the rewritten hook/screen/Header and the removed `leaderboard`/prefetch leave the app bundling cleanly.

- [ ] **Step 2: Clean up**

Run: `rm -rf "$TMPDIR/lo-export"`

---

## Self-Review

- **Spec coverage:** VM type → Task 1; single-query header + membersCount → Task 3; Header prop-driven → Task 2; pure screen + breakage removal → Task 4; drop leaderboard/prefetch → Task 4 (screen rewrite omits them); tests for hook/screen/Header → Tasks 2–4; build verification → Task 5. All spec sections covered.
- **Placeholder scan:** No TBD/TODO; every code step shows full code.
- **Type consistency:** `LeagueOverviewVM`/`LeagueOverviewHeader` defined in Task 1 and consumed identically in Tasks 2–4. Field names (`membersCount`, `logoUrl`, `flagUrl`, `upcomingMatches`, `stats`, `isLoading`) match across the type, hook, Header, and screen. `stats.position`→`rank`, `stats.totalPoints`→`points` consistent with `MemberStatsType`.
- **Hygiene note:** Each commit stages only the files it names — the concurrent-process edits (`memberStats/*`) are never staged.
