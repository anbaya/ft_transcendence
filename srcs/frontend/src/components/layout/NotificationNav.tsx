import { useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { wsClient } from '@/services/websocket/client';
import { WS_EVENTS } from '@/services/websocket/events';
import type { Notification } from '@/types/notification';

export function NotificationNav() {
  const { notifications, unreadCount, markAllAsRead, markAsRead, fetchNotifications, addNotification } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    
    wsClient.connect();
    const unsubscribe = wsClient.on(WS_EVENTS.NOTIFICATION_CREATED, (payload: Notification) => {
      addNotification(payload);
    });

    return () => unsubscribe();
  }, [fetchNotifications, addNotification]);

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-error ring-2 ring-white" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[340px] rounded-md border border-border bg-white p-1 shadow-lg animate-in fade-in-80 slide-in-from-top-2"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between px-3 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-secondary hover:text-secondary/80 hover:underline flex items-center gap-1 transition-colors"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[360px] overflow-y-auto p-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                  <CheckCircle2 className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-primary">You're all caught up!</p>
                <p className="text-xs text-muted mt-1">No new notifications at the moment.</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <DropdownMenu.Item
                  key={notification.id}
                  onSelect={() => handleNotificationClick(notification.id, notification.link)}
                  className={cn(
                    'flex cursor-pointer flex-col rounded-md px-3 py-2.5 outline-none transition-colors mb-1 last:mb-0',
                    notification.is_read 
                      ? 'hover:bg-slate-50 focus:bg-slate-50' 
                      : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-[#F1F5F9]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        'text-sm leading-tight',
                        notification.is_read ? 'font-medium text-primary' : 'font-semibold text-primary'
                      )}
                    >
                      {notification.title}
                    </span>
                    {!notification.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary shadow-sm" />
                    )}
                  </div>
                  <span className="text-xs text-muted mt-1 line-clamp-2">{notification.content}</span>
                  <span className="text-[10px] font-medium text-muted/60 mt-1.5 uppercase tracking-wider">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </DropdownMenu.Item>
              ))
            )}
          </div>

          <div className="border-t border-border mt-1 pt-1">
            <DropdownMenu.Item asChild>
              <Link 
                to="/notifications"
                className="flex cursor-pointer items-center justify-center rounded-md px-3 py-2.5 text-xs font-medium text-secondary outline-none hover:bg-slate-50 focus:bg-slate-50 transition-colors"
              >
                View all notifications &rarr;
              </Link>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
