import { leagueService } from "@/services/leagueService";
import { MyLeagueType } from "@/types/league.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";



interface LeagueState {
  primaryLeague: MyLeagueType | null;
  leagues: MyLeagueType[]; 
  loading: boolean;
  error: string | null;
  

  setPrimaryLeague: (league: MyLeagueType | null) => void;
  setLeagues: (leagues: MyLeagueType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearAll: () => void;

  initializeLeagues: (userId: string) => Promise<void>;
}

export const useLeagueStore = create<LeagueState>()(
  persist(
    (set, get) => ({
      primaryLeague: null,
      leagues: [], 
      loading: false,
      error: null,

      setPrimaryLeague: (league) => set({ primaryLeague: league, error: null }),
      setLeagues: (leagues) => set({ leagues, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      clearError: () => set({ error: null }),
      clearAll: () => set({ primaryLeague: null, leagues: [], loading: false, error: null }),


      initializeLeagues: async (userId: string) => {
        set({ loading: true, error: null });
        
        try {
          const leagues = await leagueService.getMyLeagues(userId);
          if(leagues.length > 0) {
            const primaryLeague = leagues.find((league) => league.is_primary === true);
            if (!primaryLeague) throw new Error('No primary league found')
            set({ primaryLeague: primaryLeague, leagues: leagues , loading: false });
          }
         
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load leagues';
          set({ 
            leagues: [], 
            loading: false, 
            error: errorMessage 
          });
        }
      },  
    }),

    {
      name: 'league-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        primaryLeague: state.primaryLeague,
      
      }),
    }
  )
);
