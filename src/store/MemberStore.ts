import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
 type Members = Tables<"league_members">;

interface MemberState {
  member: Members| null;
  myMembers: Members[] | null;
  loading: boolean;
  error: string | null;

  setMember: (member: Members | null) => void;
  setMyMembers: (myMembers: Members[] | null) => void;
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
      myMembers: null,
      loading: false,
      error: null,

      setMember: (member) => set({ member }),
      setMyMembers: (myMembers) => set({ myMembers }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      clearAll: () => set({ member: null, myMembers: null, loading: false, error: null }),

      initializeMembers: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({ loading: true });
        try {
          const { data , error } = await supabase.from('league_members').select('*').eq('user_id', session?.user?.id as string)
          if (error) throw error;
          
          if(data.length > 0) {
            const primaryMember = data.find((member) => member.is_primary === true);
            if (!primaryMember) throw new Error('No primary member found')
            set({ member: primaryMember, myMembers: data, loading: false });
          }
        }
        catch (error) {
          set({ error: error as string });
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
        myMembers: state.myMembers,
      }),
    }
  )
)