
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

// Mock data for notifications
const notifications = [
  {
    id: '1',
    title: 'Douaa assigned you a task',
    description: '"Fix API endpoint"',
    time: '2 minutes ago',
    unread: true,
  },
  {
    id: '2',
    title: 'New message in #general',
    description: 'Anas: "Updated the docs"',
    time: '15 minutes ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Project "Mobile App"',
    description: 'Deadline tomorrow',
    time: '1 hour ago',
    unread: false,
  },
];

export function NotificationNav() {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-error ring-2 ring-white" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[320px] rounded-md border border-border bg-white p-1 shadow-md animate-in fade-in-80 slide-in-from-top-2"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-sm font-semibold text-primary">Notifications</span>
            <button className="text-xs text-secondary hover:underline">
              Mark all read
            </button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-1">
            {notifications.map((notification) => (
              <DropdownMenu.Item
                key={notification.id}
                className={cn(
                  'flex cursor-pointer flex-col rounded-sm px-3 py-2 outline-none focus:bg-slate-100',
                  notification.unread && 'bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-sm',
                      notification.unread ? 'font-semibold text-primary' : 'font-medium text-muted'
                    )}
                  >
                    {notification.title}
                  </span>
                  {notification.unread && (
                    <span className="h-2 w-2 rounded-full bg-secondary" />
                  )}
                </div>
                <span className="text-xs text-muted mt-0.5">{notification.description}</span>
                <span className="text-[10px] text-muted/70 mt-1">{notification.time}</span>
              </DropdownMenu.Item>
            ))}
          </div>

          <div className="border-t border-border mt-1 pt-1">
            <DropdownMenu.Item className="flex cursor-pointer items-center justify-center rounded-sm px-3 py-2 text-xs font-medium text-secondary outline-none hover:underline focus:bg-slate-100">
              View all notifications &rarr;
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
