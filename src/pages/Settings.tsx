import {
  Bell,
  Database,
  Info,
  Map,
  Monitor,
  Palette,
  RotateCcw,
  Ruler,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { DataSourceStatus } from '@/components/data/DataSourceStatus';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Toggle } from '@/components/ui/Toggle';
import {
  MAP_ATTRIBUTION,
  MAP_STYLES,
  MAP_TILE_URL,
  MAP_TILES_CONFIGURED,
} from '@/config/map';
import { useRegionDemo } from '@/hooks/useRegionDemo';
import { buttonClasses, inputClasses, selectClasses } from '@/lib/ui';

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  action,
}: SettingsSectionProps) {
  return (
    <GlassPanel className="flex flex-col">
      <div className="panel-header">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
            <p className="panel-title">{title}</p>
          </div>
          <p className="panel-subtitle">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-5">{children}</div>
    </GlassPanel>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-line/50 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-xs font-medium text-content-secondary">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[10px] leading-relaxed text-content-faint">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Settings() {
  const { region, demo } = useRegionDemo();
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[0]?.id ?? 'ops-dark');
  const [compactDensity, setCompactDensity] = useState(false);
  const [unitSystem, setUnitSystem] = useState('Metric');
  const [timezone, setTimezone] = useState('Local time');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [notifications, setNotifications] = useState({
    severe: true,
    digest: false,
    source: true,
    reports: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  };

  const resetPreferences = () => {
    setMapStyle(MAP_STYLES[0]?.id ?? 'ops-dark');
    setCompactDensity(false);
    setUnitSystem('Metric');
    setTimezone('Local time');
    setDateFormat('DD MMM YYYY');
    setNotifications({
      severe: true,
      digest: false,
      source: true,
      reports: false,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace configuration"
        title="Settings"
        description={`Review interface preferences and integration readiness for ${region.name}. All preferences are local to this browser session and are not connected to a backend.`}
        meta="Authentication, persistence, and live feed configuration are outside this frontend milestone."
        actions={
          <button
            type="button"
            onClick={resetPreferences}
            className={buttonClasses('secondary')}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset session preferences
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <SettingsSection
            icon={Monitor}
            title="Appearance"
            description="Interface density and visual defaults for this session"
            action={<StatusBadge tone="info">Session only</StatusBadge>}
          >
            <SettingRow
              label="Theme"
              description="The command-center theme is currently dark-only."
            >
              <div className="w-44">
                <select
                  value="operations-dark"
                  disabled
                  className={selectClasses('text-xs')}
                  aria-label="Theme"
                >
                  <option value="operations-dark">Operations Dark</option>
                </select>
              </div>
            </SettingRow>
            <SettingRow
              label="Compact data density"
              description="Preference only. Dense table styling is planned."
            >
              <Toggle
                checked={compactDensity}
                onChange={setCompactDensity}
                ariaLabel="Compact data density"
              />
            </SettingRow>
            <SettingRow
              label="Default map style"
              description="Map pages currently use their own style selector."
            >
              <div className="w-44">
                <select
                  value={mapStyle}
                  onChange={(event) => setMapStyle(event.target.value)}
                  className={selectClasses('text-xs')}
                  aria-label="Default map style"
                >
                  {MAP_STYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            icon={Ruler}
            title="Units and locale"
            description="Display preferences for future live observations"
          >
            <SettingRow
              label="Unit system"
              description="Metric is used throughout the demonstration dataset."
            >
              <div className="w-44">
                <select
                  value={unitSystem}
                  onChange={(event) => setUnitSystem(event.target.value)}
                  className={selectClasses('text-xs')}
                  aria-label="Unit system"
                >
                  <option value="Metric">Metric</option>
                  <option value="Imperial">Imperial</option>
                </select>
              </div>
            </SettingRow>
            <SettingRow
              label="Timezone"
              description="The current UI displays local browser time."
            >
              <div className="w-44">
                <select
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  className={selectClasses('text-xs')}
                  aria-label="Timezone"
                >
                  <option value="Local time">Local time</option>
                  <option value="UTC">UTC</option>
                  <option value="Region local">Region local</option>
                </select>
              </div>
            </SettingRow>
            <SettingRow label="Date format" description="Used in demonstration report records.">
              <div className="w-44">
                <select
                  value={dateFormat}
                  onChange={(event) => setDateFormat(event.target.value)}
                  className={selectClasses('text-xs')}
                  aria-label="Date format"
                >
                  <option value="DD MMM YYYY">DD MMM YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            icon={Bell}
            title="Notifications"
            description="Local preferences only; no notification service is connected"
          >
            <SettingRow
              label="Severe environmental alerts"
              description="Show critical demonstration signals in the alert queue."
            >
              <Toggle
                checked={notifications.severe}
                onChange={() => toggleNotification('severe')}
                ariaLabel="Severe environmental alerts"
              />
            </SettingRow>
            <SettingRow
              label="Daily digest"
              description="Planned daily summary of regional indicators."
            >
              <Toggle
                checked={notifications.digest}
                onChange={() => toggleNotification('digest')}
                ariaLabel="Daily digest"
              />
            </SettingRow>
            <SettingRow
              label="Data source status changes"
              description="Notify when a future feed becomes degraded or offline."
            >
              <Toggle
                checked={notifications.source}
                onChange={() => toggleNotification('source')}
                ariaLabel="Data source status changes"
              />
            </SettingRow>
            <SettingRow
              label="Report delivery"
              description="Planned delivery notification for scheduled reports."
            >
              <Toggle
                checked={notifications.reports}
                onChange={() => toggleNotification('reports')}
                ariaLabel="Report delivery"
              />
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            icon={Map}
            title="Map tiles"
            description="Optional raster basemap configuration"
            action={
              <StatusBadge tone={MAP_TILES_CONFIGURED ? 'nominal' : 'watch'}>
                {MAP_TILES_CONFIGURED ? 'Configured' : 'Not configured'}
              </StatusBadge>
            }
          >
            <SettingRow
              label="Tile URL"
              description="Set VITE_MAP_TILE_URL in a local .env file to enable raster tiles."
            >
              <code className="block max-w-full truncate rounded-lg border border-line bg-black/25 px-2.5 py-1.5 font-mono text-[10px] text-content-muted">
                {MAP_TILE_URL || 'Not configured'}
              </code>
            </SettingRow>
            <SettingRow
              label="Attribution"
              description="Displayed on future raster tile sources."
            >
              <span className="block max-w-xs truncate text-[10px] text-content-muted">
                {MAP_ATTRIBUTION}
              </span>
            </SettingRow>
            <div className="py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-content-faint">
                Environment example
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-content-muted">
                <code>{`VITE_MAP_TILE_URL=https://your-tile-host/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=© Your tile provider`}</code>
              </pre>
              <p className="mt-2 text-[10px] leading-relaxed text-content-faint">
                No tile URL is bundled by default. The map falls back to a local
                graticule preview without making network requests.
              </p>
            </div>
            <SettingRow
              label="Connection test"
              description="Tile health checks are planned for a future phase."
            >
              <button
                type="button"
                disabled
                className={buttonClasses('secondary')}
              >
                Test connection
              </button>
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            icon={UserRound}
            title="Profile"
            description="No authentication or user account system is connected"
            action={<StatusBadge tone="watch">Demo</StatusBadge>}
          >
            <div className="grid gap-3 py-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-content-faint">
                  Display name
                </span>
                <input
                  type="text"
                  value="Demo analyst"
                  disabled
                  className={inputClasses('text-xs')}
                  aria-label="Display name"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-content-faint">
                  Email
                </span>
                <input
                  type="text"
                  value="Not connected"
                  disabled
                  className={inputClasses('text-xs')}
                  aria-label="Email"
                />
              </label>
            </div>
            <SettingRow
              label="Access role"
              description="Role-based access control is not implemented."
            >
              <span className="chip">Read-only demo</span>
            </SettingRow>
          </SettingsSection>
        </div>

        <div className="space-y-5">
          <GlassPanel className="flex flex-col">
            <div className="panel-header">
              <div>
                <p className="panel-title">Session context</p>
                <p className="panel-subtitle">Active workspace state</p>
              </div>
              <Palette className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
            </div>
            <dl className="divide-y divide-line/50">
              {[
                ['Region', region.name],
                ['Region code', region.shortName],
                ['Unit system', unitSystem],
                ['Timezone', timezone],
                ['Date format', dateFormat],
                ['Map tiles', MAP_TILES_CONFIGURED ? 'Configured' : 'Local preview'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <dt className="text-[10px] text-content-faint">{label}</dt>
                  <dd className="text-right text-[11px] font-medium text-content-secondary">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
              Preferences are not persisted outside this browser session.
            </div>
          </GlassPanel>

          <DataSourceStatus
            sources={demo.sources}
            title="Integration readiness"
            subtitle="All feeds remain demonstration or unconfigured"
          />

          <GlassPanel className="flex flex-col">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-signal-amber" aria-hidden="true" />
                <p className="panel-title">Milestone boundaries</p>
              </div>
            </div>
            <ul className="space-y-2 p-4 text-[10px] leading-relaxed text-content-muted">
              {[
                'No backend, database, or server-side storage.',
                'No authentication, authorization, or user accounts.',
                'No live environmental APIs or production data feeds.',
                'No report generation, file export, or scheduled delivery.',
                'Map tiles load only when an operator supplies a tile URL.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Database
                    className="mt-0.5 h-3 w-3 shrink-0 text-content-faint"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
              These boundaries are intentional for the current frontend build.
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
