import { supabase } from '@/lib/supabase';
import { create } from 'zustand';

import { downloadImage } from '@/hooks/useSupabaseImages';
import { Tables } from '@/types/database.types';

type Member = Tables<'league_members'>;

type MemberWithLeague = Member & {
  league?: {
    id: string;
    competition_id: number;
  } | null;
};

interface MemberState {
  memberId: string | null;
  leagueId: string | null;
  member: Member | null;
  isLoading: boolean;
  error: string | null;
  setActiveMember: (memberData: MemberWithLeague | null) => void;
  clearAll: () => void;
  initializeMember: () => Promise<void>;
}

export const useMemberStore = create<MemberState>()((set, get) => ({
  memberId: null,
  leagueId: null,
  member: null,
  isLoading: false,
  error: null,

  setActiveMember: (memberData: MemberWithLeague | null) => {
    if (!memberData) {
      set({
        memberId: null,
        leagueId: null,
        member: null,
      });
      return;
    }

    const { league, ...memberWithoutLeague } = memberData;

    set({
      memberId: memberWithoutLeague.id,
      leagueId: league?.id ?? null,
      member: memberWithoutLeague,
    });
  },

  clearAll: () =>
    set({
      memberId: null,
      leagueId: null,
      member: null,
      isLoading: false,
      error: null,
    }),

  initializeMember: async () => {
    console.log('initializeMember');
    const currentState = get();
    if (!currentState.memberId) {
      set({ isLoading: true, error: null });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      set({ isLoading: false, error: userError.message, memberId: null, leagueId: null, member: null });
      return;
    }

    if (!user?.id) {
      set({ isLoading: false, memberId: null, leagueId: null, member: null });
      return;
    }

    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues!league_id(id, competition_id)')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) {
      set({ isLoading: false, error: error.message, memberId: null, leagueId: null, member: null });
      return;
    }

    if (!data) {
      set({ isLoading: false, memberId: null, leagueId: null, member: null });
      return;
    }

    const memberData = data as MemberWithLeague;
    const { league, ...memberWithoutLeague } = memberData;

    if (memberWithoutLeague.avatar_url) {
      try {
        const signedUrl = await downloadImage(memberWithoutLeague.avatar_url, {
          bucket: 'avatars',
          expiresIn: 60 * 60 * 24,
        });
        if (signedUrl) {
          memberWithoutLeague.avatar_url = signedUrl;
        }
      } catch (err) {
        console.error('Failed to create signed URL for avatar:', err);
      }
    }

    set({
      memberId: memberWithoutLeague.id,
      leagueId: league?.id ?? null,
      member: memberWithoutLeague,
      isLoading: false,
      error: null,
    });
  },
}));
