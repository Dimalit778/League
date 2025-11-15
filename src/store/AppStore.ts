// src/store/AppStore.ts
import { create } from 'zustand';

type AppStore = {
  hasHydrated: boolean;

  isAppReady: boolean;

  setHasHydrated: (value: boolean) => void;
  setIsAppReady: (value: boolean) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  hasHydrated: false,
  isAppReady: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),
  setIsAppReady: (value) => set({ isAppReady: value }),
}));
