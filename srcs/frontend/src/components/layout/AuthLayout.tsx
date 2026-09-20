import { Hexagon } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Branding Panel (Hidden on Mobile) */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-50 to-indigo-50 p-12 lg:flex border-r border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-white shadow-sm">
            <Hexagon className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">Astra</span>
        </div>
        
        <div className="max-w-md">
          <h2 className="text-4xl font-bold tracking-tight text-primary mb-4">
            Work, without the noise.
          </h2>
          <p className="text-lg text-muted">
            The minimalist project management platform designed for high-performance teams.
          </p>
        </div>
        
        <div className="text-sm text-muted/80 font-medium">
          &copy; {new Date().getFullYear()} Astra Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8 xl:px-24">
        {/* Mobile Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-white shadow-sm">
            <Hexagon className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">Astra</span>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
