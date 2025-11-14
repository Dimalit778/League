import { downloadImage } from '@/hooks/useSupabaseImages';
import { supabase } from '@/lib/supabase';
import { MemberLeague } from '@/types';
import { Tables } from '@/types/database.types';
import { create } from 'zustand';

type League = Tables<'leagues'> & { competition: Tables<'competitions'> };
type Member = Tables<'league_members'>;

interface MemberState {
  member: Member | null;
  league: League | null;
  isLoading: boolean;
  error: string | null;
  setMember: (member: MemberLeague | null) => void;
  clearAll: () => void;
  initializeMember: () => Promise<void>;
}

export const useMemberStore = create<MemberState>()((set, get) => ({
  member: null,
  league: null,
  isLoading: false,
  error: null,
  setIsLoading: (isLoading: boolean) => set({ isLoading: isLoading }),
  setError: (error: string | null) => set({ error: error }),
  setMember: (memberData: MemberLeague | null) => {
    if (!memberData) {
      set({ member: null, league: null });
      return;
    }
    const { league, ...member } = memberData;
    set({
      member,
      league: league || null,
    });
  },

  clearAll: () =>
    set({
      member: null,
      league: null,
      isLoading: false,
      error: null,
    }),

  initializeMember: async () => {
    const currentState = get();
    if (!currentState.member) {
      set({ isLoading: true });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      set({ member: null, league: null, isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues!league_id(*,competition:competitions!inner(*))')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      set({ member: null, league: null, isLoading: false });
      return;
    }

    const memberData = data as MemberLeague;

    // Extract league from member data
    const { league, ...memberWithoutLeague } = memberData;

    if (memberWithoutLeague.avatar_url) {
      try {
        const signedUrl = await downloadImage(memberWithoutLeague.avatar_url, {
          bucket: 'avatars',
          expiresIn: 60 * 60 * 24, // 1 day
        });
        if (signedUrl) {
          memberWithoutLeague.avatar_url = signedUrl;
        }
      } catch (error) {
        console.error('Failed to create signed URL for avatar:', error);
      }
    }

    set({
      member: memberWithoutLeague,
      league: league,
      isLoading: false,
    });
  },
}));
