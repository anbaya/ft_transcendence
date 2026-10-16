
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
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-md md:px-6">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileNav}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle mobile menu</span>
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
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-indigo-50 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
        >
          <Bot className="h-5 w-5" />
          <span className="sr-only">AI Assistant</span>
        </button>

        <NotificationNav />

        <div className="h-6 w-px bg-border hidden sm:block mx-1" />

        <UserNav />
      </div>
    </header>
  );
}
