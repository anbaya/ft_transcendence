import { create } from 'zustand';
import type { Task, TaskStatus } from '@/types/task';
import apiClient from '@/services/api/client';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchProjectTasks: (projectId: string) => Promise<void>;
  fetchMyTasks: () => Promise<void>;
  createTask: (projectId: string, data: Partial<Task>) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTaskAssignee: (taskId: string, assigneeId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  myTasks: [],
  isLoading: false,
  error: null,

  fetchProjectTasks: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Task[]>(`/api/tasks/projects/${projectId}/tasks/`);
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  fetchMyTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Task[]>('/api/tasks/users/me/tasks/');
      set({ myTasks: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch your tasks', isLoading: false });
    }
  },

  createTask: async (projectId: string, data: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Task>(`/api/tasks/projects/${projectId}/tasks/`, data);
      set((state) => ({ 
        tasks: [...state.tasks, response.data],
        isLoading: false 
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create task', isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId: string, status: TaskStatus) => {
    try {
      const response = await apiClient.patch<Task>(`/api/tasks/tasks/${taskId}/status/`, { status });
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? response.data : t),
        myTasks: state.myTasks.map((t) => t.id === taskId ? response.data : t),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update status' });
      throw error;
    }
  },

  updateTaskAssignee: async (taskId: string, assigneeId: string) => {
    try {
      const response = await apiClient.patch<Task>(`/api/tasks/tasks/${taskId}/assignee/`, { assignee_id: assigneeId });
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? response.data : t),
        myTasks: state.myTasks.map((t) => t.id === taskId ? response.data : t),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update assignee' });
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await apiClient.delete(`/api/tasks/tasks/${taskId}/`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        myTasks: state.myTasks.filter((t) => t.id !== taskId),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete task' });
      throw error;
    }
  },
}));
