# Query Keys Migration Guide

## Step-by-Step Migration Plan

### Phase 1: Critical Bug Fixes (DO FIRST) 🔥

These changes fix actual bugs where cache is not properly scoped.

#### 1.1 Fix Predictions Cache Issues

**File**: `src/features/predictions/hooks/usePredictions.ts`

```typescript
// ❌ BEFORE - Lines 39-43
export const useGetMyPredictionsView = (leagueId: string) => {
  return useQuery({
    queryKey: KEYS.predictions.all, // BUG: Same key for all leagues!
    queryFn: () => predictionService.getMyPredictionsView(leagueId),
    enabled: !!leagueId,
  });
};

// ✅ AFTER - Need to add fixture parameter or restructure
// Option A: If this gets predictions for a specific fixture
export const useGetMyPredictionsView = (leagueId: string, fixture: number) => {
  return useQuery({
    queryKey: KEYS.predictions.byLeagueFixture(leagueId, fixture),
    queryFn: () => predictionService.getMyPredictionsView(leagueId, fixture),
    enabled: !!leagueId && !!fixture,
  });
};

// Option B: If this gets ALL predictions for a league
export const useGetMyPredictionsView = (leagueId: string) => {
  return useQuery({
    queryKey: ['predictions', 'league', leagueId] as const, // Add to KEYS
    queryFn: () => predictionService.getMyPredictionsView(leagueId),
    enabled: !!leagueId,
  });
};
```

```typescript
// ❌ BEFORE - Lines 91-105
export const useMemberPredictionByFixture = (fixtureId: number, memberId: string, userId: string) => {
  return useQuery({
    queryKey: KEYS.predictions.byFixture(fixtureId), // BUG: Missing memberId!
    queryFn: () => {
      if (!userId) throw new Error('User ID is required to fetch prediction');
      return predictionService.getMemberPredictionByFixture(userId, fixtureId);
    },
    enabled: !!userId && !!fixtureId,
  });
};

// ✅ AFTER
export const useMemberPredictionByFixture = (fixtureId: number, memberId: string, userId: string) => {
  return useQuery({
    queryKey: KEYS.predictions.byFixture(memberId, fixtureId), // Fixed!
    queryFn: () => {
      if (!userId) throw new Error('User ID is required to fetch prediction');
      return predictionService.getMemberPredictionByFixture(userId, fixtureId);
    },
    enabled: !!userId && !!fixtureId,
  });
};
```

```typescript
// ❌ BEFORE - Lines 30-32, 61-62
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: KEYS.matches.all }); // Invalidates ALL matches!
},

// ✅ AFTER
onSuccess: (data, variables) => {
  // Only invalidate the specific fixture/match that changed
  queryClient.invalidateQueries({ 
    queryKey: ['matches'], // Partial match - invalidates all matches queries
    refetchType: 'active' // Only refetch currently active queries
  });
},
```

#### 1.2 Fix Competition Fixtures Manual Key

**File**: `src/features/leagues/hooks/useCompetition.ts`

```typescript
// ❌ BEFORE - Lines 16-20
export const useGetCompetitionFixtures = (competitionId: number) => {
  return useQuery({
    queryKey: ['competitions', 'fixtures', competitionId], // Manual key
    queryFn: () => competitionApi.getCompetitionFixtures(competitionId),
    enabled: !!competitionId,
  });
};

// ✅ AFTER
export const useGetCompetitionFixtures = (competitionId: number) => {
  return useQuery({
    queryKey: KEYS.competitions.fixtures(competitionId),
    queryFn: () => competitionApi.getCompetitionFixtures(competitionId),
    enabled: !!competitionId,
  });
};
```

---

### Phase 2: Update Query Keys (Main Migration) 📦

**File**: `src/lib/queryClient.ts`

Replace entire file with the new structure from `queryClient.new.ts`, then:

#### 2.1 Update KEYS Definition

Add missing key for competition fixtures:

```typescript
competitions: {
  all: ['competitions'] as const,
  fixtures: (competitionId: number) => ['competitions', competitionId, 'fixtures'] as const,
},
```

Add missing key for predictions by league (if needed based on 1.1):

```typescript
predictions: {
  byMember: (memberId: string) => ['predictions', 'member', memberId] as const,
  byFixture: (memberId: string, fixture: number) => 
    ['predictions', 'member', memberId, 'fixture', fixture] as const,
  byLeagueFixture: (leagueId: string, fixture: number) => 
    ['predictions', 'league', leagueId, 'fixture', fixture] as const,
  byLeague: (leagueId: string) => 
    ['predictions', 'league', leagueId] as const, // Add this if needed
},
```

---

### Phase 3: Rename for Consistency (Low Risk) 🎨

These are purely cosmetic changes that improve consistency.

#### 3.1 Rename `byId` → `detail`

**Files to update**:
- `src/features/leagues/hooks/useLeagues.ts`
- `src/features/members/hooks/useMembers.ts`

```typescript
// ❌ BEFORE
queryKey: KEYS.leagues.byId(leagueId)
queryKey: KEYS.members.byId(memberId)
queryKey: KEYS.users.byId(userId)

// ✅ AFTER
queryKey: KEYS.leagues.detail(leagueId)
queryKey: KEYS.members.detail(memberId)
queryKey: KEYS.users.detail(userId)
```

#### 3.2 Consolidate User Leagues Keys

**File**: `src/features/leagues/hooks/useLeagues.ts`

```typescript
// ❌ BEFORE - Two different keys for similar data
export const useMyLeagues = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: KEYS.users.myLeagues(userId), // Returns league_members join
    queryFn: () => leagueApi.getMyLeagues(userId),
    enabled: !!userId,
  });
};

export const useMyLeaguesView = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: KEYS.users.leagues(userId), // Returns my_leagues_view
    queryFn: () => leagueApi.getMyLeaguesView(userId),
    enabled: !!userId,
  });
};

// ✅ AFTER - One consistent key
export const useMyLeagues = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: KEYS.users.leagues(userId),
    queryFn: () => leagueApi.getMyLeagues(userId),
    enabled: !!userId,
  });
};

// If you need both, use a 'type' parameter
export const useMyLeaguesView = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: [...KEYS.users.leagues(userId), 'view'] as const,
    queryFn: () => leagueApi.getMyLeaguesView(userId),
    enabled: !!userId,
  });
};
```

#### 3.3 Rename `leagueAndMembers` → `members`

**File**: `src/features/leagues/hooks/useLeagues.ts`

```typescript
// ❌ BEFORE
queryKey: KEYS.leagues.leagueAndMembers(leagueId)

// ✅ AFTER
queryKey: KEYS.leagues.members(leagueId)
```

Update in these files:
- `src/features/leagues/hooks/useLeagues.ts` (lines 47, 71, 170, 199)
- `src/features/members/hooks/useMembers.ts` (line 27)

---

## Testing Checklist

After each phase, test these scenarios:

### Phase 1 Tests (Critical)
- [ ] Switch between leagues and verify leaderboard updates
- [ ] Create prediction in one league, check other leagues aren't affected
- [ ] Update prediction and verify only that fixture refreshes
- [ ] Load competition fixtures and verify caching works

### Phase 2 Tests (Query Keys)
- [ ] All existing queries still work
- [ ] Cache invalidation works correctly
- [ ] No duplicate network requests for same data
- [ ] DevTools shows correct query keys

### Phase 3 Tests (Renames)
- [ ] All features still functional
- [ ] No console errors
- [ ] TypeScript compiles without errors

---

## Rollback Plan

If issues occur, you can quickly rollback:

1. **Keep old queryClient.ts as backup**:
   ```bash
   cp src/lib/queryClient.ts src/lib/queryClient.backup.ts
   ```

2. **If rollback needed**:
   ```bash
   cp src/lib/queryClient.backup.ts src/lib/queryClient.ts
   git checkout src/features/predictions/hooks/usePredictions.ts
   ```

---

## Quick Reference: Before/After

| Old Key | New Key | Notes |
|---------|---------|-------|
| `KEYS.users.byId(id)` | `KEYS.users.detail(id)` | More semantic |
| `KEYS.users.myLeagues(id)` | `KEYS.users.leagues(id)` | Consolidated |
| `KEYS.members.byId(id)` | `KEYS.members.detail(id)` | Consistency |
| `KEYS.members.leaderboard(id)` | `KEYS.leagues.leaderboard(id)` | Logical grouping |
| `KEYS.leagues.byId(id)` | `KEYS.leagues.detail(id)` | Consistency |
| `KEYS.leagues.leagueAndMembers(id)` | `KEYS.leagues.members(id)` | Simpler name |
| `KEYS.matches.byId(id)` | `KEYS.matches.detail(id)` | Consistency |
| `KEYS.matches.byIdWithPredictions(l,m)` | `KEYS.matches.withPredictions(l,m)` | Simpler name |
| `KEYS.matches.all` | ❌ Removed | Use specific queries |
| `KEYS.predictions.all` | ❌ Removed | Use specific queries |
| `KEYS.predictions.byUser(id)` | `KEYS.predictions.byMember(id)` | Clearer |
| `KEYS.predictions.byUserAndMatchday(u,f)` | `KEYS.predictions.byFixture(m,f)` | Clearer params |
| `KEYS.subscriptions.byUser(id)` | `KEYS.subscriptions.detail(id)` | Consistency |
| `['competitions','fixtures',id]` | `KEYS.competitions.fixtures(id)` | Use KEYS |
| `KEYS.admin.leagueMembers` | `KEYS.admin.members` | Simpler name |

---

## Estimated Time

- **Phase 1** (Critical Bugs): 30-45 minutes
- **Phase 2** (Update KEYS): 15 minutes
- **Phase 3** (Renames): 45-60 minutes
- **Testing**: 30 minutes per phase

**Total**: ~3-4 hours for complete migration

