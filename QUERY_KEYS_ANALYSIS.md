# Query Keys Analysis & Refactoring Plan

## Current Issues

### 1. **Missing IDs in Query Keys** ❌

These queries don't include the relevant IDs, causing cache conflicts:

- `KEYS.predictions.all` - Used in `useGetMyPredictionsView` but needs `leagueId`
- `KEYS.predictions.byFixture(fixtureId)` - Missing `memberId` in `useMemberPredictionByFixture`
- `KEYS.matches.all` - Too generic, invalidates everything unnecessarily

### 2. **Redundant/Confusing Keys** 🔄

- `KEYS.users.myLeagues(userId)` vs `KEYS.users.leagues(userId)` - Similar but different endpoints

### 3. **Inconsistent Patterns** 🎯

- Some use functions: `KEYS.members.byId(memberId)`
- Some are constants: `KEYS.competitions.all`
- Fallback patterns are verbose: `userId ? KEYS.subscriptions.byUser(userId) : (['subscriptions', 'unknown'] as const)`

### 4. **Manual Key Construction** 🔧

- Line 17 in `useCompetition.ts`: `['competitions', 'fixtures', competitionId]` should use KEYS

---

## Proposed Simplified Structure

```typescript
export const KEYS = {
  // Users
  users: {
    all: ['users'] as const,
    detail: (userId: string) => ['users', userId] as const,
    leagues: (userId: string) => ['users', userId, 'leagues'] as const,
  },

  // Members
  members: {
    detail: (memberId: string) => ['members', memberId] as const,
    primary: (userId: string) => ['members', 'primary', userId] as const,
    stats: (memberId: string) => ['members', memberId, 'stats'] as const,
    predictions: (memberId: string) => ['members', memberId, 'predictions'] as const,
  },

  // Leagues
  leagues: {
    all: ['leagues'] as const,
    detail: (leagueId: string) => ['leagues', leagueId] as const,
    byJoinCode: (code: string) => ['leagues', 'code', code] as const,
    members: (leagueId: string) => ['leagues', leagueId, 'members'] as const,
    leaderboard: (leagueId: string) => ['leagues', leagueId, 'leaderboard'] as const,
  },

  // Matches
  matches: {
    detail: (matchId: number) => ['matches', matchId] as const,
    byFixture: (competitionId: number, fixture: number, memberId?: string) =>
      ['matches', competitionId, 'fixture', fixture, ...(memberId ? ['member', memberId] : [])] as const,
    withPredictions: (leagueId: string, matchId: number) => ['matches', matchId, 'predictions', leagueId] as const,
  },

  // Predictions
  predictions: {
    byMember: (memberId: string) => ['predictions', 'member', memberId] as const,
    byFixture: (memberId: string, fixture: number) => ['predictions', 'member', memberId, 'fixture', fixture] as const,
    byLeagueFixture: (leagueId: string, fixture: number) =>
      ['predictions', 'league', leagueId, 'fixture', fixture] as const,
  },

  // Competitions
  competitions: {
    all: ['competitions'] as const,
    fixtures: (competitionId: number) => ['competitions', competitionId, 'fixtures'] as const,
  },

  // Subscriptions
  subscriptions: {
    detail: (userId: string) => ['subscriptions', userId] as const,
    canCreateLeague: (userId: string) => ['subscriptions', userId, 'can-create'] as const,
  },

  // Admin
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: ['admin', 'users'] as const,
    leagues: ['admin', 'leagues'] as const,
    members: ['admin', 'members'] as const,
    predictions: ['admin', 'predictions'] as const,
    competitions: ['admin', 'competitions'] as const,
  },
} as const;
```

---

## Key Benefits

### ✅ **Simpler & More Consistent**

- All detail queries use `.detail()` pattern
- All listing queries use descriptive names
- Hierarchical structure: resource → scope → identifier

### ✅ **Proper Cache Scoping**

- Each query has unique key including all relevant IDs
- No more generic `matches.all` or `predictions.all`
- League-specific data includes `leagueId`

### ✅ **Better Developer Experience**

- Clearer naming: `byId` → `detail`, `byUser` → `detail`
- Consistent ordering: always entity → type → id → relation
- No more verbose fallback patterns needed

### ✅ **Easier Invalidation**

```typescript
// Before (invalidates all leaderboards across all leagues)
queryClient.invalidateQueries({ queryKey: KEYS.members.leaderboard });

// After (invalidates specific league's leaderboard)
queryClient.invalidateQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) });
```

---

## Migration Changes Required

### High Priority (Fixes Bugs)

1. **`useGetMyPredictionsView`** - Add `leagueId` to key

   ```typescript
   // Current: KEYS.predictions.all (❌ causes cache conflicts)
   // New: KEYS.predictions.byLeagueFixture(leagueId, fixture)
   ```

2. **`useMemberPredictionByFixture`** - Include `memberId`

   ```typescript
   // Current: KEYS.predictions.byFixture(fixtureId) (❌ missing memberId)
   // New: KEYS.predictions.byFixture(memberId, fixtureId)
   ```

3. **Leaderboard** - Move from members to leagues (✅ Already fixed!)
   ```typescript
   // Current: KEYS.members.leaderboard(leagueId)
   // New: KEYS.leagues.leaderboard(leagueId) (more logical grouping)
   ```

### Medium Priority (Consistency)

4. **Competition Fixtures** - Use KEYS instead of manual array
5. **Admin Users Pagination** - Simplify key structure
6. **User leagues** - Consolidate `myLeagues` and `leagues`

### Low Priority (Nice to Have)

7. **Rename `byId` → `detail`** - More semantic
8. **Remove TOKENS.pending/me** - Use explicit undefined handling
9. **Standardize invalidation patterns** - Use `queryKey` prefix matching

---

## Migration Risk Assessment

- **High Risk**: Changes to core queries (members, leagues, matches)
- **Medium Risk**: Predictions and competitions
- **Low Risk**: Admin, subscriptions (less critical features)

**Recommendation**: Migrate incrementally, testing each domain separately.
