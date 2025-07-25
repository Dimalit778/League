import { create } from "zustand";
import { League, AppState } from "../types";
import { getUserLeagues } from "../services/supabase";

interface AppStore extends AppState {
  // Actions
  setSelectedLeague: (league: League | null) => void;
  loadUserLeagues: (userId: string) => Promise<void>;
  addLeague: (league: League) => void;
  removeLeague: (leagueId: string) => void;
  updateLeague: (leagueId: string, updates: Partial<League>) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  selectedLeague: null,
  userLeagues: [],
  loading: false,

  setSelectedLeague: (league: League | null) => {
    set({ selectedLeague: league });
  },

  loadUserLeagues: async (userId: string) => {
    try {
      set({ loading: true });
      const { data, error } = await getUserLeagues(userId);

      if (error) {
        console.error("Error loading user leagues:", error);
        return;
      }

      const leagues =
        data?.map((member) => member.league).filter(Boolean) || [];
      set({ userLeagues: leagues as League[] });
    } catch (error) {
      console.error("Error loading user leagues:", error);
    } finally {
      set({ loading: false });
    }
  },

  addLeague: (league: League) => {
    const { userLeagues } = get();
    set({ userLeagues: [...userLeagues, league] });
  },

  removeLeague: (leagueId: string) => {
    const { userLeagues } = get();
    set({
      userLeagues: userLeagues.filter((league) => league.id !== leagueId),
    });
  },

  updateLeague: (leagueId: string, updates: Partial<League>) => {
    const { userLeagues } = get();
    set({
      userLeagues: userLeagues.map((league) =>
        league.id === leagueId ? { ...league, ...updates } : league
      ),
    });
  },
}));
