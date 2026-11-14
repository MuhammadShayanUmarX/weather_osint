import { Activity, MapPin, ShieldAlert, Wind } from 'lucide-react';
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
import { AqiGauge } from '@/components/charts/AqiGauge';
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
import { aqiTone } from '@/lib/environment';
import { cn } from '@/lib/cn';

export function AirQuality() {
  const { region, demo } = useRegionDemo();
  const { airQuality } = demo;
  const tone = aqiTone(airQuality.aqi);
  const stationsAboveWatch = airQuality.stations.filter(
    (station) => station.aqi > 100,
  ).length;
  const airAlerts = demo.alerts.filter(
    (alert) => alert.category === 'Air quality',
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Atmospheric monitoring"
        title="Air quality"
        description={`Composite index, pollutant loading, and station coverage for ${region.name}. The interface is ready for a future OpenAQ-style feed, but the current readings are simulated.`}
        meta="No live air quality API is connected in this milestone."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Composite AQI"
          value={airQuality.aqi}
          icon={Wind}
          tone={tone}
          hint={airQuality.category}
        />
        <MetricCard
          label="PM2.5"
          value={airQuality.pm25}
          unit="µg/m³"
          icon={Activity}
          tone={airQuality.pm25 > 25 ? 'warning' : 'nominal'}
          hint="Fine particulate matter"
        />
        <MetricCard
          label="PM10"
          value={airQuality.pm10}
          unit="µg/m³"
          icon={Activity}
          tone={airQuality.pm10 > 50 ? 'warning' : 'nominal'}
          hint="Coarse particulate matter"
        />
        <MetricCard
          label="Stations above watch"
          value={stationsAboveWatch}
          unit={`of ${airQuality.stations.length}`}
          icon={MapPin}
          tone={stationsAboveWatch > 0 ? 'watch' : 'nominal'}
          hint="AQI greater than 100"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Composite index</p>
              <p className="panel-subtitle">Station composite · demonstration</p>
            </div>
            <StatusBadge tone={tone}>{airQuality.category}</StatusBadge>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center p-5">
            <AqiGauge value={airQuality.aqi} className="h-44 w-44" />
            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              <div className="rounded-lg border border-line/70 bg-black/15 p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-[0.12em] text-content-faint">
                  Dominant
                </p>
                <p className="mt-1 font-mono text-sm text-content-secondary">
                  {airQuality.dominantPollutant}
                </p>
              </div>
              <div className="rounded-lg border border-line/70 bg-black/15 p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-[0.12em] text-content-faint">
                  PM2.5
                </p>
                <p className="mt-1 font-mono text-sm text-content-secondary">
                  {airQuality.pm25} µg/m³
                </p>
              </div>
            </div>
            <p className="mt-4 text-center text-[10px] leading-relaxed text-content-faint">
              Composite AQI is derived from simulated station values and is not
              an official health index.
            </p>
          </div>
        </GlassPanel>

        <ChartPanel
          title="24-hour AQI profile"
          subtitle="Hourly composite index with health reference lines"
          className="xl:col-span-2"
          footer="Reference lines at AQI 100 and 150 are illustrative thresholds."
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={demo.aqi24h}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="time" {...chartAxisProps} interval={3} />
                <YAxis {...chartAxisProps} width={38} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.18)' }}
                />
                <ReferenceLine
                  y={100}
                  stroke={CHART_COLORS.amber}
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                />
                <ReferenceLine
                  y={150}
                  stroke={CHART_COLORS.orange}
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  name="AQI"
                  stroke={CHART_COLORS.cyan}
                  fill="url(#aqiGradient)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col xl:col-span-2">
          <div className="panel-header">
            <div>
              <p className="panel-title">Pollutant loading</p>
              <p className="panel-subtitle">
                Demonstration concentrations against reference limits
              </p>
            </div>
            <span className="chip shrink-0">6 pollutants</span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            {demo.pollutants.map((pollutant) => {
              const ratio = pollutant.value / pollutant.limit;
              const pollutantTone =
                ratio > 1 ? 'critical' : ratio > 0.75 ? 'warning' : 'nominal';
              return (
                <div key={pollutant.name}>
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-medium text-content-secondary">
                      {pollutant.name}
                    </span>
                    <span className="font-mono text-content-muted">
                      {pollutant.value} / {pollutant.limit} {pollutant.unit}
                    </span>
                  </div>
                  <ProgressBar
                    value={pollutant.value}
                    max={pollutant.limit}
                    tone={pollutantTone}
                    className="mt-1.5"
                  />
                </div>
              );
            })}
          </div>
          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            Reference limits are illustrative and not regulatory thresholds.
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Health advisory</p>
              <p className="panel-subtitle">Demonstration guidance only</p>
            </div>
            <StatusBadge tone={tone}>{airQuality.category}</StatusBadge>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-signal-amber/25 bg-signal-amber/10 text-signal-amber">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium text-content">
              {airQuality.aqi > 150
                ? 'Sensitive groups should avoid prolonged outdoor exertion.'
                : airQuality.aqi > 100
                  ? 'Sensitive groups should reduce prolonged outdoor exertion.'
                  : 'Air quality is within a moderate demonstration range.'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-content-muted">
              This advisory is generated from simulated values. It must not be
              used for public health decisions or operational messaging.
            </p>
            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-line/60 pt-3 text-[10px] text-content-faint">
              <span>
                NO₂{' '}
                <b className="font-mono font-medium text-content-secondary">
                  {airQuality.no2}
                </b>
              </span>
              <span className="text-right">
                O₃{' '}
                <b className="font-mono font-medium text-content-secondary">
                  {airQuality.o3}
                </b>
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col xl:col-span-2">
          <div className="panel-header">
            <div>
              <p className="panel-title">Station readings</p>
              <p className="panel-subtitle">
                Demonstration air quality stations across {region.name}
              </p>
            </div>
            <span className="chip shrink-0">
              {airQuality.stations.length} stations
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-2 font-semibold">Station</th>
                  <th className="px-4 py-2 font-semibold">AQI</th>
                  <th className="px-4 py-2 font-semibold">PM2.5</th>
                  <th className="px-4 py-2 font-semibold">Temperature</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {airQuality.stations.map((station) => (
                  <tr key={station.id} className="table-row">
                    <td className="px-4 py-2.5 text-xs text-content-secondary">
                      {station.name}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content">
                      {station.aqi}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                      {station.pm25} µg/m³
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                      {station.temperature}°C
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

        <AlertList
          alerts={airAlerts}
          title="Air quality signals"
          subtitle="Demonstration station alerts"
          className={cn('xl:col-span-1')}
          footer="Air signals are simulated and not official advisories."
        />
      </div>
    </div>
  );
}
