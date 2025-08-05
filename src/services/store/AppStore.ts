
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AppState {
  user: User | null;
  primaryLeague: Tables<"leagues"> | null;
  userLeagues:  Tables<"league_members">[];  // Changed from League[]
  selectedLeague: Tables<"leagues"> | null;
  loading?: boolean;
  setPrimaryLeague: (primaryLeague: Tables<"leagues">) => void;
  setUserLeagues: (userId: string) => Promise<void>;
  setSelectedLeague: (league: Tables<"leagues">) => void;
  setUser: (user: User) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  primaryLeague: null,
  userLeagues: <Tables<"league_members">[]>[],
  loading: false,
  selectedLeague: null,
    setPrimaryLeague: (primaryLeague: Tables<"leagues">) => set({ primaryLeague }),
  setSelectedLeague: (league) => set({ selectedLeague: league }),

  setUserLeagues: async (userId: string) => {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, leagues(*)')
      .eq('user_id', userId);
      console.log('setUserLeagues error', JSON.stringify(error, null, 2))
    console.log('setUserLeagues data', JSON.stringify(data, null, 2))
      if (error) {
      console.error("Error getting user leagues:", error.message);
      return;
    }
    
    const leagueMembersWithLeague = data?.map(member => ({
      ...member,
      leagues: member.leagues
    })) as Tables<"league_members">[] || [];
    
    set({ userLeagues: leagueMembersWithLeague });
  },
  setUser : (user: User) => set({ user: user }),


}));
