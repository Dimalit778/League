import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/database.types';

import { create } from 'zustand';
type Member = Tables<'league_members'>;
type League = Tables<'leagues'>;
type Competition = Tables<'competitions'>;

interface MemberState {
  member: Member | null;
  league: League | null;
  competition: Competition | null;
  setCompetition: (competition: Competition | null) => void;
  setLeague: (league: League | null) => void;
  setMember: (member: Member | null) => void;
  isLoading: boolean;
  error: string | null;
  clearAll: () => void;
  initializeMemberLeagues: () => Promise<void>;
  refreshMemberData: (userId: string) => Promise<void>;
}

export const useMemberStore = create<MemberState>()((set, get) => ({
  member: null,
  league: null,
  competition: null,
  setCompetition: (competition: Competition | null) =>
    set({ competition: competition }),
  setLeague: (league: League | null) => set({ league: league }),
  setMember: (member: Member | null) => set({ member: member }),
  isLoading: false,
  error: null,
  setIsLoading: (isLoading: boolean) => set({ isLoading: isLoading }),
  setError: (error: string | null) => set({ error: error }),

  clearAll: () =>
    set({
      member: null,
      league: null,
      competition: null,
      isLoading: false,
      error: null,
    }),

  initializeMemberLeagues: async () => {
    set({ isLoading: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('league_members')
      .select(
        '*, league:leagues!league_id(*,competition:competitions!inner(*))'
      )
      .eq('user_id', user?.id as string)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      set({ member: null, league: null, competition: null, isLoading: false });
      return;
    }

    const { league: leagueData, ...memberData } = data;
    const { competition: competitionData, ...leagueOnly } = leagueData;

    set({
      member: memberData as Member,
      league: leagueOnly as League,
      competition: competitionData as Competition,
      isLoading: false,
    });
  },

  refreshMemberData: async (userId: string) => {
    const { data: newPrimaryMember, error } = await supabase
      .from('league_members')
      .select('*, leagues!league_id(*,competition:competitions!inner(*))')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) return console.error('Failed to refresh member data:', error);

    if (!newPrimaryMember) {
      set({ member: null, league: null, competition: null, isLoading: false });
      return;
    }

    const { leagues: leagueData, ...memberData } = newPrimaryMember;
    const { competition: competitionData, ...leagueOnly } = leagueData;

    set({
      member: memberData as Member,
      league: leagueOnly as League,
      competition: competitionData as Competition,
      isLoading: false,
    });
  },
}));
