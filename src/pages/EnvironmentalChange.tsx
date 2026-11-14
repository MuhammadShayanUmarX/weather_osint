import {
  Flame,
  Leaf,
  Satellite,
  TreePine,
  Waves,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartLegend } from '@/components/charts/ChartLegend';
import { ChartPanel } from '@/components/charts/ChartPanel';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRegionDemo } from '@/hooks/useRegionDemo';
import {
  CHART_COLORS,
  chartAxisProps,
  chartGridProps,
} from '@/lib/chartTheme';
import { cn } from '@/lib/cn';
import { formatSigned } from '@/lib/format';
import type { StatusTone } from '@/types';

export function EnvironmentalChange() {
  const { region, demo } = useRegionDemo();
  const { environmentalChange } = demo;
  const changeSamples = demo.airQuality.stations.slice(0, 6).map((station, index) => {
    const indicator = [
      'NDVI decline',
      'Water extent increase',
      'Burned area',
      'Urban expansion',
      'Vegetation recovery',
      'Surface water loss',
    ][index % 6] as string;
    const delta = [
      environmentalChange.ndviAnomaly,
      environmentalChange.waterChangePct,
      -3.4,
      environmentalChange.urbanExpansionHa / 10,
      Math.abs(environmentalChange.ndviAnomaly) * 0.4,
      environmentalChange.waterChangePct * 0.6,
    ][index % 6] as number;
    const changeTone: StatusTone =
      delta < -10 ? 'warning' : delta < 0 ? 'watch' : 'nominal';
    return {
      id: `change-${station.id}`,
      location: station.name,
      indicator,
      delta,
      confidence: Math.min(
        98,
        environmentalChange.changeConfidence + (index % 3) * 2,
      ),
      tone: changeTone,
    };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Land surface intelligence"
        title="Environmental change"
        description={`Vegetation, water, and land-cover change signals for ${region.name}. The page is structured for future Sentinel-2 and land-cover feeds; all current values are simulated.`}
        meta="No satellite imagery or land-cover API is connected in this milestone."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="NDVI anomaly"
          value={formatSigned(environmentalChange.ndviAnomaly)}
          unit="%"
          icon={Leaf}
          tone={environmentalChange.ndviAnomaly < -10 ? 'warning' : 'nominal'}
          hint="Against seasonal baseline"
        />
        <MetricCard
          label="Vegetation loss"
          value={environmentalChange.vegetationLossHa.toLocaleString('en-US')}
          unit="ha"
          icon={TreePine}
          tone="watch"
          hint="Sampled change area"
        />
        <MetricCard
          label="Surface water change"
          value={formatSigned(environmentalChange.waterChangePct)}
          unit="%"
          icon={Waves}
          tone={environmentalChange.waterChangePct < 0 ? 'watch' : 'nominal'}
          hint="Demonstration extent change"
        />
        <MetricCard
          label="Burned area"
          value={environmentalChange.burnedAreaHa.toLocaleString('en-US')}
          unit="ha"
          icon={Flame}
          tone={environmentalChange.burnedAreaHa > 1500 ? 'warning' : 'watch'}
          hint="Thermal scar estimate"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartPanel
          title="NDVI trend"
          subtitle="12-month vegetation index against seasonal baseline"
          className="xl:col-span-2"
          action={
            <ChartLegend
              items={[
                { label: 'NDVI', color: CHART_COLORS.green },
                { label: 'Baseline', color: CHART_COLORS.amber, dashed: true },
              ]}
            />
          }
          footer="NDVI is a normalized difference vegetation index. Values are illustrative."
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={demo.ndviTrend}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="month" {...chartAxisProps} />
                <YAxis
                  {...chartAxisProps}
                  width={38}
                  domain={[0, 0.8]}
                  tickFormatter={(value: number) => value.toFixed(1)}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.18)' }}
                />
                <Line
                  type="monotone"
                  dataKey="ndvi"
                  name="NDVI"
                  stroke={CHART_COLORS.green}
                  strokeWidth={2}
                  dot={{ r: 2, fill: CHART_COLORS.green, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Change confidence</p>
              <p className="panel-subtitle">Demonstration detection quality</p>
            </div>
            <StatusBadge tone="info">Simulated</StatusBadge>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <p className="stat-label">Composite confidence</p>
            <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-content">
              {environmentalChange.changeConfidence}
              <span className="ml-1 text-base font-medium text-content-muted">%</span>
            </p>
            <ProgressBar
              value={environmentalChange.changeConfidence}
              max={100}
              tone="nominal"
              className="mt-3"
            />

            <div className="mt-5 space-y-3">
              {[
                {
                  label: 'Vegetation loss',
                  value: environmentalChange.vegetationLossHa,
                  max: 5000,
                  tone: 'watch' as const,
                },
                {
                  label: 'Urban expansion',
                  value: environmentalChange.urbanExpansionHa,
                  max: 1000,
                  tone: 'info' as const,
                },
                {
                  label: 'Burned area',
                  value: environmentalChange.burnedAreaHa,
                  max: 3000,
                  tone: 'warning' as const,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[10px] text-content-muted">
                    <span>{item.label}</span>
                    <span className="font-mono text-content-secondary">
                      {item.value.toLocaleString('en-US')} ha
                    </span>
                  </div>
                  <ProgressBar
                    value={item.value}
                    max={item.max}
                    tone={item.tone}
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>

            <p className="mt-auto border-t border-line/60 pt-3 text-[10px] leading-relaxed text-content-faint">
              Confidence values are illustrative and do not reflect a production
              change-detection model.
            </p>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Land cover signals</p>
              <p className="panel-subtitle">Change classes in the demo sample</p>
            </div>
            <span className="chip shrink-0">Simulated</span>
          </div>
          <ul className="flex-1 divide-y divide-line/50">
            {[
              {
                label: 'Vegetation cover',
                value: environmentalChange.ndviAnomaly,
                unit: '%',
                tone: (environmentalChange.ndviAnomaly < 0
                  ? 'warning'
                  : 'nominal') as StatusTone,
              },
              {
                label: 'Surface water',
                value: environmentalChange.waterChangePct,
                unit: '%',
                tone: (environmentalChange.waterChangePct < 0
                  ? 'watch'
                  : 'nominal') as StatusTone,
              },
              {
                label: 'Urban footprint',
                value: environmentalChange.urbanExpansionHa,
                unit: 'ha',
                tone: 'info' as StatusTone,
              },
              {
                label: 'Burned area',
                value: environmentalChange.burnedAreaHa,
                unit: 'ha',
                tone: 'warning' as StatusTone,
              },
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="text-xs text-content-secondary">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-content">
                    {item.unit === '%' ? formatSigned(item.value) : item.value.toLocaleString('en-US')}{' '}
                    {item.unit}
                  </span>
                  <StatusBadge tone={item.tone} dot={false}>
                    {item.value < 0 ? 'Decline' : 'Increase'}
                  </StatusBadge>
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel className="flex flex-col xl:col-span-2">
          <div className="panel-header">
            <div>
              <p className="panel-title">Imagery workspace</p>
              <p className="panel-subtitle">
                Before/after comparison surface for future satellite scenes
              </p>
            </div>
            <StatusBadge tone="watch">Not connected</StatusBadge>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {['Baseline scene', 'Current scene'].map((label) => (
              <div
                key={label}
                className="relative min-h-44 overflow-hidden rounded-xl border border-line bg-black/20"
              >
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                <EmptyState
                  icon={Satellite}
                  title={label}
                  description="Satellite imagery is unavailable in this milestone. The comparison workspace is ready for a future tile or raster integration."
                  className="relative z-10 min-h-44"
                />
              </div>
            ))}
          </div>
          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            No invented imagery or tile requests are made. This is an explicit
            placeholder.
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="flex flex-col">
        <div className="panel-header">
          <div>
            <p className="panel-title">Change detection samples</p>
            <p className="panel-subtitle">
              Demonstration indicators sampled near station locations
            </p>
          </div>
          <span className="chip shrink-0">{changeSamples.length} samples</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="table-head">
                <th className="px-4 py-2 font-semibold">Location</th>
                <th className="px-4 py-2 font-semibold">Indicator</th>
                <th className="px-4 py-2 font-semibold">Change</th>
                <th className="px-4 py-2 font-semibold">Confidence</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {changeSamples.map((sample) => (
                <tr key={sample.id} className="table-row">
                  <td className="px-4 py-2.5 text-xs text-content-secondary">
                    {sample.location}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-content-muted">
                    {sample.indicator}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-2.5 font-mono text-xs',
                      sample.delta < 0 ? 'text-signal-orange' : 'text-signal-green',
                    )}
                  >
                    {formatSigned(sample.delta)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                    {sample.confidence}%
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={sample.tone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
