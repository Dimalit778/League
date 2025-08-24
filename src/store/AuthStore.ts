import { supabase } from '@/lib/supabase';
import { userService } from '@/services/usersService';
import { Tables } from '@/types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useLeagueStore } from './LeagueStore';

 
type User = Tables<"users">;

 interface AuthResult {
   success: boolean;
   user?: User;
   error?: string;
 }
 
 interface AuthState {
   user: User | null;
   loading: boolean;
   error: string | null;
   
   // Improved method signatures
   login: (email: string, password: string) => Promise<AuthResult>;
   signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
   logout: () => Promise<AuthResult>;
   initializeAuth: () => Promise<void>;
   clearError: () => void;
   setUser: (user: User | null) => void;
 }
 
 export const useAuthStore = create<AuthState>()(
   persist(
     (set, get) => ({
       user: null,
       loading: false,
       error: null,
       clearError: () => set({ error: null }),
       setUser: (user: User | null) => set({ user, error: null }),

      initializeAuth: async () => {
        set({ loading: true, error: null });
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.log('Session error:', sessionError.message);
            set({ loading: false, error: sessionError.message });
            return;
          }

          if (!session) {
            console.log('No session found');
            set({ user: null, loading: false });
            return;
          }

          try {
            const user = await userService.getUserProfile(session.user.id);
            if(!user) throw new Error('User not found');
            set({ user: user as User, loading: false });
          } catch (err) {
            console.error('Error fetching user data:', err);
            set({ user: null, loading: false, error: String(err) });
          }
        } catch (err) {
          console.error('Error in initializeAuth:', err);
          set({ user: null, loading: false, error: String(err) });
        }
      },
 
        login: async (email: string, password: string): Promise<AuthResult> => {
        set({ loading: true, error: null });

        if (!email?.trim()) {
          set({ loading: false, error: "Email is required" });
          return { success: false, error: "Email is required" };
        }

        if (!password?.trim()) {
          set({ loading: false, error: "Password is required" });
          return { success: false, error: "Password is required" };
        }

        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
        
          if (authError) {
            set({ loading: false, error: authError.message });
            return { success: false, error: authError.message };
          }
          
          if (!authData.user || !authData.session) {
            set({ loading: false, error: "Login failed" });
            return { success: false, error: "Login failed" };
          }
          
          const user = await userService.getUserProfile(authData.user.id);
          if (!user) {
            set({ loading: false, error: "User not found" });
            return { success: false, error: "User not found" };
          }

          set({ user: user as User, loading: false });  
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ loading: false, error: errorMessage, user: null });
          return { success: false, error: errorMessage };
        }
      },
 
       signUp: async (email: string, password: string, fullname: string): Promise<AuthResult> => {
         set({ loading: true, error: null });
 
         if (!email?.trim()) {
           set({ loading: false, error: "Email is required" });
           return { success: false, error: "Email is required" };
         }
 
         if (!password?.trim()) {
           set({ loading: false, error: "Password is required" });
           return { success: false, error: "Password is required" };
         }
 
         if (!fullname?.trim()) {
           set({ loading: false, error: "Full name is required" });
           return { success: false, error: "Full name is required" };
         }
 
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullname,
      },
    },
  });

  if (authError) {
    set({ loading: false, error: authError.message });
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    set({ loading: false, error: "Sign up failed" });
    return { success: false, error: "Sign up failed" };
  }
  const user = await userService.getUserProfile(authData.user.id);
  if(!user) throw new Error('User not found');
  set({ user: user as User, loading: false });



  
  return { success: true };
},
 
    logout: async (): Promise<AuthResult> => {
         set({ loading: true, error: null });
         const { error } = await supabase.auth.signOut();
         if (error) {
           set({ loading: false, error: error.message });
           return { success: false, error: error.message };
         }
 
         try {
          useLeagueStore.getState().clearAll(); 
           const keys = await AsyncStorage.getAllKeys();
           const keysToRemove = keys.filter(key => key !== 'theme-storage');
           await AsyncStorage.multiRemove(keysToRemove);
         } catch (storageError) {
           console.warn("Failed to clear storage:", storageError);
         }
 
         set({ user: null, loading: false, error: null });
         return { success: true };
       },
     }),
     {
       name: 'auth-storage',
       storage: createJSONStorage(() => AsyncStorage),
       partialize: (state) => ({
         user: state.user,
        
       }),
     }
   )
 );
 
