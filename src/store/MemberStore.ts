import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
 type Members = Tables<"league_members"> & {
  league: Tables<"leagues">;
}

 

interface MemberState {
  member: Members| null;
  loading: boolean;
  error: string | null;

  setMember: (member: Members | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearAll: () => void;
  initializeMembers: () => Promise<void>;

  }

export const useMemberStore = create<MemberState>()(
  persist(
    (set) => ({
      member: null,
      loading: false,
      error: null,

      setMember: (member) => set({ member }),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      clearAll: () => set({ member: null, loading: false, error: null }),

      initializeMembers: async () => {
        const { data: { session } } = await supabase.auth.getSession();
      
        set({ loading: true });
        try {
          if (!session?.user?.id) {
            console.log('No user ID found in session');
            return;
          }
    
          const { data, error } = await supabase.from('league_members').select('*, league:leagues(*)').eq('user_id', session.user.id);
          
          if (error) {
            console.error('Supabase error fetching members:', error);
            throw error;
          }
          
          if(data.length > 0) {
            const primaryMember = data.find((member) => member.is_primary === true);
            if (!primaryMember) {
              console.log('No primary member found, using first member as primary');
              set({ member: data[0], loading: false });
            } else {
              set({ member: primaryMember, loading: false });
            }
          } else {
            console.log('No members found for user');
          }
        }
        catch (error) {
          console.error('Error initializing members:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to initialize members' });
        }
        finally {
          set({ loading: false });
        }
      },
    

    }),

    {
      name: 'member-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        member: state.member,
 
      }),
    }
  )
)