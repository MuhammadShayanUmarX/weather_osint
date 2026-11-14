import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <ScrollToTop />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-5 sm:px-5 lg:px-6 xl:px-8 xl:py-7">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <footer className="mx-auto flex w-full max-w-[1800px] flex-col gap-1 px-4 py-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-6 xl:px-8 border-t border-[#1e2d44]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Environmental Intelligence Platform</span>
            <span className="rounded bg-[#152a47] px-1.5 py-0.5 text-[10px] text-sky-400 font-mono">v0.1.0</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Open Source</span>
            <span>|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Built for a Sustainable Future
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
