import { create } from 'zustand';
import type { Subscription, User } from '../types';

interface UserStoreState {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  subscription: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () =>
    set({
      user: null,
      subscription: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
