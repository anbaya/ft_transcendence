
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
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
    </div>
  );
}
