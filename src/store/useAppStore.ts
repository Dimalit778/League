import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError, Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type User = Tables<"users">;
type League = Tables<"leagues">;


interface AppState {    
  user: User | null;
  session: Session | null;
  primaryLeague: League | null;
  initializeSession: () => Promise<{ success: boolean; error?: string | null }>;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setPrimaryLeague: (league: League | null) => void;
  login: (email: string, password: string) => Promise<{ data: User | null; error: AuthError | null }>;
  signUp: (email: string, password: string, fullname: string) => Promise<{ data: User | null; error: AuthError | null }>;
  logout: () => Promise<{ success: boolean; error?: string | null }>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      primaryLeague: null,
      loading: false,
      error: null,
    
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setPrimaryLeague: (league) => set({ primaryLeague: league}),
  
      initializeSession: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !data.session) {
            set({ loading: false, error: sessionError?.message || "No session found" });
            return { success: false, error: sessionError?.message || "No session found" };
          }
          
          set({ session: data.session });
          
          const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", data.session.user.id).single();
          
          if (userError || !userData) {
            set({ loading: false, error: userError?.message || "User not found" });
            return { success: false, error: userError?.message || "User not found" };
          }
          
          set({ user: userData, loading: false });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },
      login: async (email: string, password: string): Promise<{ data: User | null; error: AuthError | null }> => {
        set({ loading: true, error: null });
        try {
          if (!email) return Promise.reject("Email is required");
          if (!password) return Promise.reject("Password is required");
    
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
          if (error) return { data: null, error };
    
          set({ session: data.session});
      return { data: data.user as unknown as User, error: null };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
          return { data: null, error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },
      signUp  : async (email: string, password: string, fullname: string): Promise<{ data: User | null; error: AuthError | null }> => {
        set({ loading: true, error: null });
        try {
          if (!email) return Promise.reject("Email is required");
          if (!password) return Promise.reject("Password is required");
    
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
             full_name : fullname,
            },
          },
        });
    
        if (error) return Promise.reject(error);
          set({ session: data.session });
        return Promise.resolve({data: data.user as unknown as User  , error: null});
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
          return Promise.reject(errorMessage);
        } finally {
          set({ loading: false });
        }
      },
      
      logout: async () => {
        set({ loading: true, error: null });
        try {
          const { error: logoutError } = await supabase.auth.signOut();
          if (logoutError) {
            set({ loading: false, error: logoutError.message });
            return { success: false, error: logoutError.message };
          }
          set({
            session: null,
            user: null,
            primaryLeague: null,
            loading: false
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },
    }),
    {
      name: 'football-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        primaryLeague: state.primaryLeague
      }),
    }
  )
);