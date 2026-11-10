import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resetAllStores } from './resetAllStores';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  avatar?: string;
  has_avatar?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken?: string | null) => void;
  updateUser: (fields: Partial<User>) => void;
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
      updateUser: (fields) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
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

// Sync logout and account deletion across all open browser tabs and windows
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth-storage' || e.key === null) {
      const raw = localStorage.getItem('auth-storage');
      if (!raw || !JSON.parse(raw)?.state?.isAuthenticated) {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      }
    }
  });
}
