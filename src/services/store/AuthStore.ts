import { supabase } from "@/lib/supabase";

import { AuthError, Session, User as SupabaseUser } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  session: Session | null;
  loading: boolean;   
  error: string | null;
  initializeSession: () => Promise<void>;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<{data: SupabaseUser | null, error: AuthError | null}>; 
  register: (email: string, password: string, fullname: string) => Promise<{data: SupabaseUser | null, error: AuthError | null}>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  setSession: (session) => set({ session }),

  

  initializeSession: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
        set({ error: error.message, loading: false });
        return;
      }
      set({ session: data.session });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
    } finally {
      set({ loading: false });
    }
  },
   


  login: async (email: string, password: string) => {
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
      return { data: data.user, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return { data: null, error: error as AuthError };
    } finally {
      set({ loading: false });
    }
  },
  register  : async (email, password, fullname) => {
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
    console.log('error', JSON.stringify(error, null, 2))
    console.log('data', JSON.stringify(data, null, 2))
   
    if (error) return Promise.reject(error);

      set({ session: data.session });
    return Promise.resolve({data: data.user, error: null});
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
      const { error } = await supabase.auth.signOut();
      if (error) return Promise.reject(error);
      set({ session: null });
      return Promise.resolve();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return Promise.reject(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAuthStore;