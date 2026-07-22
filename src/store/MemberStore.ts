import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';

// Only identity/context that drives routing or serves as a query key.
// Display fields (nickname, avatar, league/competition names, logos) live in
// TanStack Query — one source of truth, refetched and invalidated on mutation.
export type PrimaryMemberType = {
  memberId: string;
  userId: string;
  leagueId: string;
  nickname: string;
  avatarUrl: string | null;
  competitionId: number;
  competitionType: 'league' | 'cup';
};

type MemberState = {
  primaryMember: PrimaryMemberType | null;
  loading: boolean;
  initialized: boolean;
  setPrimaryMember: (primaryMember: PrimaryMemberType | null) => void;
  initializeMember: () => Promise<void>;
  clearMember: () => void;
};

export const selectPrimaryMember = (s: MemberState) => s.primaryMember;
export const selectMemberId = (s: MemberState) => s.primaryMember?.memberId;
export const selectMemberUserId = (s: MemberState) => s.primaryMember?.userId;
export const selectLeagueId = (s: MemberState) => s.primaryMember?.leagueId;
export const selectNickname = (s: MemberState) => s.primaryMember?.nickname;
export const selectCompetitionId = (s: MemberState) => s.primaryMember?.competitionId;
export const selectCompetitionType = (s: MemberState) => s.primaryMember?.competitionType;

export const useMemberStore = create<MemberState>()((set) => ({
  primaryMember: null,
  loading: false,
  initialized: false,

  setPrimaryMember: (primaryMember) => set({ primaryMember }),

  initializeMember: async () => {
    const { initialized } = useMemberStore.getState();
    // Only block the app shell on first load — later refreshes must not unmount navigation
    if (!initialized) {
      set({ loading: true });
    }

    const { user } = useAuthStore.getState();
    if (!user) {
      set({ primaryMember: null, loading: false, initialized: true });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('league_members')
        .select(
          `
          id,
          user_id,
          nickname,
          avatar_url,
          league:leagues!league_id(
            id,
            competition:competitions(id, type)
          )
        `,
        )
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data?.league?.id || !data.league.competition?.id) {
        set({ primaryMember: null, loading: false, initialized: true });
        return;
      }

      const { league } = data;
      const { competition } = league;

      set({
        primaryMember: {
          memberId: data.id,
          userId: data.user_id,
          leagueId: league.id,
          nickname: data.nickname,
          avatarUrl: data.avatar_url,
          competitionId: competition.id,
          competitionType: competition.type as 'league' | 'cup',
        },
        loading: false,
        initialized: true,
      });
    } catch {
      // Don't keep a stale member from a previous user/league around
      set({ primaryMember: null, loading: false, initialized: true });
    }
  },

  clearMember: () => set({ primaryMember: null, loading: false, initialized: false }),
}));

export const usePrimaryMember = () => {
  const primaryMember = useMemberStore(selectPrimaryMember);
  if (!primaryMember) {
    throw new Error('Primary member not found');
  }
  return primaryMember;
};