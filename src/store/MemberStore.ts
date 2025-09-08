import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leagueService } from '@/services/leagueService';
import {
  createLeagueParams,
  createLeagueResponse,
  joinLeagueResponse,
  leaveLeagueResponse,
  MemberLeague,
} from '@/types';
import { QueryClient } from '@tanstack/react-query';
import { create } from 'zustand';

interface MemberState {
  member: MemberLeague | null;
  setMember: (member: MemberLeague | null) => void;
  isLoading: boolean;
  error: string | null;
  clearAll: () => void;
  initializeMemberLeagues: () => Promise<void>;

  createLeague: (
    queryClient: QueryClient,
    userId: string,
    params: createLeagueParams
  ) => Promise<createLeagueResponse>;
  joinLeague: (
    queryClient: QueryClient,
    userId: string,
    joinCode: string,
    nickname: string
  ) => Promise<joinLeagueResponse>;
  leaveLeague: (
    queryClient: QueryClient,
    userId: string,
    leagueId: string
  ) => Promise<leaveLeagueResponse>;
  updatePrimaryLeague: (
    queryClient: QueryClient,
    userId: string,
    leagueId: string
  ) => Promise<void>;

  // Helper methods
  invalidateLeagueQueries: (
    queryClient: QueryClient,
    userId: string,
    leagueId: string
  ) => void;
  invalidateAllQueries: (queryClient: QueryClient) => void;
  refreshMemberData: (
    queryClient: QueryClient,
    userId: string
  ) => Promise<void>;
}

export const useMemberStore = create<MemberState>()((set, get) => ({
  member: null,
  setMember: (member: MemberLeague | null) => set({ member: member }),
  isLoading: false,
  error: null,
  setIsLoading: (isLoading: boolean) => set({ isLoading: isLoading }),
  setError: (error: string | null) => set({ error: error }),

  clearAll: () =>
    set({
      member: null,
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
      .select('*, league:leagues!league_id(*)')
      .eq('user_id', user?.id as string)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      set({ member: null, isLoading: false });
      return;
    }
    set({ member: data as MemberLeague, isLoading: false });
  },

  // League operations - all centralized in store
  createLeague: async (
    queryClient: QueryClient,
    userId: string,
    params: createLeagueParams
  ) => {
    const result = await leagueService.createLeague(params);

    // Refresh member data to get the new league membership
    await get().refreshMemberData(queryClient, userId);

    return result;
  },

  joinLeague: async (
    queryClient: QueryClient,
    userId: string,
    joinCode: string,
    nickname: string
  ) => {
    const result = await leagueService.joinLeague(joinCode, nickname, userId);

    // Refresh member data to get the new league membership
    await get().refreshMemberData(queryClient, userId);

    return result;
  },

  leaveLeague: async (
    queryClient: QueryClient,
    userId: string,
    leagueId: string
  ) => {
    const result = await leagueService.leaveLeague(leagueId);

    // Refresh member data to get updated league memberships
    await get().refreshMemberData(queryClient, userId);

    return result;
  },

  updatePrimaryLeague: async (
    queryClient: QueryClient,
    userId: string,
    leagueId: string
  ) => {
    // Use the service function for database operations
    const result = await leagueService.updatePrimaryLeague(userId, leagueId);
    await get().refreshMemberData(queryClient, userId);
    // Invalidate all related queries
    get().invalidateLeagueQueries(queryClient, userId, leagueId);
  },

  invalidateLeagueQueries: (
    queryClient: QueryClient,
    userId: string,
    leagueId: string
  ) => {
    // Use the new organized structure
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.users.leagues(userId),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId as string),
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fixtures.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.predictions.all });
  },

  // Nuclear option: Invalidate ALL queries (use sparingly)
  invalidateAllQueries: (queryClient: QueryClient) => {
    queryClient.invalidateQueries();
  },

  refreshMemberData: async (queryClient: QueryClient, userId: string) => {
    // Refresh the member data from the database
    const { data: newPrimaryMember, error } = await supabase
      .from('league_members')
      .select('*, leagues!league_id(*)')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) return console.error('Failed to refresh member data:', error);

    set({ member: newPrimaryMember as MemberLeague | null });
    get().invalidateAllQueries(queryClient);
  },
}));
