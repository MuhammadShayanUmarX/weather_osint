import {
  Bell,
  Check,
  ChevronDown,
  Globe2,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusDot } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { useClock } from '@/hooks/useClock';
import { useRegionDemo } from '@/hooks/useRegionDemo';
import { cn } from '@/lib/cn';
import { buttonClasses, iconButtonClasses } from '@/lib/ui';
import { GlobalSearch } from './GlobalSearch';

export function Topbar() {
  const {
    regions,
    region,
    setRegionId,
    setMobileSidebarOpen,
  } = useApp();
  const { demo } = useRegionDemo();
  const now = useClock();
  const [regionOpen, setRegionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zoneLabel = timezone.split('/').pop()?.replaceAll('_', ' ') ?? timezone;

  const anyMenuOpen = regionOpen || notificationsOpen || profileOpen;

  const closeMenus = () => {
    setRegionOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-xl">
      {anyMenuOpen ? (
        <button
          type="button"
          aria-label="Close menus"
          onClick={closeMenus}
          className="fixed inset-0 z-20 cursor-default bg-transparent"
        />
      ) : null}

      <div className="flex h-16 items-center gap-2 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className={iconButtonClasses('h-9 w-9 border-line bg-white/[0.03] lg:hidden')}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="hidden min-w-0 flex-1 md:block">
          <GlobalSearch className="max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((current) => !current);
              closeMenus();
            }}
            className={iconButtonClasses('h-9 w-9 border-line bg-white/[0.03] md:hidden')}
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setRegionOpen((current) => !current);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
              className={buttonClasses('secondary', 'sm', 'h-9 max-w-[9.5rem] gap-2 sm:max-w-none')}
              aria-expanded={regionOpen}
              aria-haspopup="listbox"
            >
              <Globe2 className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
              <span className="hidden truncate xl:inline">{region.name}</span>
              <span className="truncate xl:hidden">{region.shortName}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-content-muted transition-transform',
                  regionOpen ? 'rotate-180' : '',
                )}
                aria-hidden="true"
              />
            </button>

            {regionOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-64 overflow-hidden rounded-xl border border-line-strong bg-surface-overlay/95 shadow-float backdrop-blur-xl">
                <div className="border-b border-line/70 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-content-muted">
                    Geographic region
                  </p>
                  <p className="mt-0.5 text-[10px] text-content-faint">
                    Updates the map viewport and demonstration context.
                  </p>
                </div>
                <ul className="p-1.5" role="listbox" aria-label="Geographic region">
                  {regions.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={item.id === region.id}
                        onClick={() => {
                          setRegionId(item.id);
                          setRegionOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors',
                          item.id === region.id
                            ? 'bg-accent-cyan/10 text-accent-cyan'
                            : 'text-content-secondary hover:bg-white/[0.05] hover:text-content',
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium">
                            {item.name}
                          </span>
                          <span className="block text-[10px] text-content-faint">
                            {item.locations.length} demonstration locations
                          </span>
                        </span>
                        {item.id === region.id ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="hidden flex-col items-end border-l border-line/70 pl-3 xl:flex">
            <span className="font-mono text-xs font-medium text-content-secondary">
              {timeLabel}
            </span>
            <span className="text-[10px] text-content-faint">
              {dateLabel} · {zoneLabel}
            </span>
          </div>

          <Link
            to="/settings"
            className="hidden items-center gap-2 rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-content-muted transition-colors hover:border-line-strong hover:text-content-secondary lg:inline-flex"
          >
            <StatusDot tone="watch" />
            Sources simulated
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((current) => !current);
                setRegionOpen(false);
                setProfileOpen(false);
              }}
              className={iconButtonClasses('relative h-9 w-9 border-line bg-white/[0.03]')}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-canvas bg-signal-amber" />
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-line-strong bg-surface-overlay/95 shadow-float backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-line/70 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-content">
                      Environmental alerts
                    </p>
                    <p className="text-[10px] text-content-faint">
                      {region.name} · demonstration feed
                    </p>
                  </div>
                  <span className="chip py-0.5 text-[9px]">Simulated</span>
                </div>
                <ul className="max-h-72 overflow-y-auto p-1.5">
                  {demo.alerts.slice(0, 4).map((alert) => (
                    <li key={alert.id}>
                      <Link
                        to="/"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.05]"
                      >
                        <StatusDot tone={alert.severity} className="mt-1.5" />
                        <span className="min-w-0">
                          <span className="block text-[11px] font-medium leading-snug text-content-secondary">
                            {alert.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-content-faint">
                            {alert.category} · {alert.time}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line/70 px-3 py-2 text-[10px] text-content-faint">
                  All alerts are simulated. Alert center arrives in a later phase.
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((current) => !current);
                setRegionOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex h-9 items-center gap-2 rounded-full border border-line bg-white/[0.03] pl-1 pr-2 transition-colors hover:border-line-strong"
              aria-label="User profile"
              aria-expanded={profileOpen}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-cyan/20 bg-accent-cyan/10 text-[10px] font-semibold text-accent-cyan">
                OP
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-[11px] font-medium leading-tight text-content">
                  Operator
                </span>
                <span className="block text-[9px] leading-tight text-content-faint">
                  Analyst
                </span>
              </span>
              <ChevronDown
                className="hidden h-3.5 w-3.5 text-content-muted sm:block"
                aria-hidden="true"
              />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-xl border border-line-strong bg-surface-overlay/95 shadow-float backdrop-blur-xl">
                <div className="border-b border-line/70 px-3 py-2.5">
                  <p className="text-xs font-medium text-content">Operator profile</p>
                  <p className="text-[10px] text-content-faint">
                    Placeholder account
                  </p>
                </div>
                <div className="p-1.5">
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-content-secondary transition-colors hover:bg-white/[0.05] hover:text-content"
                  >
                    <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                    Profile and preferences
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-content-secondary transition-colors hover:bg-white/[0.05] hover:text-content"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Data source settings
                  </Link>
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-content-faint opacity-60"
                  >
                    <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                    Workspace admin · planned
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="border-t border-line/60 p-3 md:hidden">
          <GlobalSearch
            autoFocus
            onNavigate={() => setMobileSearchOpen(false)}
          />
        </div>
      ) : null}
    </header>
  );
}
