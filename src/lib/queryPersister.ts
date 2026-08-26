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
// memory-only. We deliberately EXCLUDE the heavy caches — `matches` (a whole
// season of fixtures) and `predictions` — so the snapshot stays small and
// hydrate stays fast. These roots cover the cold-start critical path: the
// my-leagues screen and the league area.
const PERSISTED_QUERY_ROOTS = new Set<string>([
  'users', // users.leagues, users.leaguesSummary
  'members', // members.primary-league
  'leagues', // league detail / members / leaderboard
  'subscription', // subscription.access (gates the my-leagues UI)
]);

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
      return typeof root === 'string' && PERSISTED_QUERY_ROOTS.has(root);
    },
  },
};
