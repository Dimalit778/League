import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { appStorage, createMMKVStorageAdapter } from '@/lib/storage';

/**
 * Persist the react-query cache to MMKV so a cold start renders instantly from
 * disk while the network refetch happens in the background (stale-while-revalidate).
 *
 * IMPORTANT: bump CACHE_BUSTER whenever the SHAPE of any persisted query's data
 * changes (a field renamed/removed in MyLeague, LeagueSummary, subscription
 * access, primary-league, etc.). The old on-disk snapshot is in the previous
 * shape; hydrating it into new code can crash. Changing the buster throws the
 * old snapshot away instead of hydrating an incompatible shape.
 */
const CACHE_BUSTER = 'v1';

const MAX_AGE = 1000 * 60 * 60 * 24; // 24h — drop snapshots older than this

// Only these query-key roots are written to disk. Everything else stays
// memory-only. These roots cover the cold-start critical path: the my-leagues
// screen and the league area.
const PERSISTED_QUERY_ROOTS = new Set<string>([
  'users', // users.leagues, users.leaguesSummary
  'members', // members.primary-league
  'leagues', // league detail / members / leaderboard
  'subscription', // subscription.access (gates the my-leagues UI)
]);

// The full `matches` and `competitions` roots are NOT persisted — they hold
// many heavy sub-caches (per-match details, predictions, AI summaries). But the
// two entries the Matches tab blocks its skeleton on ARE worth persisting so it
// renders the current matchday instantly on a cold start:
//   - the season fixtures list: ['matches', comp, season, 'season', member]
//   - the competition meta:      ['competitions', comp, 'match-meta']
// One season is a few hundred KB of fixtures — small enough for MMKV. The rest
// of the season is refetched in the background (stale-while-revalidate), and
// prefetched via usePrefetchLeagueData. Bump CACHE_BUSTER if MatchListItem or
// the competition-meta shape changes.
const shouldPersistMatchQuery = (queryKey: readonly unknown[]): boolean => {
  const [root] = queryKey;
  if (root === 'matches') return queryKey[3] === 'season';
  if (root === 'competitions') return queryKey[2] === 'match-meta';
  return false;
};

export const queryPersister = createSyncStoragePersister({
  storage: createMMKVStorageAdapter(appStorage),
  key: 'RQ_CACHE',
  // Coalesce writes: never hit disk more than once per second while the user
  // navigates and queries settle.
  throttleTime: 1000,
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryPersister,
  maxAge: MAX_AGE,
  buster: CACHE_BUSTER,
  dehydrateOptions: {
    // Never persist in-flight/paused mutations — only successful query data.
    shouldDehydrateMutation: () => false,
    shouldDehydrateQuery: (query) => {
      if (query.state.status !== 'success') return false;
      const root = query.queryKey[0];
      if (typeof root === 'string' && PERSISTED_QUERY_ROOTS.has(root)) return true;
      return shouldPersistMatchQuery(query.queryKey);
    },
  },
};
