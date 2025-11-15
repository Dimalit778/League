// src/store/AuthStore.ts
import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthState = {
  userId: string | null;
  fullName: string | null;
  email: string | null;
  isAuthLoading: boolean;

  // actions
  setUserFromSupabase: (user: User | null) => void;
  setAuthLoading: (value: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  fullName: null,
  email: null,
  isAuthLoading: false,

  setUserFromSupabase: (user) =>
    set({
      userId: user?.id ?? null,
      fullName: user?.user_metadata.full_name ?? null,
      email: user?.email ?? null,
      isAuthLoading: false,
    }),

  setAuthLoading: (value) => set({ isAuthLoading: value }),

  clearAuth: () =>
    set({
      userId: null,
      fullName: null,
      email: null,
      isAuthLoading: false,
    }),
}));
