import { MemberLeagueType } from '@/features/members/types';
import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';

type MemberState = {
  activeMember: MemberLeagueType | null;
  memberId?: string | null;
  leagueId?: string | null;
  userId?: string | null;
  competitionId?: number | null;

  setActiveMember: (activeMember: MemberLeagueType | null) => void;
  initializeMember: () => Promise<void>;
  clearMember: () => void;
};

export const useMemberStore = create<MemberState>()((set) => ({
  activeMember: null,
  memberId: null,
  leagueId: null,
  userId: null,
  competitionId: null,

  setActiveMember: (activeMember) => {
    set({
      activeMember,
      memberId: activeMember?.id,
      leagueId: activeMember?.league.id,
      userId: activeMember?.user_id,
      competitionId: activeMember?.league.competition.id,
    });
  },

  initializeMember: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({
        activeMember: null,
        memberId: null,
        leagueId: null,
        userId: null,
        competitionId: null,
      });
      return;
    }

    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues!league_id(*, competition:competitions(*))')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) {
      console.error('initializeMember error', error);
    }

    const activeMember = data ?? null;

    set({
      activeMember,
      memberId: activeMember?.id,
      leagueId: activeMember?.league.id,
      userId: activeMember?.user_id,
      competitionId: activeMember?.league.competition.id,
    });
  },

  clearMember: () =>
    set({
      activeMember: null,
      memberId: null,
      leagueId: null,
      userId: null,
      competitionId: null,
    }),
}));
