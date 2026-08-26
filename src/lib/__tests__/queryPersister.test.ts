import { persistOptions } from '@/lib/queryPersister';
import { KEYS } from '@/lib/queryClient';

// The dehydrate predicate is the security/perf-critical part: it decides which
// query data reaches disk. Persisting the wrong root leaks data across users or
// bloats the snapshot, so it is worth pinning down directly.
const shouldDehydrate = persistOptions.dehydrateOptions!.shouldDehydrateQuery!;

const makeQuery = (queryKey: readonly unknown[], status = 'success') =>
  ({ queryKey, state: { status } }) as never;

describe('queryPersister shouldDehydrateQuery', () => {
  it('persists the cold-start critical-path queries', () => {
    expect(shouldDehydrate(makeQuery(KEYS.users.leagues('u1')))).toBe(true);
    expect(shouldDehydrate(makeQuery(KEYS.users.leaguesSummary('u1')))).toBe(true);
    expect(shouldDehydrate(makeQuery(KEYS.members.primaryLeague('u1')))).toBe(true);
    expect(shouldDehydrate(makeQuery(KEYS.leagues.leaderboard('l1')))).toBe(true);
    expect(shouldDehydrate(makeQuery(KEYS.subscription.access('u1')))).toBe(true);
  });

  it('persists the Matches-tab cold-start entries (season fixtures + meta)', () => {
    expect(shouldDehydrate(makeQuery(KEYS.matches.season(1, 2, 'm1')))).toBe(true);
    expect(shouldDehydrate(makeQuery(KEYS.competitions.matchMeta(1)))).toBe(true);
  });

  it('never persists the other heavy caches (match detail, predictions, ai)', () => {
    expect(shouldDehydrate(makeQuery(KEYS.matches.withPredictions('l1', 99)))).toBe(false);
    expect(shouldDehydrate(makeQuery(KEYS.matches.aiSummary(99)))).toBe(false);
    expect(shouldDehydrate(makeQuery(KEYS.predictions.byMember('m1')))).toBe(false);
    expect(shouldDehydrate(makeQuery(KEYS.competitions.all))).toBe(false);
    expect(shouldDehydrate(makeQuery(KEYS.admin.dashboard))).toBe(false);
  });

  it('does not persist queries that have not succeeded', () => {
    expect(shouldDehydrate(makeQuery(KEYS.users.leagues('u1'), 'pending'))).toBe(false);
    expect(shouldDehydrate(makeQuery(KEYS.users.leagues('u1'), 'error'))).toBe(false);
  });

  it('ignores a non-string query-key root', () => {
    expect(shouldDehydrate(makeQuery([123, 'leagues']))).toBe(false);
  });

  it('does not persist mutations', () => {
    expect(persistOptions.dehydrateOptions!.shouldDehydrateMutation!({} as never)).toBe(false);
  });
});
