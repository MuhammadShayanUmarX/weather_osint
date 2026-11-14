import {
  PanelLeftClose,
  PanelLeftOpen,
  Radar,
  X,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { navigationGroups } from '@/config/navigation';
import { useApp } from '@/context/AppContext';

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useApp();

  const collapsed = sidebarCollapsed && !mobileSidebarOpen;

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileSidebarOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          mobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-canvas/95 backdrop-blur-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 lg:bg-canvas/70',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-[84px]' : 'lg:w-[264px]',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line/70 px-4">
          <Link
            to="/"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan shadow-glow">
              <Radar className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full border border-canvas bg-signal-green" />
            </span>
            {!collapsed ? (
              <span className="min-w-0">
                <span className="block text-[9px] font-medium uppercase tracking-[0.24em] text-content-muted">
                  Environmental
                </span>
                <span className="block truncate text-[13px] font-semibold tracking-[0.08em] text-content">
                  INTELLIGENCE
                </span>
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-content-muted hover:bg-white/[0.05] hover:text-content lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigationGroups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              {!collapsed ? (
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-content-faint">
                  {group.label}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-5 bg-line" />
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-lg py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40',
                          collapsed ? 'justify-center px-0' : 'px-2.5',
                          isActive
                            ? 'bg-white/[0.055] text-content'
                            : 'text-content-muted hover:bg-white/[0.03] hover:text-content-secondary',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              'absolute bottom-1.5 left-0 top-1.5 w-px rounded-full bg-accent-cyan transition-opacity',
                              isActive ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <item.icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors',
                              isActive
                                ? 'text-accent-cyan'
                                : 'text-content-muted group-hover:text-content-secondary',
                            )}
                            aria-hidden="true"
                          />
                          {!collapsed ? (
                            <span className="truncate">{item.label}</span>
                          ) : null}
                          {!collapsed && isActive ? (
                            <span className="ml-auto h-1 w-1 rounded-full bg-accent-cyan" />
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-line/70 p-3">
          {!collapsed ? (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#1e2f47] bg-[#0c1626]/80 p-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Radar className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-200">Environmental Intelligence</p>
                <p className="text-[10px] text-slate-400">Open Source • Real Data • Safer Future</p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'hidden h-8 w-full items-center gap-2 rounded-lg px-2 text-xs text-content-muted transition-colors hover:bg-white/[0.04] hover:text-content lg:flex',
              collapsed ? 'justify-center px-0' : 'justify-start',
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
