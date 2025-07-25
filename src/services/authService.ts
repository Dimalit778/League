import { SupabaseClient } from "@supabase/supabase-js";

export const createUser = async (
  email: string,
  password: string,
  displayName: string,
  supabase: SupabaseClient
) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email,
        display_name: displayName,
        subscription_tier: "free",
      });

      if (profileError) throw profileError;
    }

    return { data: authData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};
export const signIn = async (
  email: string,
  password: string,
  supabase: SupabaseClient
) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const signOut = async (supabase: SupabaseClient) => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};
