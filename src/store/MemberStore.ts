import { supabase } from '@/lib/supabase';
import { MemberLeague } from '@/types';

import { create } from 'zustand';

interface MemberState {
  member: MemberLeague | null;
  isLoading: boolean;
  error: string | null;
  setMember: (member: MemberLeague | null) => void;
  clearAll: () => void;
  initializeMemberLeagues: () => Promise<void>;
}

export const useMemberStore = create<MemberState>()((set, get) => ({
  member: null,
  isLoading: false,
  error: null,
  setIsLoading: (isLoading: boolean) => set({ isLoading: isLoading }),
  setError: (error: string | null) => set({ error: error }),
  setMember: (member: MemberLeague | null) => set({ member }),

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
      .select(
        '*, league:leagues!league_id(*,competition:competitions!inner(*))'
      )
      .eq('user_id', user?.id as string)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      set({ member: null, isLoading: false });
      return;
    }

    set({
      member: data as MemberLeague,

      isLoading: false,
    });
  },
}));
