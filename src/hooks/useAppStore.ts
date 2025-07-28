import { create } from "zustand";
import { AppState } from "../types";
import { League } from "../types/database.types";

interface AppStore extends AppState {
  // Actions
  setSelectedLeague: (league: League | null) => void;
  addLeague: (league: League) => void;
  removeLeague: (leagueId: string) => void;
  updateLeague: (leagueId: string, updates: Partial<League>) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  selectedLeague: null,
  userLeagues: null,
  loading: false,

  setSelectedLeague: (league: League | null) => {
    set({ selectedLeague: league });
  },

  addLeague: (league: League) => {
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

  updateLeague: (leagueId: string, updates: Partial<League>) => {
    const { userLeagues } = get();
    if (!userLeagues) return;
    
    set({
      userLeagues: userLeagues.map((league) =>
        league.id === leagueId ? { ...league, ...updates } : league
      ),
    });
  },
}));
