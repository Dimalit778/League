import { GCompetition, GLeague, GUser } from '@/types/global.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


interface AppState {    
  user: GUser | null;
  primaryLeague: GLeague | null;
  selectedLeague: GLeague | null;
  currentCompetition: GCompetition | null;
  currentSeason: number | null;
  
  // Actions
  setUser: (user: GUser | null) => void;
  setPrimaryLeague: (league: GLeague | null) => void;
  setSelectedLeague: (league: GLeague | null) => void;
  setCurrentCompetition: (competition: GCompetition | null) => void;
  setCurrentSeason: (season: number | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      primaryLeague: null,
      selectedLeague: null,
      currentCompetition: null,
      currentSeason: null,

      setUser: (user) => set({ user }),
      setPrimaryLeague: (league) => set({ primaryLeague: league, selectedLeague: league }),
      setSelectedLeague: (league) => set({ selectedLeague: league }),
      setCurrentCompetition: (competition) => set({ currentCompetition: competition }),
      setCurrentSeason: (season) => set({ currentSeason: season }),
      logout: () => set({
        user: null,
        primaryLeague: null,
        selectedLeague: null,
        currentCompetition: null,
        currentSeason: null,
      }),
    }),
    {
      name: 'football-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);