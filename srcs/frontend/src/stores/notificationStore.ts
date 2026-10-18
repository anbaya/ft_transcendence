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
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
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
        const existingIds = new Set(get().notifications.map((n) => String(n.id)));
        const newUnreadItems = items.filter((n) => !existingIds.has(String(n.id)) && !n.is_read);
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
      if (state.notifications.some((n) => String(n.id) === String(notification.id))) return state;

      const messageText = notification.message || notification.content || '';
      const text = notification.title
        ? `${notification.title}${messageText ? `: ${messageText}` : ''}`
        : messageText;

      if (text) {
        toast.info(text);
      }

      const updated = [notification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      };
    });
  },
}));
