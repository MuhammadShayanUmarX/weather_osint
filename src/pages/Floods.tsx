import {
  Activity,
  Gauge,
  Minus,
  TrendingDown,
  TrendingUp,
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
import { ChartLegend } from '@/components/charts/ChartLegend';
import { ChartPanel } from '@/components/charts/ChartPanel';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { MapContainer } from '@/components/map/MapContainer';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MAP_LAYERS } from '@/config/map';
import { useRegionDemo } from '@/hooks/useRegionDemo';
import {
  CHART_COLORS,
  chartAxisProps,
  chartGridProps,
} from '@/lib/chartTheme';
import { cn } from '@/lib/cn';
import { riskTone } from '@/lib/environment';

const trendIcons = {
  rising: TrendingUp,
  falling: TrendingDown,
  steady: Minus,
};

export function Floods() {
  const { region, demo } = useRegionDemo();
  const { flood } = demo;
  const floodLayers = MAP_LAYERS.filter((layer) =>
    ['flood', 'rainfall'].includes(layer.id),
  );
  const floodAlerts = demo.alerts.filter((alert) => alert.category === 'Flood');
  const warningDischarge = demo.discharge14d[0]?.warning ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Flood intelligence"
        title="Flood monitoring"
        description={`River gauge posture, discharge trends, and flood exposure signals for ${region.name}. All gauge values and discharge figures are simulated for interface development.`}
        meta="No live hydrology feed is connected in this milestone."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Composite risk"
          value={flood.riskScore}
          unit="/100"
          icon={Waves}
          tone={riskTone(flood.riskScore)}
          hint={flood.riskLabel}
        />
        <MetricCard
          label="Gauges above warning"
          value={flood.gaugesAboveWarning}
          unit={`of ${flood.rivers.length}`}
          icon={Gauge}
          tone={flood.gaugesAboveWarning > 0 ? 'warning' : 'nominal'}
          hint="Demonstration gauge network"
        />
        <MetricCard
          label="Peak discharge"
          value={flood.peakDischarge.toLocaleString('en-US')}
          unit="m³/s"
          icon={Activity}
          tone="info"
          hint="Across sampled rivers"
        />
        <MetricCard
          label="Observed trend"
          value={flood.trend}
          icon={TrendingUp}
          tone={flood.trend === 'rising' ? 'warning' : 'watch'}
          hint="Directional gauge consensus"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <MapContainer
          region={region}
          layers={floodLayers}
          layerFeatures={demo.mapFeatures}
          className="h-[420px] xl:col-span-2"
        />

        <GlassPanel className="flex flex-col xl:h-[420px]">
          <div className="panel-header">
            <div>
              <p className="panel-title">River gauges</p>
              <p className="panel-subtitle">Level relative to warning threshold</p>
            </div>
            <StatusBadge tone={riskTone(flood.riskScore)}>
              {flood.riskLabel}
            </StatusBadge>
          </div>
          <ul className="flex-1 divide-y divide-line/50 overflow-y-auto">
            {flood.rivers.map((river) => {
              const TrendIcon = trendIcons[river.trend];
              return (
                <li key={river.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-xs font-medium text-content-secondary">
                        {river.name}
                      </span>
                      <TrendIcon
                        className={cn(
                          'h-3 w-3 shrink-0',
                          river.trend === 'rising'
                            ? 'text-signal-orange'
                            : river.trend === 'falling'
                              ? 'text-signal-green'
                              : 'text-content-faint',
                        )}
                        aria-hidden="true"
                      />
                    </div>
                    <StatusBadge tone={river.status} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-content-faint">
                    <span>
                      Level{' '}
                      <b className="font-mono font-medium text-content-secondary">
                        {river.level}%
                      </b>
                    </span>
                    <span>
                      Warning{' '}
                      <b className="font-mono font-medium text-content-secondary">
                        {river.warningLevel}%
                      </b>
                    </span>
                  </div>
                  <ProgressBar
                    value={river.level}
                    max={100}
                    tone={river.status}
                    className="mt-1.5"
                  />
                </li>
              );
            })}
          </ul>
          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            Gauge levels are simulated and not operational.
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartPanel
          title="River discharge trend"
          subtitle="14-day demonstration discharge against warning threshold"
          className="xl:col-span-2"
          action={
            <ChartLegend
              items={[
                { label: 'Discharge', color: CHART_COLORS.cyan },
                { label: 'Warning', color: CHART_COLORS.red, dashed: true },
              ]}
            />
          }
          footer="Discharge is measured in cubic metres per second. Values are illustrative."
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={demo.discharge14d}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="floodDischargeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="day" {...chartAxisProps} interval={1} />
                <YAxis
                  {...chartAxisProps}
                  width={44}
                  tickFormatter={(value: number) => value.toLocaleString('en-US')}
                />
                <Tooltip
                  content={<ChartTooltip unit="m³/s" />}
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.18)' }}
                />
                <ReferenceLine
                  y={warningDischarge}
                  stroke={CHART_COLORS.red}
                  strokeDasharray="4 4"
                  strokeOpacity={0.65}
                />
                <Area
                  type="monotone"
                  dataKey="discharge"
                  name="Discharge"
                  stroke={CHART_COLORS.cyan}
                  fill="url(#floodDischargeGradient)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <AlertList
          alerts={floodAlerts}
          title="Flood signals"
          subtitle="River and exposure alerts"
          footer="Flood signals are simulated and are not official warnings."
        />
      </div>
    </div>
  );
}
