import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_REGION_ID, getRegion, REGIONS } from '@/data/regions';
import type { Region } from '@/types';

interface AppContextValue {
  regions: Region[];
  region: Region;
  setRegionId: (regionId: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const REGION_STORAGE_KEY = 'ei-region';
const SIDEBAR_STORAGE_KEY = 'ei-sidebar-collapsed';

function readRegionId(): string {
  const stored = localStorage.getItem(REGION_STORAGE_KEY);
  if (stored && REGIONS.some((region) => region.id === stored)) {
    return stored;
  }
  return DEFAULT_REGION_ID;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [regionId, setRegionIdState] = useState<string>(readRegionId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true',
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const setRegionId = useCallback((nextRegionId: string) => {
    setRegionIdState(nextRegionId);
    localStorage.setItem(REGION_STORAGE_KEY, nextRegionId);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const region = useMemo(() => getRegion(regionId), [regionId]);

  const value = useMemo<AppContextValue>(
    () => ({
      regions: REGIONS,
      region,
      setRegionId,
      sidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      setMobileSidebarOpen,
    }),
    [
      region,
      setRegionId,
      sidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
