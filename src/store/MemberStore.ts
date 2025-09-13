import { supabase } from '@/lib/supabase';
import { MemberLeague } from '@/types';
import { create } from 'zustand';

interface MemberState {
  member: MemberLeague | null;
  setMember: (member: MemberLeague | null) => void;
  isLoading: boolean;
  error: string | null;
  clearAll: () => void;
  initializeMemberLeagues: () => Promise<void>;
  refreshMemberData: (userId: string) => Promise<void>;
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

  // Keep store focused on data, not cache
  refreshMemberData: async (userId: string) => {
    // Refresh the member data from the database
    const { data: newPrimaryMember, error } = await supabase
      .from('league_members')
      .select('*, leagues!league_id(*)')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) return console.error('Failed to refresh member data:', error);

    set({ member: newPrimaryMember as MemberLeague | null });
  },
}));
