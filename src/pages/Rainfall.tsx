import {
  CalendarDays,
  CloudRain,
  CloudSun,
  TrendingUp,
  Waves,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartLegend } from '@/components/charts/ChartLegend';
import { ChartPanel } from '@/components/charts/ChartPanel';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
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
import { formatSigned } from '@/lib/format';
import { buttonClasses } from '@/lib/ui';

export function Rainfall() {
  const { region, demo } = useRegionDemo();
  const { rainfall } = demo;
  const thresholdTone =
    rainfall.last24hMm >= rainfall.thresholdMm ? 'warning' : 'nominal';
  const wettestStations = [...demo.airQuality.stations]
    .sort((left, right) => right.rainfall - left.rainfall)
    .slice(0, 5);
  const maxStationRainfall = Math.max(
    ...wettestStations.map((station) => station.rainfall),
    1,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Hydrospheric monitoring"
        title="Rainfall monitoring"
        description={`Accumulation, anomaly, and threshold tracking for ${region.name}. The interface is ready for a future satellite-gauge rainfall feed, but the current observations are simulated.`}
        meta="No live rainfall API is connected in this milestone."
        actions={
          <Link to="/floods" className={buttonClasses('secondary')}>
            <Waves className="h-3.5 w-3.5" aria-hidden="true" />
            Flood intelligence
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Rainfall · 24h"
          value={rainfall.last24hMm}
          unit="mm"
          icon={CloudRain}
          tone={thresholdTone}
          hint={`${rainfall.intensity} intensity`}
        />
        <MetricCard
          label="Rainfall · 7d"
          value={rainfall.last7dMm}
          unit="mm"
          icon={CalendarDays}
          tone="info"
          hint={`${rainfall.wetDays} wet days sampled`}
        />
        <MetricCard
          label="Monthly anomaly"
          value={formatSigned(rainfall.anomalyPct)}
          unit="%"
          icon={TrendingUp}
          tone={rainfall.anomalyPct >= 0 ? 'nominal' : 'watch'}
          trend={{
            value: `${Math.abs(rainfall.anomalyPct)}% vs baseline`,
            direction: rainfall.anomalyPct >= 0 ? 'up' : 'down',
            positive: rainfall.anomalyPct >= 0,
          }}
        />
        <MetricCard
          label="Forecast · 24h"
          value={rainfall.forecast24hMm}
          unit="mm"
          icon={CloudSun}
          tone="info"
          hint="Demonstration forecast"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartPanel
          title="14-day rainfall accumulation"
          subtitle="Observed totals against the seasonal average"
          className="xl:col-span-2"
          action={
            <ChartLegend
              items={[
                { label: 'Observed', color: CHART_COLORS.blue },
                { label: 'Seasonal average', color: CHART_COLORS.amber, dashed: true },
              ]}
            />
          }
          footer="Rainfall values are generated demonstration data for the selected region."
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={demo.rainfall14d}
                margin={{ top: 8, right: 0, left: -18, bottom: 0 }}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="day" {...chartAxisProps} interval={1} />
                <YAxis
                  {...chartAxisProps}
                  width={42}
                  tickFormatter={(value: number) => `${value} mm`}
                />
                <Tooltip
                  content={<ChartTooltip unit="mm" />}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                />
                <Bar
                  dataKey="rainfall"
                  name="Observed"
                  fill={CHART_COLORS.blue}
                  fillOpacity={0.8}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Seasonal average"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Threshold posture</p>
              <p className="panel-subtitle">24-hour accumulation watch</p>
            </div>
            <StatusBadge tone={thresholdTone}>
              {rainfall.last24hMm >= rainfall.thresholdMm ? 'Above watch' : 'Within range'}
            </StatusBadge>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <p className="stat-label">Current 24h total</p>
            <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-content">
              {rainfall.last24hMm}
              <span className="ml-1 text-base font-medium text-content-muted">mm</span>
            </p>
            <p className="mt-1 text-xs text-content-muted">
              {rainfall.intensity} intensity · {rainfall.wetDays} wet days
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px] text-content-muted">
                <span>Watch threshold</span>
                <span className="font-mono">{rainfall.thresholdMm} mm</span>
              </div>
              <ProgressBar
                value={rainfall.last24hMm}
                max={rainfall.thresholdMm}
                tone={thresholdTone}
                className="mt-2"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-line/70 bg-black/15 p-3">
                <p className="text-[9px] uppercase tracking-[0.12em] text-content-faint">
                  Monthly total
                </p>
                <p className="mt-1 font-mono text-sm text-content-secondary">
                  {rainfall.monthlyMm} mm
                </p>
              </div>
              <div className="rounded-lg border border-line/70 bg-black/15 p-3">
                <p className="text-[9px] uppercase tracking-[0.12em] text-content-faint">
                  Next 24h
                </p>
                <p className="mt-1 font-mono text-sm text-content-secondary">
                  {rainfall.forecast24hMm} mm
                </p>
              </div>
            </div>

            <p className="mt-auto border-t border-line/60 pt-3 text-[10px] leading-relaxed text-content-faint">
              Thresholds are demonstration values and do not represent an
              official warning service.
            </p>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Wettest stations</p>
              <p className="panel-subtitle">Ranked by 24h accumulation</p>
            </div>
            <span className="chip shrink-0">Top 5</span>
          </div>
          <ul className="flex-1 divide-y divide-line/50">
            {wettestStations.map((station) => (
              <li key={station.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-content-secondary">
                    {station.name}
                  </span>
                  <span className="font-mono text-content">
                    {station.rainfall} mm
                  </span>
                </div>
                <ProgressBar
                  value={station.rainfall}
                  max={maxStationRainfall}
                  tone={
                    station.rainfall >= rainfall.thresholdMm ? 'warning' : 'info'
                  }
                  className="mt-1.5"
                />
              </li>
            ))}
          </ul>
          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            Station values are simulated.
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col xl:col-span-2">
          <div className="panel-header">
            <div>
              <p className="panel-title">Station rainfall detail</p>
              <p className="panel-subtitle">
                Demonstration surface observations across {region.name}
              </p>
            </div>
            <span className="chip shrink-0">
              {demo.airQuality.stations.length} stations
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-2 font-semibold">Station</th>
                  <th className="px-4 py-2 font-semibold">Rain 24h</th>
                  <th className="px-4 py-2 font-semibold">Temperature</th>
                  <th className="px-4 py-2 font-semibold">AQI</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {demo.airQuality.stations.map((station) => (
                  <tr key={station.id} className="table-row">
                    <td className="px-4 py-2.5 text-xs text-content-secondary">
                      {station.name}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content">
                      {station.rainfall} mm
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                      {station.temperature}°C
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                      {station.aqi}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge tone={station.tone} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
