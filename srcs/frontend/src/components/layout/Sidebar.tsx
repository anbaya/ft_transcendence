import { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLayoutStore } from '@/stores/layoutStore';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  MessageSquare,
  FileText,
  Bot,
  BarChart2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  ChevronsUpDown,
  Building2,
  Plus,
  ShieldAlert
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Badge } from '@/components/ui/Badge';

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: Settings },
  { name: 'Role Management', href: '/admin/roles', icon: ShieldAlert },
];

const helpNavigation = [
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const { isSidebarExpanded, toggleSidebar } = useLayoutStore();
  const { user } = useAuthStore();
  const { myTasks, fetchMyTasks } = useTaskStore();
  const { 
    organizations, 
    activeOrganization, 
    fetchOrganizations, 
    setActiveOrganization 
  } = useOrganizationStore();

  // Load user's assigned tasks on mount to calculate dynamic pending badge
  useEffect(() => {
    if (myTasks.length === 0) {
      fetchMyTasks();
    }
  }, []);

  // Load user's organizations on mount
  useEffect(() => {
    if (organizations.length === 0) {
      fetchOrganizations();
    }
  }, []);

  // Default active organization to the first one once loaded if none is active
  useEffect(() => {
    if (organizations.length > 0 && !activeOrganization) {
      setActiveOrganization(organizations[0]);
    }
  }, [organizations, activeOrganization]);

  // Count uncompleted tasks for the current user
  const pendingTasksCount = useMemo(() => {
    return myTasks.filter((t) => t.status !== 'Done').length;
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
              cn(
                'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-primary'
                  : 'text-muted hover:bg-slate-50 hover:text-primary'
              )
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 shrink-0" />
              {isSidebarExpanded && <span>{item.name}</span>}
            </div>
            
            {isSidebarExpanded && (
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
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  const currentOrgName = activeOrganization?.name || (organizations.length > 0 ? organizations[0].name : 'Personal Workspace');

  return (
    <aside
      className={cn(
        'hidden border-r border-border bg-white transition-all duration-300 lg:flex lg:flex-col',
        isSidebarExpanded ? 'w-[240px]' : 'w-[72px]'
      )}
    >
      {/* Brand & Organization Switcher */}
      <div className="flex h-16 shrink-0 items-center px-3 border-b border-border">
        {isSidebarExpanded ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex w-full items-center justify-between rounded-md p-1.5 hover:bg-slate-50 outline-none transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-white font-bold text-xs uppercase">
                    {activeOrganization ? activeOrganization.name.charAt(0) : <Hexagon className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <span className="text-sm font-bold text-primary leading-tight">Astra</span>
                    <span className="text-xs text-muted truncate">{currentOrgName}</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted shrink-0 ml-1" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="start" className="w-[220px] z-50 bg-white rounded-md p-1 shadow-md border border-border animate-in fade-in-80">
                <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-muted">
                  Organizations
                </DropdownMenu.Label>
                {organizations.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-slate-400">
                    No organizations found
                  </div>
                ) : (
                  organizations.map((org) => {
                    const isActive = (activeOrganization?.id || organizations[0]?.id) === org.id;
                    return (
                      <DropdownMenu.Item 
                        key={org.id} 
                        onClick={() => setActiveOrganization(org)}
                        className="flex items-center px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-slate-100 rounded-sm"
                      >
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-secondary text-white text-[10px] font-bold uppercase mr-2">
                          {org.name.charAt(0)}
                        </div>
                        <span className="flex-1 truncate">{org.name}</span>
                        {isActive && (
                          <Badge variant="default" className="text-[10px] py-0 px-1 ml-2">Active</Badge>
                        )}
                      </DropdownMenu.Item>
                    );
                  })
                )}
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                <NavLink to="/organizations" className="block outline-none">
                  <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-slate-100 rounded-sm">
                    <Building2 className="mr-2 h-4 w-4 text-muted" />
                    Manage Organizations
                  </DropdownMenu.Item>
                </NavLink>
                <NavLink to="/organizations" className="block outline-none">
                  <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-slate-100 rounded-sm">
                    <Plus className="mr-2 h-4 w-4 text-muted" />
                    Create Organization
                  </DropdownMenu.Item>
                </NavLink>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <div className="flex w-full items-center justify-center pt-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-white font-bold text-xs uppercase">
              {activeOrganization ? activeOrganization.name.charAt(0) : <Hexagon className="h-5 w-5" />}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-3 gap-6 scrollbar-hide">
        <div>
          {isSidebarExpanded && (
            <div className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted/70">
              MAIN
            </div>
          )}
          {renderNavItems(mainNavigation)}
        </div>

        {user?.role === 'ADMIN' && (
          <div>
            {isSidebarExpanded && (
              <div className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted/70">
                ADMIN
              </div>
            )}
            {renderNavItems(adminNavigation)}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border p-3 space-y-1">
        {renderNavItems(helpNavigation)}
        
        <button
          onClick={toggleSidebar}
          className="group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-slate-50 hover:text-primary transition-colors"
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
