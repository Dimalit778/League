import { supabase } from "@/lib/supabase";
import { AuthState } from "@/types/authTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  subscription_tier: "free" | "premium";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userSupabase: null,
  user: null,
  session: null,
  loading: true,
  error: null,

  // Actions
  signUp: async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      if (data.user) {
        set({
          userSupabase: data.user,
          user: {
            id: data.user.id,
            email: data.user.email || "",
            first_name: data.user.user_metadata.first_name || "",
            last_name: data.user.user_metadata.last_name || "",
            avatar_url: data.user.user_metadata.avatar_url || "",
            subscription_tier: "free",
          },
        });
      }
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      if (data.user) {
        set({
          userSupabase: data.user,
          user: {
            id: data.user.id,
            email: data.user.email || "",
            first_name: data.user.user_metadata.first_name || "",
            last_name: data.user.user_metadata.last_name || "",
            avatar_url: data.user.user_metadata.avatar_url || "",
            subscription_tier: "free",
          },
          session: data.session,
        });
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      // Clear all state
      set({
        userSupabase: null,
        user: null,
        session: null,
        loading: false,
        error: null,
      });

      // Clear any cached data
      await AsyncStorage.clear();

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "your-app://reset-password", // Update with your app's deep link
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  refreshSession: async () => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      if (data.session) {
        set({
          session: data.session,
          userSupabase: data.session.user,
        });
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();

  switch (event) {
    case "SIGNED_IN":
    case "TOKEN_REFRESHED":
      if (session?.user) {
        useAuthStore.setState({
          userSupabase: session.user,
          session,
          loading: false,
        });
      }
      break;

    case "SIGNED_OUT":
      useAuthStore.setState({
        user: null,
        userSupabase: null,
        session: null,
        loading: false,
        error: null,
      });
      break;

    case "PASSWORD_RECOVERY":
      // Handle password recovery
      useAuthStore.setState({ loading: false });
      break;

    case "USER_UPDATED":
      if (session?.user) {
        useAuthStore.setState({
          userSupabase: session.user,
        });
      }
      break;

    default:
      useAuthStore.setState({ loading: false });
  }
});

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({
    userSupabase: session?.user || null,
    user: {
      id: session?.user?.id || "",
      email: session?.user?.email || "",
      first_name: session?.user?.user_metadata.first_name || "",
      last_name: session?.user?.user_metadata.last_name || "",
      avatar_url: session?.user?.user_metadata.avatar_url || "",
      subscription_tier: session?.user?.user_metadata.subscription_tier || "",
    },
    session,
    loading: false,
  });
});
