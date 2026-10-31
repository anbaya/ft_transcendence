import { create } from 'zustand';
import type { Task, TaskStatus } from '@/types/task';
import apiClient from '@/services/api/client';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchProjectTasks: (projectId: number) => Promise<void>;
  fetchMyTasks: () => Promise<void>;
  createTask: (projectId: number, data: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: number, data: Partial<Task>) => Promise<Task>;
  updateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  updateTaskAssignee: (taskId: number, assigneeId: number | null) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  reset: () => void;
}

const initialState = {
  tasks: [],
  myTasks: [],
  isLoading: false,
  error: null,
};

export const useTaskStore = create<TaskState>((set) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchProjectTasks: async (projectId: number) => {
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

  createTask: async (projectId: number, data: Partial<Task>) => {
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

  updateTask: async (taskId: number, data: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<Task>(`/api/tasks/${taskId}/`, data);
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? response.data : t),
        myTasks: state.myTasks.map((t) => t.id === taskId ? response.data : t),
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update task', isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId: number, status: TaskStatus) => {
    // Backend expects 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
    const validStatus: TaskStatus =
      status === 'COMPLETED' ? 'COMPLETED' :
      status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO';

    try {
      await apiClient.patch<Task>(`/api/tasks/${taskId}/status/`, { status: validStatus });
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status: validStatus } : t),
        myTasks: state.myTasks.map((t) => t.id === taskId ? { ...t, status: validStatus } : t),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update status' });
      throw error;
    }
  },

  updateTaskAssignee: async (taskId: number, assigneeId: number | null) => {
    try {
      const payload = { assignee_id: assigneeId ?? null };
      const response = await apiClient.patch<Task>(`/api/tasks/${taskId}/assignee/`, payload);
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? response.data : t),
        myTasks: state.myTasks.map((t) => t.id === taskId ? response.data : t),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update assignee' });
      throw error;
    }
  },

  deleteTask: async (taskId: number) => {
    try {
      await apiClient.delete(`/api/tasks/${taskId}/`);
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
