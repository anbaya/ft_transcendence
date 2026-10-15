import { create } from 'zustand';
import type { Notification } from '@/types/notification';
import apiClient from '@/services/api/client';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get<Notification[]>('/api/notifications/');
      const items = response.data || [];
      set({
        notifications: items,
        unreadCount: items.filter((n) => !n.is_read).length,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch notifications', isLoading: false });
    }
  },

  markAsRead: async (id: string | number) => {
    try {
      await apiClient.patch(`/api/notifications/${id}/read/`);
      set((state) => {
        const updatedNotifications = state.notifications.map((n) =>
          String(n.id) === String(id) ? { ...n, is_read: true } : n
        );
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter((n) => !n.is_read).length,
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.patch('/api/notifications/read-all/');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => {
      // Prevent duplicates
      if (state.notifications.some(n => String(n.id) === String(notification.id))) return state;
      const updated = [notification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      };
    });
  }
}));
