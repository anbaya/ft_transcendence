import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Branding Panel (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex border-r border-border">
        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/Workspace.jpeg"
            alt="Workspace Preview"
            className="h-full w-full object-cover object-center"
          />

        </div>

        {/* Content on top */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-sm p-1.5">
            <img src="/logo-icon.png" alt="TeamUP" className="h-full w-full object-contain" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">TeamUP</span>
        </div>

        <div className="relative z-10 max-w-lg mt-12 lg:mt-24">
          <p className="text-xs lg:text-sm font-bold tracking-widest text-slate-500 uppercase mb-4">
            The workspace for modern teams
          </p>
          
          <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Work, without<br />
            <span className="text-blue-500">the noise.</span>
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed max-w-sm mb-10">
            Plan projects, manage tasks, and keep your team aligned — all in one beautifully simple workspace.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-700 font-semibold drop-shadow-sm flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} TeamUP Inc. All rights reserved.</span>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8 xl:px-24">
        {/* Mobile Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-sm p-1.5">
            <img src="/logo-icon.png" alt="TeamUP" className="h-full w-full object-contain" />
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">TeamUP</span>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <Outlet />

          {/* Auth Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-3 text-xs text-muted">
            <Link to="/privacy" className="hover:text-primary hover:underline transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary hover:underline transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
