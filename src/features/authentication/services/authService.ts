import { supabase } from "@/lib/supabase/supabase";
import { Tables } from "@/types/database.types";

export type User = Tables<"users">;

export const authService = {
  getSession: async () => {
    return await supabase.auth.getSession();
  },
  getUser: async (userId: string) => {
    return await supabase.from("users").select("*").eq("id", userId).single();
  },
  login: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },
  register: async (email: string, password: string, fullname: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullname,
        },
      },
    });
  },
  logout: async () => {
    return await supabase.auth.signOut();
  },
  
};
