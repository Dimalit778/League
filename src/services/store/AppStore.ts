import { supabase } from "@/lib/supabase";

import { League, LeagueMemberWithLeague } from "@/types/supabase.types";

import { create } from "zustand";

interface AppState {
  primaryLeague: League | null;
  userLeagues: LeagueMemberWithLeague[];  // Changed from League[]
  selectedLeague: League | null;
  setPrimaryLeague: (userId: string) => Promise<void>;
  setUser: () => Promise<void>;
  fetchUserLeagues: () => Promise<LeagueMemberWithLeague[]>; // Updated return type
  setSelectedLeague: (league: League) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  primaryLeague: null,
  userLeagues: [],
  loading: false,
  selectedLeague: null,

  fetchUserLeagues: async () => {
    // This will automatically filter based on RLS
    const { data, error } = await supabase
    .from('league_members')
    .select('*')    
    if (error) {
      console.error("Error loading user leagues:", error);
      return [];
    }
    console.log("fetchUserLeagues data  ", JSON.stringify(data, null, 2))
    
    return data || [];
  },


  setPrimaryLeague: async (userId: string) => {
    const { data, error } = await supabase
      .from("league_members")
      .select("*")
      .eq("user_id", userId)
      .eq("primary_league", true)
      
      .single();

    if (error) {
      console.error("Error loading primary league:", error);
      return;
    }
    set({ primaryLeague: data });
  },
  
  
  setUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error loading user:", error);
      return;
    }
    set({ user: data.user });
  },


  setSelectedLeague: (league) => set({ selectedLeague: league }),
}));
