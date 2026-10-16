import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { useAuthStore } from '@/stores/authStore';
import { User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UserNav() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const displayName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.email || 'User';

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
          <Avatar.Root className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            <Avatar.Image
              className="h-full w-full object-cover"
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`}
              alt={displayName}
            />
            <Avatar.Fallback className="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-medium text-primary">
              {displayName.charAt(0).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[240px] rounded-md border border-border bg-white p-1 shadow-md animate-in fade-in-80 slide-in-from-top-2"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center gap-3 p-3 border-b border-border mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
              <Avatar.Root>
                <Avatar.Image
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`}
                  alt={displayName}
                />
                <Avatar.Fallback>{displayName.charAt(0).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
            </div>
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold text-primary">{displayName}</span>
              <span className="text-xs text-muted">{user.email}</span>
            </div>
          </div>

          <DropdownMenu.Item
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-slate-50 rounded-sm cursor-pointer outline-none"
          >
            <User className="h-4 w-4 text-muted" />
            <span>Profile</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-slate-50 rounded-sm cursor-pointer outline-none"
          >
            <Settings className="h-4 w-4 text-muted" />
            <span>Settings</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <DropdownMenu.Item
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-sm cursor-pointer outline-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
