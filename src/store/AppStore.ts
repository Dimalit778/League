
// import { supabase } from "@/lib/supabase";
// import { Tables } from "@/types/database.types";

// import { create } from "zustand";


// type User = {
//   id: string;
//   fullname: string;
//   email: string;
//   avatar: string;
// }
// interface AppState {
//   user: User | null;
//   primaryLeague: Tables<"leagues"> | null;
//   loading: boolean;
  
//   // Actions
//   setPrimaryLeague: (primaryLeague: Tables<"leagues">) => void;
//   setUser: (user: User | null) => void;
//   initializeUserAndLeagues: () => Promise<void>;
//   clearStore: () => void;
// }
// export const useAppStore = create<AppState>((set, get) => ({
//   user: null,
//   primaryLeague: null,
//   loading: false,
//   setPrimaryLeague: (primaryLeague: Tables<"leagues">) => set({ primaryLeague }),
//   setUser: (user: User | null) => set({ user }),
//   clearStore: () => set({
//     user: null,
//     primaryLeague: null,
//     loading: false,
//   }), 

//   initializeUserAndLeagues: async () => {
//     set({ loading: true });
//     try {
//       const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
//       if (sessionError) {
//         throw new Error(sessionError.message);
//       }
//       if (!sessionData.session?.user?.id) {
//         set({ loading: false, user: null });
//         return;
//       }

//       set({ user:{
//         id: sessionData.session?.user?.id,
//         fullname: sessionData.session?.user?.user_metadata?.fullname,
//         email: sessionData.session?.user?.email || '',
//         avatar: sessionData.session?.user?.user_metadata?.avatar,
//       }  });
      
//       // Get user's leagues
//       const { data: userLeagues, error: leaguesError } = await supabase
//         .from('league_members')
//         .select(`
//           *,
//           league:leagues(*)
//         `)
//         .eq('user_id', sessionData.session?.user?.id);

//       if (leaguesError) {
//         throw new Error(leaguesError.message);
//       }
      
//       set({ loading: false });
//     } catch (error) {
//       console.error("Error initializing user and leagues:", error);
//       set({ loading: false, user: null });
//     }
//   },



// }));
