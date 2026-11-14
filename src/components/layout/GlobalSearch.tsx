import { MapPin, Search, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allNavigationItems } from '@/config/navigation';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/cn';
import { inputClasses } from '@/lib/ui';

interface GlobalSearchProps {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  to: string;
}

export function GlobalSearch({
  className,
  autoFocus = false,
  onNavigate,
}: GlobalSearchProps) {
  const { region } = useApp();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const navResults = useMemo<SearchResult[]>(() => {
    return allNavigationItems
      .filter((item) =>
        normalizedQuery
          ? item.label.toLowerCase().includes(normalizedQuery)
          : ['Overview', 'Live Weather', 'Geographic Analysis', 'Reports'].includes(
              item.label,
            ),
      )
      .slice(0, 5)
      .map((item) => ({
        id: `nav-${item.path}`,
        label: item.label,
        sublabel: 'Workspace page',
        icon: item.icon,
        to: item.path,
      }));
  }, [normalizedQuery]);

  const locationResults = useMemo<SearchResult[]>(() => {
    return region.locations
      .filter((location) =>
        normalizedQuery
          ? location.name.toLowerCase().includes(normalizedQuery)
          : true,
      )
      .slice(0, 5)
      .map((location) => ({
        id: `location-${location.name}`,
        label: location.name,
        sublabel: `${region.name} · demonstration location`,
        icon: MapPin,
        to: `/geographic-analysis?lng=${location.coordinates[0]}&lat=${location.coordinates[1]}&name=${encodeURIComponent(location.name)}`,
      }));
  }, [normalizedQuery, region]);

  const results = [...navResults, ...locationResults];

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      setOpen(true);
    }
  }, [autoFocus]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (result: SearchResult) => {
    navigate(result.to);
    setQuery('');
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search locations, layers, pages..."
          aria-label="Global search"
          className={inputClasses('h-9 bg-black/30 pl-9 pr-14')}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-white/[0.02] px-1.5 py-0.5 font-mono text-[10px] text-content-faint sm:block">
          Ctrl K
        </span>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-line-strong bg-surface-overlay/95 shadow-float backdrop-blur-xl">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-white/[0.03] text-content-muted">
                      <result.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-content">
                        {result.label}
                      </span>
                      <span className="block truncate text-[10px] text-content-faint">
                        {result.sublabel}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-medium text-content-secondary">
                No demonstration matches
              </p>
              <p className="mt-1 text-[10px] text-content-faint">
                Search workspace pages or locations in {region.name}.
              </p>
            </div>
          )}
          <div className="border-t border-line/70 px-3 py-2 text-[10px] text-content-faint">
            Searches workspace pages and demonstration locations only.
          </div>
        </div>
      ) : null}
    </div>
  );
}
