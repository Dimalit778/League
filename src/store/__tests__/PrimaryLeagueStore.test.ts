import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { userStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

const CONTEXT = {
  memberId: 'member-1',
  leagueId: 'league-1',
  competitionId: 42,
  seasonId: 7,
  nickname: 'Dima',
  avatarUrl: 'member-1_123.jpg',
};

describe('PrimaryLeagueStore persistence', () => {
  beforeEach(() => {
    usePrimaryLeagueStore.getState().clearPrimaryLeague();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });
  });

  it('refreshes silently (no blocking spinner) when context is already hydrated', () => {
    usePrimaryLeagueStore.getState().setPrimaryLeague(CONTEXT);

    // Fire init without awaiting: the loading flag is set synchronously before
    // the first await, so we observe the branch the app-layout guard sees.
    void usePrimaryLeagueStore.getState().initializePrimaryLeague();

    expect(usePrimaryLeagueStore.getState().loading).toBe(false);
  });

  it('blocks with a spinner on the cold path (no persisted context)', () => {
    usePrimaryLeagueStore.getState().clearPrimaryLeague();

    void usePrimaryLeagueStore.getState().initializePrimaryLeague();

    expect(usePrimaryLeagueStore.getState().loading).toBe(true);
  });

  it('does not restore old membership after logout while initialization is in flight', async () => {
    let resolveUser!: (value: unknown) => void;
    (supabase.auth.getUser as jest.Mock).mockReturnValueOnce(new Promise((resolve) => { resolveUser = resolve; }));
    const pending = usePrimaryLeagueStore.getState().initializePrimaryLeague();
    usePrimaryLeagueStore.getState().clearPrimaryLeague();
    resolveUser({ data: { user: { id: 'old-user' } }, error: null });
    await pending;
    expect(usePrimaryLeagueStore.getState().memberId).toBeNull();
    expect(usePrimaryLeagueStore.getState().initialized).toBe(false);
  });

  it('persists only the context fields — never the transient flags', () => {
    usePrimaryLeagueStore.getState().setPrimaryLeague(CONTEXT);

    const raw = userStorage.getString('primary-league-store');
    expect(raw).toBeDefined();

    const persisted = JSON.parse(raw as string).state;
    expect(persisted).toEqual(CONTEXT);
    expect(persisted).not.toHaveProperty('loading');
    expect(persisted).not.toHaveProperty('initialized');
  });
});
