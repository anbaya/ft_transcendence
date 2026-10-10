import { create } from 'zustand';
import type { ProjectAnalytics } from '@/types/analytics';
import apiClient from '@/services/api/client';
import { AxiosError } from 'axios';

interface AnalyticsState {
  data: ProjectAnalytics | null;
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  isServiceUnavailable: boolean;
  
  fetchAnalytics: (projectId: string | number) => Promise<void>;
  clearAnalytics: () => void;
  setSelectedProjectId: (id: string) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  selectedProjectId: null,
  isLoading: false,
  error: null,
  isServiceUnavailable: false,

  fetchAnalytics: async (projectId: string | number) => {
    set({ isLoading: true, error: null, isServiceUnavailable: false });
    try {
      const response = await apiClient.get<ProjectAnalytics>(`/api/projects/${projectId}/analytics/`);
      set({ data: response.data, isLoading: false, error: null, isServiceUnavailable: false });
    } catch (error: any) {
      let errorMsg = 'Failed to fetch analytics data.';
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 503) {
          // Specific handling for Task Service down scenario from backend ProjectAnalyticsView
          errorMsg = 'Task service is temporarily unavailable. Some analytics data could not be retrieved.';
          set({ isServiceUnavailable: true, isLoading: false });
          return;
        } else if (error.response?.data?.error) {
          errorMsg = error.response.data.error;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      set({ error: errorMsg, isLoading: false });
    }
  },

  clearAnalytics: () => {
    set({ data: null, error: null, isLoading: false, isServiceUnavailable: false });
  },

  setSelectedProjectId: (id: string) => {
    set({ selectedProjectId: id });
  }
}));
