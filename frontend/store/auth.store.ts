import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isSeller: () => boolean;
  isBuyer: () => boolean;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  isSeller: () => get().user?.role === 'seller',

  isBuyer: () => get().user?.role === 'buyer',
}));