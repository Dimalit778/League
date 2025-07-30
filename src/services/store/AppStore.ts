import { supabase } from "@/lib/supabase";
import { AppState } from "@/types";
import { TLeague } from "@/types/database.types";
import { create } from "zustand";

interface AppStore extends AppState {

  setSelectedLeague: (league: TLeague | null) => void;
  addLeague: (league: TLeague) => void;
  removeLeague: (leagueId: string) => void;
  updateLeague: (leagueId: string, updates: Partial<TLeague>) => void;
  loadPrimaryLeague: (userId: string) => Promise<void>;
  setPrimaryLeague: (userId: string, leagueId: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  selectedLeague: null,
  userLeagues: null,
  loading: false,

  setSelectedLeague: (league: TLeague | null) => {
    set({ selectedLeague: league });
  },

  addLeague: (league: TLeague) => {
    const { userLeagues } = get();
    set({ userLeagues: userLeagues ? [...userLeagues, league] : [league] });
  },

  removeLeague: (leagueId: string) => {
    const { userLeagues } = get();
    if (!userLeagues) return;
    
    set({
      userLeagues: userLeagues.filter((league) => league.id !== leagueId),
    });
  },

  updateLeague: (leagueId: string, updates: Partial<TLeague>) => {
    const { userLeagues } = get();
    if (!userLeagues) return;
    
    set({
      userLeagues: userLeagues.map((league) =>
        league.id === leagueId ? { ...league, ...updates } : league
      ),
    });
  },

  loadPrimaryLeague: async (userId: string) => {
    if (!userId) return;
    
    try {
      set({ loading: true });
      
      // First, get the primary league ID from the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("primary_league_id")
        .eq("id", userId)
        .single();
      
      if (profileError || !profileData?.primary_league_id) {
        // If there's no primary league, just return
        set({ loading: false });
        return;
      }
      
      // Now fetch the league details
      const { data: leagueData, error: leagueError } = await supabase
        .from("leagues")
        .select("*")
        .eq("id", profileData.primary_league_id)
        .single();
      
      if (leagueError || !leagueData) {
        set({ loading: false });
        return;
      }
      
      // Set as selected league
      set({ selectedLeague: leagueData as TLeague });
    } catch (error) {
      console.error("Error loading primary league:", error);
    } finally {
      set({ loading: false });
    }
  },
  
  setPrimaryLeague: async (userId: string, leagueId: string) => {
    if (!userId || !leagueId) return;
    
    try {
      set({ loading: true });
      
      // Update the primary league in the profile
      const { error } = await supabase
        .from("profiles")
        .update({ primary_league_id: leagueId })
        .eq("id", userId);
      
      if (error) {
        console.error("Error setting primary league:", error);
        return;
      }
      
      // Now fetch the league details to set as selected
      const { data: leagueData, error: leagueError } = await supabase
        .from("leagues")
        .select("*")
        .eq("id", leagueId)
        .single();
      
      if (leagueError || !leagueData) {
        return;
      }
      
      // Set as selected league
      set({ selectedLeague: leagueData as TLeague });
    } catch (error) {
      console.error("Error setting primary league:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
