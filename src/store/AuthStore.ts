import { userStorage } from '@/lib/storage';
import { Tables } from '@/types/database.types';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UserType = Tables<'users'>;

type AuthStore = {
  user: UserType | null;
  session: Session | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;

  setUser: (user: UserType | null) => void;
  setSession: (session: Session | null) => void;
  setIsAuthLoading: (loading: boolean) => void;
  setIsSubscribed: (subscribed: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthLoading: true,
      isAuthenticated: false,
      isSubscribed: false,
      setUser: (user) => set({ user, isAuthenticated: !!user?.id }),
      setSession: (session) => set({ session }),
      setIsAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
      setIsSubscribed: (isSubscribed) => set({ isSubscribed }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => ({
        setItem: (name, value) => {
          userStorage.set(name, value);
        },
        getItem: (name) => {
          const value = userStorage.getString(name);
          return value ?? null;
        },
        removeItem: (name) => {
          userStorage.remove(name);
        },
      })),

      partialize: (state) =>
        ({
          user: state.user,
          session: state.session,
          isAuthenticated: state.isAuthenticated,
          isSubscribed: state.isSubscribed,
        }) as AuthStore,
    },
  ),
);
