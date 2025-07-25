// import { create } from "zustand";
// import { User, AuthState } from "../types";
// import {
//   supabase,
//   createUser,
//   signIn,
//   signOut,
//   getUserProfile,
// } from "../services/supabase";

// interface AuthStore extends AuthState {
//   // Actions
//   signUp: (
//     email: string,
//     password: string,
//     displayName: string
//   ) => Promise<{ success: boolean; error?: string }>;
//   signIn: (
//     email: string,
//     password: string
//   ) => Promise<{ success: boolean; error?: string }>;
//   signOut: () => Promise<void>;
//   loadUser: () => Promise<void>;
//   updateProfile: (
//     updates: Partial<User>
//   ) => Promise<{ success: boolean; error?: string }>;
// }

// export const useAuthStore = create<AuthStore>((set, get) => ({
//   user: null,
//   session: null,
//   loading: true,

//   signUp: async (email: string, password: string, displayName: string) => {
//     try {
//       set({ loading: true });
//       const { data, error } = await createUser(email, password, displayName);

//       if (error) {
//         return { success: false, error: error.message };
//       }

//       return { success: true };
//     } catch (error) {
//       return { success: false, error: "An unexpected error occurred" };
//     } finally {
//       set({ loading: false });
//     }
//   },

//   signIn: async (email: string, password: string) => {
//     try {
//       set({ loading: true });
//       const { data, error } = await signIn(email, password);

//       if (error) {
//         return { success: false, error: error.message };
//       }

//       if (data.user) {
//         const { data: profile } = await getUserProfile(data.user.id);
//         set({
//           user: profile,
//           session: data.session,
//         });
//       }

//       return { success: true };
//     } catch (error) {
//       return { success: false, error: "An unexpected error occurred" };
//     } finally {
//       set({ loading: false });
//     }
//   },

//   signOut: async () => {
//     try {
//       set({ loading: true });
//       await signOut();
//       set({ user: null, session: null });
//     } catch (error) {
//       console.error("Sign out error:", error);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   loadUser: async () => {
//     try {
//       set({ loading: true });
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (session?.user) {
//         const { data: profile } = await getUserProfile(session.user.id);
//         set({
//           user: profile,
//           session,
//         });
//       }
//     } catch (error) {
//       console.error("Load user error:", error);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   updateProfile: async (updates: Partial<User>) => {
//     try {
//       const { user } = get();
//       if (!user) {
//         return { success: false, error: "No user logged in" };
//       }

//       const { error } = await supabase
//         .from("users")
//         .update(updates)
//         .eq("id", user.id);

//       if (error) {
//         return { success: false, error: error.message };
//       }

//       set({ user: { ...user, ...updates } });
//       return { success: true };
//     } catch (error) {
//       return { success: false, error: "An unexpected error occurred" };
//     }
//   },
// }));

// // Auth state listener
// supabase.auth.onAuthStateChange((event, session) => {
//   const { loadUser } = useAuthStore.getState();
//   if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
//     loadUser();
//   } else if (event === "SIGNED_OUT") {
//     useAuthStore.setState({ user: null, session: null, loading: false });
//   }
// });
