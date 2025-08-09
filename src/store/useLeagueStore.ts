import { Tables } from '@/types/database.types';
import { create } from 'zustand';

type League = Tables<"leagues">;

interface LeagueStore {
    primaryLeague: League
    setPrimaryLeague: (league: League) => void
    hasLoadedLeagues: boolean
    setHasLoadedLeagues: (loaded: boolean) => void
}

const useLeagueStore = create<LeagueStore>((set) => ({  
    primaryLeague: {} as League,
    setPrimaryLeague: (league) => set({ primaryLeague: league }),
    hasLoadedLeagues: false,
    setHasLoadedLeagues: (loaded) => set({ hasLoadedLeagues: loaded })
}))

export default useLeagueStore