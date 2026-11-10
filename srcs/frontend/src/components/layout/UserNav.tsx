import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { User, LogOut, Shield, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UserNav() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const displayName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.email || 'User';
  const fallback = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
          <Avatar userId={user.id} fallback={fallback} size="sm" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[240px] rounded-md border border-border bg-white p-1 shadow-md animate-in fade-in-80 slide-in-from-top-2"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center gap-3 p-3 border-b border-border mb-1">
            <Avatar userId={user.id} fallback={fallback} size="md" />
            <div className="flex flex-col space-y-0.5 min-w-0">
              <span className="text-sm font-semibold text-primary truncate">{displayName}</span>
              <span className="text-xs text-muted truncate">{user.email}</span>
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
            onClick={() => navigate('/privacy')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-slate-50 rounded-sm cursor-pointer outline-none"
          >
            <Shield className="h-4 w-4 text-muted" />
            <span>Privacy Policy</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => navigate('/terms')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-slate-50 rounded-sm cursor-pointer outline-none"
          >
            <FileText className="h-4 w-4 text-muted" />
            <span>Terms of Service</span>
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
