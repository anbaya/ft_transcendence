import { create } from 'zustand';
import type { Notification } from '@/types/notification';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

// Initial mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user-1',
    type: 'task_assigned',
    title: 'Douaa assigned you a task',
    content: '"Fix API endpoint"',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    link: '/tasks',
  },
  {
    id: '2',
    user_id: 'user-1',
    type: 'message_received',
    title: 'New message in #general',
    content: 'Anas: "Updated the docs"',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    link: '/chat',
  },
  {
    id: '3',
    user_id: 'user-1',
    type: 'project_update',
    title: 'Project "Mobile App"',
    content: 'Deadline tomorrow',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    link: '/projects',
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.is_read).length,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In a real app, this would be an API fetch. For now we just stick with mock data.
      set((state) => ({
        notifications: state.notifications,
        unreadCount: state.notifications.filter((n) => !n.is_read).length,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to fetch notifications', isLoading: false });
    }
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.is_read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },
}));
