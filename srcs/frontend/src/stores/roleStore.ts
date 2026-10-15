import { create } from 'zustand';
import type { Role, UpdateRolePayload } from '@/types/role';
import apiClient from '@/services/api/client';

interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  isLoading: boolean;
  error: string | null;

  fetchRoles: () => Promise<void>;
  selectRole: (role: Role) => void;
  updateRole: (roleId: string, payload: UpdateRolePayload) => Promise<Role>;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  selectedRole: null,
  isLoading: false,
  error: null,

  fetchRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Role[]>('/api/auth/roles/');
      const rolesData = response.data;
      set({ 
        roles: rolesData, 
        selectedRole: get().selectedRole || (rolesData.length > 0 ? rolesData[0] : null),
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch roles from server', 
        isLoading: false 
      });
    }
  },

  selectRole: (role: Role) => {
    set({ selectedRole: role });
  },

  updateRole: async (roleId: string, payload: UpdateRolePayload) => {
    set({ error: null });
    try {
      const response = await apiClient.patch<Role>(`/api/auth/roles/${roleId}/`, payload);
      const updatedRole = response.data;
      set((state) => ({
        roles: state.roles.map((r) => (r.id === roleId ? updatedRole : r)),
        selectedRole: state.selectedRole?.id === roleId ? updatedRole : state.selectedRole,
      }));
      return updatedRole;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to update role permissions';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },
}));
