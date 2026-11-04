
import { useLocation } from 'react-router-dom';
import { Bot, Menu } from 'lucide-react';
import { UserNav } from './UserNav';
import { NotificationNav } from './NotificationNav';
import { useLayoutStore } from '@/stores/layoutStore';
import { useAIStore } from '@/stores/aiStore';

export function Header() {
  const location = useLocation();
  const toggleMobileNav = useLayoutStore((state) => state.toggleMobileNav);

  // Simple title formatter based on pathname
  const formatPageTitle = (pathname: string) => {
    if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
    const path = pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const pageTitle = formatPageTitle(location.pathname);

  return (
    <header className="app-header">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-4">
        <button onClick={toggleMobileNav} className="lg:hidden icon-btn">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-primary hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => {
            const { togglePanel } = useAIStore.getState();
            togglePanel();
          }}
          className="hidden sm:flex icon-btn icon-btn-accent"
        >
          <Bot className="h-5 w-5" />
        </button>

        <NotificationNav />

        <div className="divider-v hidden sm:block mx-1" />

        <UserNav />
      </div>
    </header>
  );
}
