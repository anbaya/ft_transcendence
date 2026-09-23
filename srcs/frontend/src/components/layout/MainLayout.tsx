
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
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
