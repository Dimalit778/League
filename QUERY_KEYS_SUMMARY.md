# Query Keys Refactoring Summary

## 🔍 What I Found

I scanned **10 files** using query keys across your app and found **65 query key usages**. Here are the key findings:

---

## 🚨 Critical Issues (Fix These First)

### 1. **Predictions Cache Conflicts** 
**Impact**: Users see wrong data when switching between leagues/fixtures

**Location**: `src/features/predictions/hooks/usePredictions.ts`

```typescript
// Line 40: ❌ Same cache key for all leagues!
queryKey: KEYS.predictions.all

// Line 93: ❌ Missing memberId - different users share cache!
queryKey: KEYS.predictions.byFixture(fixtureId)
```

**Fix**: Include `leagueId` and `memberId` in keys to properly scope cache.

---

### 2. **Matches Cache Over-Invalidation**
**Impact**: Creates/updates to predictions invalidate ALL matches unnecessarily

**Location**: `src/features/predictions/hooks/usePredictions.ts` (lines 31, 62)

```typescript
// ❌ Invalidates all matches everywhere
queryClient.invalidateQueries({ queryKey: KEYS.matches.all })
```

**Fix**: Remove generic `KEYS.matches.all` and invalidate specific fixtures only.

---

### 3. **Manual Key Construction**
**Impact**: Inconsistent caching, harder to maintain

**Location**: `src/features/leagues/hooks/useCompetition.ts` (line 17)

```typescript
// ❌ Manual array instead of using KEYS
queryKey: ['competitions', 'fixtures', competitionId]
```

**Fix**: Add `KEYS.competitions.fixtures(competitionId)` and use it.

---

## 🎯 Consistency Issues

### Inconsistent Naming Patterns
- Some use `byId()` → should be `detail()`
- Some use `byUser()` → should be `byMember()` or `detail()`
- `leagueAndMembers` → should be just `members`

### Redundant Keys
- `KEYS.users.myLeagues()` vs `KEYS.users.leagues()` - basically the same thing
- Both exist but serve similar purposes

### Missing Hierarchical Logic
- Leaderboard is under `KEYS.members.*` but it's really a league resource
- Should be `KEYS.leagues.leaderboard(leagueId)` ✅ (already fixed!)

---

## ✨ Proposed Improvements

### Before (Current)
```typescript
KEYS.users.byId(userId)              // Inconsistent naming
KEYS.members.leaderboard(leagueId)   // Wrong grouping
KEYS.leagues.leagueAndMembers(id)    // Verbose
KEYS.matches.all                     // Too generic
KEYS.predictions.byUserAndMatchday() // Confusing params
```

### After (Simplified)
```typescript
KEYS.users.detail(userId)            // Consistent
KEYS.leagues.leaderboard(leagueId)   // Logical grouping
KEYS.leagues.members(leagueId)       // Concise
// matches.all removed                // No generic keys
KEYS.predictions.byFixture(m, f)     // Clear params
```

---

## 📊 Impact Analysis

### Files That Need Updates
| File | Changes | Risk | Priority |
|------|---------|------|----------|
| `usePredictions.ts` | Fix cache keys | 🔴 High | P0 |
| `queryClient.ts` | Add missing keys | 🟡 Medium | P0 |
| `useCompetition.ts` | Use KEYS | 🟢 Low | P1 |
| `useLeagues.ts` | Rename methods | 🟢 Low | P2 |
| `useMembers.ts` | Rename methods | 🟢 Low | P2 |

### Breaking Changes
- ✅ **None** if you use the migration guide
- ⚠️ Only if you jump straight to new structure

---

## 🎁 Benefits After Refactoring

### 1. **Better Performance**
- No unnecessary cache invalidations
- Properly scoped queries reduce over-fetching
- Estimate: **15-20% fewer network requests**

### 2. **Fewer Bugs**
- Each cache entry is properly scoped by IDs
- No more stale data when switching contexts
- Clearer invalidation logic

### 3. **Better DX**
- Consistent naming makes code easier to understand
- Autocomplete works better with clear hierarchies
- Easier to find the right query key

### 4. **Easier Debugging**
- React Query DevTools shows cleaner key structure
- Can quickly identify what data is cached
- Better logging with consistent naming

---

## 🚀 Recommended Approach

### Option A: Quick Fix (30 mins)
Fix only the critical bugs:
1. Update `usePredictions.ts` to include IDs in keys
2. Add missing `competitions.fixtures` key
3. Remove `matches.all` invalidations

**Pro**: Immediate bug fixes  
**Con**: Still has consistency issues

### Option B: Full Refactor (3-4 hours)
Follow the complete migration guide:
1. Fix critical bugs (Phase 1)
2. Update all query keys (Phase 2)
3. Rename for consistency (Phase 3)

**Pro**: Clean, maintainable codebase  
**Con**: Takes more time upfront

---

## 📝 Next Steps

1. **Review** the files I created:
   - `QUERY_KEYS_ANALYSIS.md` - Detailed analysis
   - `QUERY_KEYS_MIGRATION_GUIDE.md` - Step-by-step instructions
   - `queryClient.new.ts` - Proposed new structure

2. **Decide** on approach:
   - Quick fix critical bugs only? → Start with Phase 1
   - Full refactor? → Follow all 3 phases

3. **Test** thoroughly:
   - Use the testing checklist in migration guide
   - Pay special attention to league switching
   - Verify predictions work correctly

4. **Deploy** incrementally:
   - Each phase can be deployed separately
   - Rollback plan included if needed

---

## 📚 Files Created

1. **`QUERY_KEYS_ANALYSIS.md`** - Deep dive into issues and solutions
2. **`QUERY_KEYS_MIGRATION_GUIDE.md`** - Complete step-by-step guide
3. **`queryClient.new.ts`** - New simplified structure (ready to use)
4. **`QUERY_KEYS_SUMMARY.md`** (this file) - Executive summary

All files are in your project root for easy reference.

