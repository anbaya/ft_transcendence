import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resetAllStores } from './resetAllStores';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken?: string | null) => void;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken = null) => {
        resetAllStores();
        set((state) => ({
          user,
          token,
          refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
          isAuthenticated: true,
        }));
      },
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      logout: () => {
        resetAllStores();
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
