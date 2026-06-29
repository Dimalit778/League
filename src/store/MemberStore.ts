import { memberApi } from '@/features/members/api/membersApi';
import { MemberLeagueType } from '@/features/members/types';
import { KEYS } from '@/lib/queryClient';
import { queryClient } from '@/providers/QueryProvider';
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';

const PRIMARY_MEMBER_STALE_TIME = 5 * 60 * 1000;

type MemberState = {
  activeMember: MemberLeagueType | null;
  setActiveMember: (activeMember: MemberLeagueType | null) => void;
  initializeMember: () => Promise<void>;
  clearMember: () => void;
};

export const selectMemberId = (s: MemberState) => s.activeMember?.id ?? null;
export const selectLeagueId = (s: MemberState) => s.activeMember?.league.id ?? null;
export const selectCompetitionId = (s: MemberState) => s.activeMember?.league.competition.id ?? null;
export const selectCompetition = (s: MemberState) => s.activeMember?.league.competition ?? null;
export const selectMemberUserId = (s: MemberState) => s.activeMember?.user_id ?? null;

export const useMemberStore = create<MemberState>()((set) => ({
  activeMember: null,

  setActiveMember: (activeMember) => set({ activeMember }),

  initializeMember: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ activeMember: null });
      return;
    }

    try {
      const data = await queryClient.fetchQuery({
        queryKey: KEYS.members.primary(user.id),
        queryFn: () => memberApi.getPrimaryMember(user.id),
        staleTime: PRIMARY_MEMBER_STALE_TIME,
      });
      set({ activeMember: data ?? null });
    } catch {
      // Network errors on bootstrap are expected — usePrimaryMember query will retry.
    }
  },

  clearMember: () => set({ activeMember: null }),
}));
