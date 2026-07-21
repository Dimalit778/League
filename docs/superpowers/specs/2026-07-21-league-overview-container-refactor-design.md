# League Overview — Container/Presentational refactor

**Date:** 2026-07-21
**Status:** Approved design, pending implementation plan

## Goal

Re-engineer `features/league-overview` around a clean **Container / Presentational**
split: one data hook (`useLeagueOverview`) that assembles a typed view-model, a pure
layout screen (`OverviewScreen`), and prop-driven presentational sections. This fixes
the screen's current broken/half-refactored state and gives the three sections
(Header, Stats, Upcoming matches) clear, independently testable boundaries.

## Context (current state)

The Overview screen is one screen composed of three independent sections:
1. **Header** — user + league details + (rank, points, members count)
2. **Stats** — the member's statistics (`StatsPredictionSection`)
3. **Upcoming matches** — today's matches (`UpcomingMatches`)

The presentational components (`Header`, `TopLeaderboardCard`, `UpcomingMatches`,
`QuickAccessSection`) are already pure and prop-driven — good. The problem is the
wiring layer, currently broken by a partial refactor:

- `OverviewScreen.tsx` no longer calls `useLeagueOverview()`; it reads
  `usePrimaryMember` + `useMemberStats` directly, references an **undefined**
  `leaderboard` variable (`OverviewScreen.tsx:18`) in an avatar-prefetch `useMemo`,
  and renders `<UpcomingMatches matches={[]} />` (empty) and `<Header />` (no props).
- `Header.tsx` declares an 11-field props type but destructures only
  `{ rank, points, membersCount }`, then uses `logoUrl` / `flagUrl` / `leagueName`
  which are neither props nor store values → **undefined at runtime**. It also reads
  `nickname`/`avatarUrl` from the store directly.
- `useLeagueOverview.ts` still reads league display fields off the store
  (`leagueName`, `competitionName`, `competitionLogo`, `competitionFlag`, `isPrimary`)
  — fields being removed from the store in a related decision.

There are two competing data paths (`OverviewScreen` vs `useLeagueOverview`) and both
fetch member stats. This must collapse to one.

## Decisions (from brainstorming)

- **League display fields come from React Query, not the store** (consistent with the
  MemberStore trim). `useGetLeagueAndMembers(leagueId)` already returns `league.name`,
  `league.competition.logo`, `league.competition.flag`, and `league.league_members[]`
  — a single query covers all Header league fields **and** `membersCount`.
- **`membersCount` = `league.league_members.length`** from that same query — most
  correct (one row per member) and zero extra query.
- **`nickname` / `avatarUrl` stay in the store** and are read via `usePrimaryMember`.
- **Header becomes fully prop-driven** — `usePrimaryMember` is removed from it.
- **Drop the leaderboard fetch + avatar prefetch** for now (YAGNI): `TopLeaderboardCard`
  and `useGetLeaderboard` are not rendered on the screen and the prefetch is broken.
  `TopLeaderboardCard` stays as a component; it can be added later as another VM slice.

## Design

### Data sources (inside `useLeagueOverview`)

| Source | Provides |
|---|---|
| `useGetLeagueAndMembers(leagueId)` | `leagueName`, `logoUrl`, `flagUrl`, `membersCount` (`league_members.length`) |
| `useMemberStats(memberId)` | `stats` (for `StatsPredictionSection`) + `rank` (`position`) + `points` (`totalPoints`) |
| `useGetTodayMatches({ competitionId, memberId })` | `upcomingMatches` (mapped via `mapMatchToCardData`) |
| store (`usePrimaryMember`) | `nickname`, `avatarUrl`, `memberId`, `leagueId`, `competitionId` |

### View-model returned by the hook

```ts
type LeagueOverviewVM = {
  header: {
    nickname: string;
    avatarUrl: string | null;
    leagueName: string;
    logoUrl: string;
    flagUrl: string;
    rank: number;
    points: number;
    membersCount: number;
  };
  stats: MemberStatsType | undefined;
  upcomingMatches: MatchCardData[];
  isLoading: boolean; // OR of the underlying queries' loading states
};
```

### Files

- **`hooks/useLeagueOverview.ts`** — rewritten. Runs the queries above, reads
  `nickname`/`avatarUrl`/ids from `usePrimaryMember`, and assembles `LeagueOverviewVM`.
  Returns safe defaults (`?? ''`, `?? 0`, `?? []`) so presentational components never
  receive `undefined` for required fields.
- **`screen/OverviewScreen.tsx`** — pure layout. Calls `useLeagueOverview()` and passes
  slices to the sections. No direct `usePrimaryMember`/`useQuery`. Removes the broken
  `leaderboard` `useMemo` and the avatar prefetch.
  ```tsx
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
- **`components/Header.tsx`** — remove `usePrimaryMember`; consume everything via props.
  The props type already lists the needed fields; trim it to exactly what the header
  renders: `nickname`, `avatarUrl`, `leagueName`, `logoUrl`, `flagUrl`, `rank`,
  `points`, `membersCount`. Delete the stray Hebrew comment pasted from chat.

### Error / loading handling

- The hook exposes `isLoading` (OR of the queries). `OverviewScreen` may show a light
  skeleton/placeholder while `isLoading` is true; individual sections already handle
  empty data (`UpcomingMatches` renders an empty state at `matches.length === 0`).
- No hard error screen is added here — the sections degrade gracefully with defaults,
  matching the current UX.

### Testing

- **`useLeagueOverview`** — unit test with mocked queries + store: asserts the VM is
  assembled correctly (`header.membersCount === league_members.length`, `rank`/`points`
  from stats, `upcomingMatches` mapped, `nickname`/`avatarUrl` from store).
- **`OverviewScreen`** — render test with the hook mocked: the three sections render
  without crashing.
- **`Header`** — light render test: shows `rank`, `points`, `membersCount`,
  `leagueName` from props (no store dependency).

## Out of scope (YAGNI)

- `TopLeaderboardCard` as a rendered section (kept as a component for later).
- The MemberStore field trim itself — a related, separately-tracked change. This spec
  only relies on `nickname`/`avatarUrl`/ids remaining in the store and league display
  fields coming from React Query.
- The concurrent-process edits currently floating in the working tree
  (`OverviewScreen`, `StatsPredictionSection`, `memberStats/types`, `memberStatsApi`) —
  those are a separate feature and are not part of this refactor.
