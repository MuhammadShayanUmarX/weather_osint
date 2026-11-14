import {
  Droplets,
  Minus,
  SunMedium,
  TrendingDown,
  TrendingUp,
  Users,
  Waves,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertList } from '@/components/alerts/AlertList';
import { ChartPanel } from '@/components/charts/ChartPanel';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge, StatusDot } from '@/components/ui/StatusBadge';
import { useRegionDemo } from '@/hooks/useRegionDemo';
import {
  CHART_COLORS,
  chartAxisProps,
  chartGridProps,
} from '@/lib/chartTheme';
import { cn } from '@/lib/cn';
import { formatSigned } from '@/lib/format';
import { spiLabel, spiTone } from '@/lib/environment';

const trendIcons = {
  improving: TrendingUp,
  persisting: Minus,
  deteriorating: TrendingDown,
};

const severityScale = [
  { label: 'Extreme drought', range: 'SPI ≤ -2.0', tone: 'critical' as const },
  { label: 'Severe drought', range: '-2.0 < SPI ≤ -1.5', tone: 'warning' as const },
  { label: 'Moderate drought', range: '-1.5 < SPI ≤ -1.0', tone: 'watch' as const },
  { label: 'Near normal', range: '-1.0 < SPI < 1.0', tone: 'nominal' as const },
  { label: 'Wet', range: 'SPI ≥ 1.0', tone: 'info' as const },
];

export function Drought() {
  const { region, demo } = useRegionDemo();
  const { drought } = demo;
  const TrendIcon = trendIcons[drought.trend];
  const droughtAlerts = demo.alerts.filter(
    (alert) => alert.category === 'Drought',
  );
  const impacts = region.locations.slice(0, 6).map((location, index) => {
    const offset = ((index % 3) - 1) * 0.3;
    const value =
      Math.round(Math.min(1.5, Math.max(-3, drought.spi + offset)) * 10) / 10;
    return {
      id: `drought-impact-${index}`,
      location: location.name,
      spi: value,
      soil: Math.max(5, Math.min(58, drought.soilMoisturePct + (index % 4) * 3 - 4)),
      reservoir: Math.max(
        8,
        Math.min(92, drought.reservoirPct + (index % 3) * 5 - 5),
      ),
      severity: spiLabel(value),
      tone: spiTone(value),
    };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Water availability"
        title="Drought monitoring"
        description={`Standardized precipitation, soil moisture, and reservoir signals for ${region.name}. The layout is ready for a future Copernicus Climate feed; current indicators are simulated.`}
        meta="No live drought or reservoir API is connected in this milestone."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="SPI-12"
          value={formatSigned(drought.spi)}
          icon={SunMedium}
          tone={spiTone(drought.spi)}
          hint={drought.severity}
          trend={{
            value: drought.trend,
            direction:
              drought.trend === 'improving'
                ? 'up'
                : drought.trend === 'deteriorating'
                  ? 'down'
                  : 'flat',
            positive:
              drought.trend === 'improving'
                ? true
                : drought.trend === 'deteriorating'
                  ? false
                  : undefined,
          }}
        />
        <MetricCard
          label="Soil moisture"
          value={drought.soilMoisturePct}
          unit="%"
          icon={Droplets}
          tone={drought.soilMoisturePct < 18 ? 'warning' : 'watch'}
          hint="Root-zone demonstration estimate"
        />
        <MetricCard
          label="Reservoir storage"
          value={drought.reservoirPct}
          unit="%"
          icon={Waves}
          tone={drought.reservoirPct < 35 ? 'warning' : 'watch'}
          hint="Sampled storage capacity"
        />
        <MetricCard
          label="Affected population"
          value={drought.affectedPopulation}
          icon={Users}
          tone={spiTone(drought.spi)}
          hint="Demonstration exposure estimate"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartPanel
          title="Standardized precipitation index"
          subtitle="12-month SPI-12 demonstration series"
          className="xl:col-span-2"
          action={<StatusBadge tone={spiTone(drought.spi)}>{drought.severity}</StatusBadge>}
          footer="SPI values are unitless. Negative values indicate drier-than-normal conditions."
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={demo.droughtSpi}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="droughtSpiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.orange} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={CHART_COLORS.orange} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="month" {...chartAxisProps} />
                <YAxis
                  {...chartAxisProps}
                  width={38}
                  domain={[-3, 2]}
                  ticks={[-3, -2, -1.5, -1, 0, 1, 2]}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.18)' }}
                />
                <ReferenceLine
                  y={-1}
                  stroke={CHART_COLORS.amber}
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                />
                <ReferenceLine
                  y={-1.5}
                  stroke={CHART_COLORS.orange}
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                />
                <ReferenceLine
                  y={-2}
                  stroke={CHART_COLORS.red}
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                />
                <Area
                  type="monotone"
                  dataKey="spi"
                  name="SPI-12"
                  stroke={CHART_COLORS.orange}
                  fill="url(#droughtSpiGradient)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Severity scale</p>
              <p className="panel-subtitle">SPI classification bands</p>
            </div>
            <TrendIcon
              className={cn(
                'h-4 w-4',
                drought.trend === 'improving'
                  ? 'text-signal-green'
                  : drought.trend === 'deteriorating'
                    ? 'text-signal-orange'
                    : 'text-content-faint',
              )}
              aria-hidden="true"
            />
          </div>
          <ul className="flex-1 divide-y divide-line/50">
            {severityScale.map((band) => {
              const active = band.label === drought.severity;
              return (
                <li
                  key={band.label}
                  className={cn(
                    'flex items-center justify-between gap-3 px-4 py-3',
                    active ? 'bg-white/[0.03]' : '',
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        'text-xs font-medium',
                        active ? 'text-content' : 'text-content-secondary',
                      )}
                    >
                      {band.label}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-content-faint">
                      {band.range}
                    </p>
                  </div>
                  {active ? (
                    <StatusBadge tone={band.tone} dot={false}>
                      Current
                    </StatusBadge>
                  ) : (
                    <StatusDot tone={band.tone} />
                  )}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            Classification bands are illustrative and not an official drought
            declaration.
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Water and soil indicators</p>
              <p className="panel-subtitle">Composite demonstration values</p>
            </div>
            <StatusBadge tone={spiTone(drought.spi)}>
              {drought.severity}
            </StatusBadge>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5">
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-content-muted">Soil moisture</span>
                <span className="font-mono text-content-secondary">
                  {drought.soilMoisturePct}%
                </span>
              </div>
              <ProgressBar
                value={drought.soilMoisturePct}
                tone={drought.soilMoisturePct < 18 ? 'warning' : 'watch'}
                className="mt-1.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-content-muted">Reservoir storage</span>
                <span className="font-mono text-content-secondary">
                  {drought.reservoirPct}%
                </span>
              </div>
              <ProgressBar
                value={drought.reservoirPct}
                tone={drought.reservoirPct < 35 ? 'warning' : 'watch'}
                className="mt-1.5"
              />
            </div>
            <div className="rounded-lg border border-line/70 bg-black/15 p-3">
              <p className="text-[9px] uppercase tracking-[0.12em] text-content-faint">
                Exposure estimate
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-content">
                {drought.affectedPopulation}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-content-faint">
                Illustrative population exposure based on the demonstration
                region sample.
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col xl:col-span-2">
          <div className="panel-header">
            <div>
              <p className="panel-title">Drought impact register</p>
              <p className="panel-subtitle">
                Sampled locations with SPI, soil moisture, and reservoir values
              </p>
            </div>
            <span className="chip shrink-0">{impacts.length} samples</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-2 font-semibold">Location</th>
                  <th className="px-4 py-2 font-semibold">SPI</th>
                  <th className="px-4 py-2 font-semibold">Soil moisture</th>
                  <th className="px-4 py-2 font-semibold">Reservoir</th>
                  <th className="px-4 py-2 font-semibold">Severity</th>
                </tr>
              </thead>
              <tbody>
                {impacts.map((impact) => (
                  <tr key={impact.id} className="table-row">
                    <td className="px-4 py-2.5 text-xs text-content-secondary">
                      {impact.location}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content">
                      {formatSigned(impact.spi)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                      {impact.soil}%
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                      {impact.reservoir}%
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge tone={impact.tone}>{impact.severity}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            All impact values are simulated and should not be used for
            operational water management.
          </div>
        </GlassPanel>
      </div>

      <AlertList
        alerts={droughtAlerts}
        title="Drought signals"
        subtitle="Demonstration water availability alerts"
        footer="Drought signals are simulated and are not official declarations."
      />
    </div>
  );
}
