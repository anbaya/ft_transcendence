import { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLayoutStore } from '@/stores/layoutStore';
import { useTaskStore } from '@/stores/taskStore';
import { cn } from '@/utils/cn';
import { X, LayoutDashboard, FolderKanban, CheckCircle2, MessageSquare, FileText, Bot, BarChart2, Settings, HelpCircle, Hexagon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function MobileNav() {
  const { isMobileNavOpen, closeMobileNav } = useLayoutStore();
  const { myTasks, fetchMyTasks } = useTaskStore();

  // Load user's tasks on mount to calculate dynamic pending badge
  useEffect(() => {
    if (myTasks.length === 0) {
      fetchMyTasks();
    }
  }, []);

  // Close nav when window is resized to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        closeMobileNav();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileNav]);

  // Count uncompleted tasks for the current user
  const pendingTasksCount = useMemo(() => {
    return myTasks.filter((t) => t.status !== 'Done').length;
  }, [myTasks]);

  // Main navigation with real dynamic badges
  const navigation = useMemo(() => [
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
    { name: 'Admin Console', href: '/admin', icon: Settings },
    { name: 'Help & Support', href: '/help', icon: HelpCircle },
  ], [pendingTasksCount]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden',
          isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMobileNav}
      />

      {/* Slide-over menu */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden',
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-white">
              <Hexagon className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-primary">Astra</span>
          </div>
          <button
            onClick={closeMobileNav}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-primary focus:outline-none"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={closeMobileNav}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-primary'
                    : 'text-muted hover:bg-slate-50 hover:text-primary'
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </div>
              
              <div className="flex items-center">
                {item.count !== undefined && (
                  <span className="text-xs font-semibold text-muted bg-slate-100 py-0.5 px-2 rounded-full group-hover:bg-slate-200">
                    {item.count}
                  </span>
                )}
                {item.isNew && (
                  <Badge variant="info" className="ml-2 h-4 px-1.5 text-[10px]">
                    NEW
                  </Badge>
                )}
              </div>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}
