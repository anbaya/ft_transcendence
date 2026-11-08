import { create } from 'zustand';
import type { Project, ProjectMember } from '@/types/project';
import apiClient from '@/services/api/client';
import { getApiErrorMessage } from '@/utils/errors';
import { useAuthStore } from '@/stores/authStore';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;

  activeProjectMembers: ProjectMember[];
  fetchProjectMembers: (projectId: number) => Promise<void>;
  addProjectMember: (projectId: number, email: string) => Promise<ProjectMember>;
  removeProjectMember: (projectId: number, memberId: number) => Promise<void>;
  leaveProject: (projectId: number) => Promise<void>;
  reset: () => void;
}

const initialState = {
  projects: [],
  activeProject: null,
  activeProjectMembers: [],
  isLoading: false,
  error: null,
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Project[]>('/api/projects/');
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to fetch projects'), isLoading: false });
    }
  },

  fetchProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Project>(`/api/projects/${id}/`);
      set({ activeProject: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to fetch project'), isLoading: false });
    }
  },

  createProject: async (data: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Project>('/api/projects/', data);
      set((state) => ({ 
        projects: [...state.projects, response.data],
        isLoading: false 
      }));
      return response.data;
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to create project'), isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: number, data: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<Project>(`/api/projects/${id}/`, data);
      set((state) => ({
        projects: state.projects.map((p) => p.id === id ? response.data : p),
        activeProject: state.activeProject?.id === id ? response.data : state.activeProject,
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to update project'), isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/projects/${id}/`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProject: state.activeProject?.id === id ? null : state.activeProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to delete project'), isLoading: false });
      throw error;
    }
  },

  fetchProjectMembers: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ProjectMember[]>(`/api/projects/${projectId}/members/`);
      set({ activeProjectMembers: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to fetch project members'), isLoading: false });
    }
  },

  addProjectMember: async (projectId: number, email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ProjectMember>(`/api/projects/${projectId}/members/`, { email });
      set((state) => ({
        activeProjectMembers: [...state.activeProjectMembers, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to add project member'), isLoading: false });
      throw error;
    }
  },

  removeProjectMember: async (projectId: number, memberId: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/projects/${projectId}/members/${memberId}/`);
      set((state) => ({
        activeProjectMembers: state.activeProjectMembers.filter((m) => m.id !== memberId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to remove project member'), isLoading: false });
      throw error;
    }
  },

  leaveProject: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const currentUserId = useAuthStore.getState().user?.id;
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      let members = get().activeProjectMembers;
      let myMember = members.find(
        (m) => m.user_id === currentUserId && ((m.project && m.project === projectId) || (m.project_id && m.project_id === projectId))
      );

      if (!myMember) {
        const response = await apiClient.get<ProjectMember[]>(`/api/projects/${projectId}/members/`);
        members = response.data;
        myMember = members.find((m) => m.user_id === currentUserId);
      }

      if (!myMember) {
        throw new Error('You are not registered as a member of this project');
      }

      await apiClient.delete(`/api/projects/${projectId}/members/${myMember.id}/`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        activeProject: state.activeProject?.id === projectId ? null : state.activeProject,
        activeProjectMembers: state.activeProjectMembers.filter((m) => m.id !== myMember!.id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: getApiErrorMessage(error, 'Failed to leave project'), isLoading: false });
      throw error;
    }
  },
}));
