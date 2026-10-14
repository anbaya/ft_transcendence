import { create } from 'zustand';
import type { AdminUser, InviteUserData, UserRole } from '@/types/user';
import apiClient from '@/services/api/client';

interface AdminUserState {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  updateUserRole: (id: string | number, role: UserRole) => Promise<void>;
  toggleUserStatus: (id: string | number, isActive: boolean) => Promise<void>;
  deleteUser: (id: string | number) => Promise<void>;
  inviteUser: (data: InviteUserData) => Promise<AdminUser>;
}

export const useAdminUserStore = create<AdminUserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<AdminUser[]>('/api/auth/users/');
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch users', 
        isLoading: false 
      });
    }
  },

  updateUserRole: async (id: string | number, role: UserRole) => {
    try {
      const response = await apiClient.patch<AdminUser>(`/api/auth/users/${id}/`, { role });
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? response.data : u)),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.detail || error.message || 'Failed to update user role' });
      throw error;
    }
  },

  toggleUserStatus: async (id: string | number, isActive: boolean) => {
    try {
      const response = await apiClient.patch<AdminUser>(`/api/auth/users/${id}/`, { is_active: isActive });
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? response.data : u)),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.detail || error.message || 'Failed to update user status' });
      throw error;
    }
  },

  deleteUser: async (id: string | number) => {
    try {
      await apiClient.delete(`/api/auth/users/${id}/`);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.detail || error.message || 'Failed to delete user' });
      throw error;
    }
  },

  inviteUser: async (data: InviteUserData) => {
    set({ error: null });
    try {
      const response = await apiClient.post<AdminUser>('/api/auth/users/', data);
      set((state) => ({
        users: [response.data, ...state.users],
      }));
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.detail || error.message || 'Failed to invite user';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },
}));
