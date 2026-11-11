import { create } from 'zustand';
import type { Notification } from '@/types/notification';
import apiClient from '@/services/api/client';
import { toast } from '@/stores/toastStore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

let hasInitialFetchCompleted = false;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchNotifications: async () => {
    try {
      const response = await apiClient.get<Notification[]>('/api/notifications/');
      const items = response.data || [];
      // If this is a background poll (not the first page load)
      if (hasInitialFetchCompleted) {
        const existingIds = new Set(get().notifications.map((n) => n.id));
        const newUnreadItems = items.filter((n) => !existingIds.has(n.id) && !n.is_read);
        // Pop a toast for every new notification that arrived
        newUnreadItems.forEach((n) => {
          const messageText = n.message || n.content || '';
          const text = n.title ? `${n.title}: ${messageText}` : messageText;
          if (text) {
            toast.info(text);
          }
        });
      }
      hasInitialFetchCompleted = true;
      set({
        notifications: items,
        unreadCount: items.filter((n) => !n.is_read).length,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch notifications', isLoading: false });
    }
  },

  markAsRead: async (id: number) => {
    try {
      await apiClient.patch(`/api/notifications/${id}/read/`);
      set((state) => {
        const updatedNotifications = state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter((n) => !n.is_read).length,
        };
      });
    } catch {
      // Ignore notification read failure silently
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.patch('/api/notifications/read-all/');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch {
      // Ignore notification read failure silently
    }
  },
}));
