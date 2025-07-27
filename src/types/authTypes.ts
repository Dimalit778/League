import { UserProfile } from "@/hooks/useAuthStore";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

export interface AuthState {
  userSupabase: SupabaseUser | null;
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // --- Sign up ---
  signUp: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  // --- Sign in ---
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  // --- Reset password ---
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  // --- Update password ---
  updatePassword: (
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  // --- Refresh session ---
  refreshSession: () => Promise<{ success: boolean; error?: string }>;
  // --- Clear error ---
  clearError: () => void;
  // --- Resend verification email ---
}
