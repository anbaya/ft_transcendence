import { useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { Bell, Check, CheckCircle2, MessageSquare, ClipboardList, Briefcase, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <ClipboardList className="h-5 w-5 text-indigo-500" />;
      case 'message_received':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'project_update':
        return <Briefcase className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-sm text-muted mt-1">Manage your alerts and activity updates</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-secondary rounded-md text-sm font-medium transition-colors"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 border-b border-border pb-px">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            filter === 'all' 
              ? "border-secondary text-secondary" 
              : "border-transparent text-muted hover:text-primary hover:border-slate-300"
          )}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            filter === 'unread' 
              ? "border-secondary text-secondary" 
              : "border-transparent text-muted hover:text-primary hover:border-slate-300"
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span className="bg-error text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
        {filteredNotifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center pb-20">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <CheckCircle2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-1">
              {filter === 'unread' ? "No unread notifications" : "You're all caught up!"}
            </h3>
            <p className="text-sm text-muted">
              {filter === 'unread' 
                ? "You've read all your notifications." 
                : "When you get notifications, they'll show up here."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id, notification.link)}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer group",
                  notification.is_read
                    ? "bg-white border-border hover:border-slate-300 hover:shadow-sm"
                    : "bg-[#F8FAFC] border-secondary/20 hover:border-secondary/40 shadow-sm"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-full shrink-0",
                  notification.is_read ? "bg-slate-100" : "bg-white shadow-sm ring-1 ring-slate-200"
                )}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={cn(
                      "text-sm",
                      notification.is_read ? "font-medium text-primary" : "font-bold text-primary"
                    )}>
                      {notification.title}
                    </h4>
                    <span className="text-xs font-medium text-muted/60 whitespace-nowrap shrink-0 mt-0.5 uppercase tracking-wider">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted line-clamp-2">
                    {notification.content}
                  </p>
                </div>

                {!notification.is_read && (
                  <div className="shrink-0 flex items-center h-10">
                    <span className="h-2.5 w-2.5 bg-secondary rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
