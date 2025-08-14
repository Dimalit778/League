import { Tables } from '@/types/database.types';
import { create } from 'zustand';

type League = Tables<"leagues">;

interface LeagueStore {
    primaryLeague: League
    setLeague: (league: League) => void
   
}

const useLeagueStore = create<LeagueStore>((set) => ({  
    primaryLeague: {} as League,
    setLeague: (league) => set({ primaryLeague: league }),
   

    
}))

export default useLeagueStore