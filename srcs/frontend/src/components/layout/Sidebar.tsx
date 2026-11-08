import { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLayoutStore } from '@/stores/layoutStore';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  MessageSquare,
  FileText,
  Bot,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const helpNavigation = [
  { name: 'Privacy Policy', href: '/privacy', icon: Shield },
  { name: 'Terms of Service', href: '/terms', icon: FileText },
];

export function Sidebar() {
  const { isSidebarExpanded, toggleSidebar } = useLayoutStore();
  const { user } = useAuthStore();
  const { myTasks, fetchMyTasks } = useTaskStore();

  // Load user's assigned tasks on mount to calculate dynamic pending badge
  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks, user?.id]);

  // Count uncompleted tasks for the current user (status is TODO or IN_PROGRESS)
  const pendingTasksCount = useMemo(() => {
    return myTasks.filter((t) => t.status !== 'COMPLETED').length;
  }, [myTasks]);

  // Main navigation with real dynamic badges
  const mainNavigation = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { 
      name: 'Tasks', 
      href: '/tasks', 
      icon: CheckCircle2, 
      count: pendingTasksCount > 0 ? pendingTasksCount : undefined 
    },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'AI Assistant', href: '/ai', icon: Bot, isNew: true },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ], [pendingTasksCount]);

  const renderNavItems = (items: typeof mainNavigation) => (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.name}>
          <NavLink
            to={item.href}
            className={({ isActive }) =>
              cn('nav-link', isActive ? 'nav-link-active' : 'nav-link-inactive')
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 shrink-0" />
              {isSidebarExpanded && <span>{item.name}</span>}
            </div>

            {isSidebarExpanded && (
              <div className="flex items-center">
                {item.count !== undefined && (
                  <span className="nav-badge">{item.count}</span>
                )}
                {item.isNew && (
                  <Badge variant="info" className="ml-2 h-4 px-1.5 text-[10px]">
                    NEW
                  </Badge>
                )}
              </div>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={cn(
        'hidden border-r border-border bg-white transition-all duration-300 lg:flex lg:flex-col',
        isSidebarExpanded ? 'w-[240px]' : 'w-[72px]'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-4 border-b border-border">
        {isSidebarExpanded ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="brand-icon">
              <Hexagon className="h-5 w-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-tight">TeamUP</span>
              <span className="text-[11px] font-medium text-slate-400">Workspace</span>
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center">
            <div className="brand-icon">
              <Hexagon className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-3 gap-6 scrollbar-hide">
        <div>
          {isSidebarExpanded && (
            <div className="nav-section-label">MAIN</div>
          )}
          {renderNavItems(mainNavigation)}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border p-3 space-y-1">
        {renderNavItems(helpNavigation)}

        <button
          onClick={toggleSidebar}
          className="nav-link nav-link-inactive w-full"
        >
          <div className="flex items-center gap-3">
            {isSidebarExpanded ? (
              <ChevronLeft className="h-5 w-5 shrink-0" />
            ) : (
              <ChevronRight className="h-5 w-5 shrink-0" />
            )}
            {isSidebarExpanded && <span>Collapse</span>}
          </div>
        </button>
      </div>
    </aside>
  );
}
