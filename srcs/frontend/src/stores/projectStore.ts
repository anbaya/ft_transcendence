import { create } from 'zustand';
import type { Project, ProjectMember } from '@/types/project';
import apiClient from '@/services/api/client';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;

  activeProjectMembers: ProjectMember[];
  fetchProjectMembers: (projectId: string) => Promise<void>;
  addProjectMember: (projectId: string, userId: string) => Promise<ProjectMember>;
  removeProjectMember: (projectId: string, memberId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProject: null,
  activeProjectMembers: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Project[]>('/api/projects/');
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch projects', isLoading: false });
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Project>(`/api/projects/${id}/`);
      set({ activeProject: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch project', isLoading: false });
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
      set({ error: error.message || 'Failed to create project', isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
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
      set({ error: error.message || 'Failed to update project', isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/projects/${id}/`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProject: state.activeProject?.id === id ? null : state.activeProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete project', isLoading: false });
      throw error;
    }
  },

  fetchProjectMembers: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ProjectMember[]>(`/api/projects/${projectId}/members/`);
      set({ activeProjectMembers: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch project members', isLoading: false });
    }
  },

  addProjectMember: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ProjectMember>(`/api/projects/${projectId}/members/`, { user_id: userId });
      set((state) => ({
        activeProjectMembers: [...state.activeProjectMembers, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to add project member', isLoading: false });
      throw error;
    }
  },

  removeProjectMember: async (projectId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/projects/${projectId}/members/${memberId}/`);
      set((state) => ({
        activeProjectMembers: state.activeProjectMembers.filter((m) => m.id !== memberId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove project member', isLoading: false });
      throw error;
    }
  },
}));
