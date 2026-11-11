
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
          {/* Ambient Background Wave in bottom-right */}
          <div className="fixed bottom-0 right-0 w-[550px] h-[380px] pointer-events-none select-none overflow-hidden z-0 opacity-45">
            <svg viewBox="0 0 550 380" fill="none" className="w-full h-full" preserveAspectRatio="none">
              <path d="M120 380 C 240 280, 300 330, 400 230 C 480 150, 480 210, 560 160 L 560 380 Z" fill="url(#main-wave-1)" />
              <path d="M200 380 C 290 310, 360 350, 450 270 C 510 220, 530 250, 560 220 L 560 380 Z" fill="url(#main-wave-2)" opacity="0.6" />
              <defs>
                <linearGradient id="main-wave-1" x1="120" y1="160" x2="550" y2="380">
                  <stop stopColor="#93c5fd" stopOpacity="0.45"/>
                  <stop offset="1" stopColor="#c084fc" stopOpacity="0.25"/>
                </linearGradient>
                <linearGradient id="main-wave-2" x1="200" y1="220" x2="550" y2="380">
                  <stop stopColor="#c4b5fd" stopOpacity="0.5"/>
                  <stop offset="1" stopColor="#818cf8" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 w-full flex-1 relative z-10">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>

          {/* App Footer */}
          <footer className="border-t border-border bg-white/70 backdrop-blur-xs py-3.5 px-6 mt-auto">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-muted">
              <p>&copy; {new Date().getFullYear()} TeamUP Workspace. All rights reserved.</p>
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
