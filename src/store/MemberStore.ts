import { MemberLeagueType } from '@/features/members/types';
import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';

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
      const { data, error } = await supabase
        .from('league_members')
        .select('*, league:leagues!league_id(*, competition:competitions(*))')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;
      set({ activeMember: data ?? null });
    } catch {
      // Network errors on bootstrap are expected — usePrimaryMember query will retry.
    }
  },

  clearMember: () => set({ activeMember: null }),
}));
