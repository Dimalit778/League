import { createMMKVStorageAdapter, userStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type PrimaryLeagueContext = {
  memberId: string | null;
  leagueId: string | null;
  competitionId: number | null;
  seasonId: number | null;
  nickname: string | null;
  avatarUrl: string | null;
};

type PrimaryLeagueStore = PrimaryLeagueContext & {
  loading: boolean;
  initialized: boolean;

  setPrimaryLeague: (
    context: PrimaryLeagueContext
  ) => void;

  /** Patch display fields after nickname/avatar mutations (avoids full re-init). */
  patchPrimaryMember: (patch: {
    nickname?: string | null;
    avatarUrl?: string | null;
  }) => void;

  initializePrimaryLeague: () => Promise<void>;
  clearPrimaryLeague: () => void;
};

const EMPTY_CONTEXT: PrimaryLeagueContext = {
  memberId: null,
  leagueId: null,
  competitionId: null,
  seasonId: null,
  nickname: null,
  avatarUrl: null,
};

export const usePrimaryLeagueStore =
  create<PrimaryLeagueStore>()(
  persist(
    (set, get) => ({
    ...EMPTY_CONTEXT,

    loading: false,
    initialized: false,

    setPrimaryLeague: (context) => {
      set(context);
    },

    patchPrimaryMember: (patch) => {
      set(patch);
    },

    initializePrimaryLeague: async () => {
      // When context was rehydrated from MMKV we already have something to
      // render, so refresh SILENTLY: keep `loading: false` so the app-layout
      // guard renders the league area immediately instead of flashing a
      // full-screen spinner. Only the true cold path (no persisted context)
      // blocks on the spinner.
      const hasPersistedContext = get().memberId !== null;
      set({
        loading: !hasPersistedContext,
        initialized: false,
      });

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          set({
            ...EMPTY_CONTEXT,
            loading: false,
            initialized: true,
          });

          return;
        }

        const { data: member, error: memberError } =
          await supabase
            .from('league_members')
            .select(`
              id,
              nickname,
              avatar_url,
              league:leagues!inner (
                id,
                competition_id,
                competition:competitions!inner (
                  seasons (
                    id,
                    is_current
                  )
                )
              )
            `)
            .eq('user_id', user.id)
            .eq('is_primary', true)
            .eq('active', true)
            .maybeSingle();

        if (memberError) {
          throw memberError;
        }

        set({
          memberId: member?.id ?? null,
          leagueId: member?.league?.id ?? null,
          competitionId:
            member?.league?.competition_id ?? null,
          seasonId:
            member?.league?.competition?.seasons?.find(
              (season) => season.is_current,
            )?.id ?? null,
          nickname: member?.nickname ?? null,
          avatarUrl: member?.avatar_url ?? null,
          loading: false,
          initialized: true,
        });
      } catch (error) {
        console.error(
          'Failed to initialize active league:',
          error
        );

        set({
          ...EMPTY_CONTEXT,
          loading: false,
          initialized: true,
        });
      }
    },

    clearPrimaryLeague: () => {
      set({
        ...EMPTY_CONTEXT,
        loading: false,
        initialized: false,
      });
    },
  }),
  {
    name: 'primary-league-store',
    storage: createJSONStorage(() => createMMKVStorageAdapter(userStorage)),
    // Bump when the shape of the persisted context below changes.
    version: 1,
    // Persist ONLY the display/routing context — never the transient
    // `loading`/`initialized` flags. Keeping them out means a rehydrated store
    // always starts with `initialized: false`, so `initializePrimaryLeague`
    // still runs on launch to refresh the context against the server.
    partialize: (state) => ({
      memberId: state.memberId,
      leagueId: state.leagueId,
      competitionId: state.competitionId,
      seasonId: state.seasonId,
      nickname: state.nickname,
      avatarUrl: state.avatarUrl,
    }),
  },
));

// Strict hooks for screens that already sit behind the active-league guard.
function requireStoreValue<T>(value: T | null, name: string): T {
  if (value === null) {
    throw new Error(`${name} is missing inside the protected league area`);
  }

  return value;
}

export function useMemberId(): string {
  const memberId = usePrimaryLeagueStore((state) => state.memberId);
  return requireStoreValue(memberId, 'Primary member');
}

export function useLeagueId(): string {
  const leagueId = usePrimaryLeagueStore((state) => state.leagueId);
  return requireStoreValue(leagueId, 'Primary league');
}

export function useCompetitionId(): number {
  const competitionId = usePrimaryLeagueStore((state) => state.competitionId);
  return requireStoreValue(competitionId, 'Primary competition');
}

export function useSeasonId(): number {
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  return requireStoreValue(seasonId, 'Primary season');
}
