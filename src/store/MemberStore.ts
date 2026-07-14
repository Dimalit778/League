import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { useAuthStore } from './AuthStore';

export type PrimaryMemberType = {
  memberId: string;
  userId: string;
  isPrimary: boolean;
  active: boolean;
  nickname: string;
  avatarUrl: string | null;
    createdAt: string;
  leagueId: string;
  leagueName: string;
  competitionId: number;
  competitionName: string;
  competitionLogo: string | null;
  competitionFlag: string | null;
  competitionArea: string | null;
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
export const selectCompetitionId = (s: MemberState) => s.primaryMember?.competitionId;

 
export const useMemberStore = create<MemberState>()((set) => ({
  primaryMember: null,
  loading: false,
  initialized: false,

  setPrimaryMember: (primaryMember) => set({ primaryMember }),

  initializeMember: async () => {
    set({ loading: true, initialized: false });

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
          is_primary,
          active,
          nickname,
          avatar_url,
          created_at,
          league:leagues!league_id(
            id,
            name,
            competition:competitions(id, name, logo, flag, type, area)
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
          isPrimary: data.is_primary,
          active: data.active,
          nickname: data.nickname ,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          leagueId: league.id,
          leagueName: league.name,
          competitionId: competition.id,
          competitionName: competition.name,
          competitionLogo: competition.logo,
          competitionFlag: competition.flag,
          competitionArea: competition.area,
          competitionType: competition.type as 'league' | 'cup',
     
        },
        loading: false,
        initialized: true,
      });
    } catch {
      // Don't keep a stale member from a previous user/league around
      set({
        primaryMember: null,
        loading: false,
        initialized: true,
      });
    }
  },

  clearMember: () => set({ primaryMember: null, loading: false, initialized: false }),
}));

export const usePrimaryMember = () => {
  const primaryMember = useMemberStore(selectPrimaryMember)

  return {
    ...primaryMember,
  };
};
