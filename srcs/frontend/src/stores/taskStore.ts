import { create } from 'zustand';
import type { Task, TaskStatus } from '@/types/task';
import apiClient from '@/services/api/client';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchProjectTasks: (projectId: string | number) => Promise<void>;
  fetchMyTasks: () => Promise<void>;
  createTask: (projectId: string | number, data: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string | number, data: Partial<Task>) => Promise<Task>;
  updateTaskStatus: (taskId: string | number, status: TaskStatus) => Promise<void>;
  updateTaskAssignee: (taskId: string | number, assigneeId: string | number | null) => Promise<void>;
  deleteTask: (taskId: string | number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  myTasks: [],
  isLoading: false,
  error: null,

  fetchProjectTasks: async (projectId: string | number) => {
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

  createTask: async (projectId: string | number, data: Partial<Task>) => {
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

  updateTask: async (taskId: string | number, data: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      try {
        response = await apiClient.patch<Task>(`/api/tasks/${taskId}/`, data);
      } catch (err) {
        response = await apiClient.patch<Task>(`/api/tasks/tasks/${taskId}/`, data);
      }
      set((state) => ({
        tasks: state.tasks.map((t) => String(t.id) === String(taskId) ? response.data : t),
        myTasks: state.myTasks.map((t) => String(t.id) === String(taskId) ? response.data : t),
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update task', isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId: string | number, status: TaskStatus) => {
    // Backend expects 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
    const validStatus: TaskStatus =
      status === 'COMPLETED' ? 'COMPLETED' :
      status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO';

    try {
      try {
        await apiClient.patch<Task>(`/api/tasks/${taskId}/status/`, { status: validStatus });
      } catch (err) {
        await apiClient.patch<Task>(`/api/tasks/tasks/${taskId}/status/`, { status: validStatus });
      }
      set((state) => ({
        tasks: state.tasks.map((t) => String(t.id) === String(taskId) ? { ...t, status: validStatus } : t),
        myTasks: state.myTasks.map((t) => String(t.id) === String(taskId) ? { ...t, status: validStatus } : t),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update status' });
      throw error;
    }
  },

  updateTaskAssignee: async (taskId: string | number, assigneeId: string | number | null) => {
    try {
      let response;
      const payload = { assignee_id: assigneeId ? Number(assigneeId) : null };
      try {
        response = await apiClient.patch<Task>(`/api/tasks/${taskId}/assignee/`, payload);
      } catch (err) {
        response = await apiClient.patch<Task>(`/api/tasks/tasks/${taskId}/assignee/`, payload);
      }
      set((state) => ({
        tasks: state.tasks.map((t) => String(t.id) === String(taskId) ? response.data : t),
        myTasks: state.myTasks.map((t) => String(t.id) === String(taskId) ? response.data : t),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update assignee' });
      throw error;
    }
  },

  deleteTask: async (taskId: string | number) => {
    try {
      try {
        await apiClient.delete(`/api/tasks/${taskId}/`);
      } catch (err) {
        await apiClient.delete(`/api/tasks/tasks/${taskId}/`);
      }
      set((state) => ({
        tasks: state.tasks.filter((t) => String(t.id) !== String(taskId)),
        myTasks: state.myTasks.filter((t) => String(t.id) !== String(taskId)),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete task' });
      throw error;
    }
  },
}));
