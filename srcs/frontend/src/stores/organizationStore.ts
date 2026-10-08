import { create } from 'zustand';
import type { Organization, OrganizationMember } from '@/types/organization';
import apiClient from '@/services/api/client';

interface OrganizationState {
  organizations: Organization[];
  activeOrganization: Organization | null;
  members: OrganizationMember[];
  isLoading: boolean;
  error: string | null;

  fetchOrganizations: () => Promise<void>;
  fetchOrganization: (id: string) => Promise<void>;
  createOrganization: (data: Partial<Organization>) => Promise<Organization>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;
  
  fetchOrganizationMembers: (orgId: string) => Promise<void>;
  addOrganizationMember: (orgId: string, data: { user_id?: string; email?: string; role?: string }) => Promise<void>;
  removeOrganizationMember: (orgId: string, memberId: string) => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  activeOrganization: null,
  members: [],
  isLoading: false,
  error: null,

  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Organization[]>('/api/organizations/');
      set({ organizations: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch organizations', isLoading: false });
    }
  },

  fetchOrganization: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Organization>(`/api/organizations/${id}/`);
      set({ activeOrganization: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch organization', isLoading: false });
    }
  },

  createOrganization: async (data: Partial<Organization>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Organization>('/api/organizations/', data);
      set((state) => ({ 
        organizations: [...state.organizations, response.data],
        isLoading: false 
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create organization', isLoading: false });
      throw error;
    }
  },

  updateOrganization: async (id: string, data: Partial<Organization>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<Organization>(`/api/organizations/${id}/`, data);
      set((state) => ({
        organizations: state.organizations.map((o) => o.id === id ? response.data : o),
        activeOrganization: state.activeOrganization?.id === id ? response.data : state.activeOrganization,
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update organization', isLoading: false });
      throw error;
    }
  },

  deleteOrganization: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/organizations/${id}/`);
      set((state) => ({
        organizations: state.organizations.filter((o) => o.id !== id),
        activeOrganization: state.activeOrganization?.id === id ? null : state.activeOrganization,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete organization', isLoading: false });
      throw error;
    }
  },

  fetchOrganizationMembers: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<OrganizationMember[]>(`/api/organizations/${orgId}/members/`);
      set({ members: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch members', isLoading: false });
    }
  },

  addOrganizationMember: async (orgId: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<OrganizationMember>(`/api/organizations/${orgId}/members/`, data);
      set((state) => ({ members: [...state.members, response.data], isLoading: false }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add member', isLoading: false });
      throw error;
    }
  },

  removeOrganizationMember: async (orgId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/organizations/${orgId}/members/${memberId}/`);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove member', isLoading: false });
      throw error;
    }
  },
}));
