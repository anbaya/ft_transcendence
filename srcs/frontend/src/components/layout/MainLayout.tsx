
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AIChat } from '@/features/ai/components/AIChat';
import { useAIStore } from '@/stores/aiStore';

export function MainLayout() {
  const isPanelOpen = useAIStore((state) => state.isPanelOpen);
  const togglePanel = useAIStore((state) => state.togglePanel);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show side panel if we are already on the full screen AI page
  const showSidePanel = isPanelOpen && location.pathname !== '/ai';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      <Sidebar />
      <MobileNav />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col justify-between">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 w-full flex-1">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>

          {/* App Footer */}
          <footer className="border-t border-border bg-white/70 backdrop-blur-xs py-3.5 px-6 mt-auto">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-muted">
              <p>&copy; {new Date().getFullYear()} Astra Workspace. All rights reserved.</p>
              <div className="flex items-center gap-3.5">
                <Link to="/privacy" className="hover:text-primary hover:underline transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-primary hover:underline transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Global AI Side Panel Overlay */}
      {showSidePanel && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => togglePanel(false)}
          />
          {/* Side Panel Container */}
          <div className="fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] shadow-2xl animate-in slide-in-from-right duration-300">
            <AIChat 
              isFullScreen={false} 
              onClose={() => togglePanel(false)}
              onToggleFullScreen={() => {
                togglePanel(false);
                navigate('/ai');
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
