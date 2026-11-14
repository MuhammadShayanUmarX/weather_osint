import {
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertList } from '@/components/alerts/AlertList';
import { ChartLegend } from '@/components/charts/ChartLegend';
import { ChartPanel } from '@/components/charts/ChartPanel';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRegionDemo } from '@/hooks/useRegionDemo';
import {
  CHART_COLORS,
  chartAxisProps,
  chartGridProps,
} from '@/lib/chartTheme';
import { cn } from '@/lib/cn';

export function Weather() {
  const { region, demo } = useRegionDemo();
  const { current } = demo;
  const weatherAlerts = demo.alerts.filter((alert) =>
    ['Rainfall', 'Flood', 'Air quality'].includes(alert.category),
  );

  const conditionMetrics = [
    {
      label: 'Feels like',
      value: `${current.feelsLikeC}°C`,
      icon: Thermometer,
    },
    { label: 'Humidity', value: `${current.humidityPct}%`, icon: Droplets },
    {
      label: 'Wind',
      value: `${current.windKph} km/h ${current.windDirection}`,
      icon: Wind,
    },
    { label: 'Pressure', value: `${current.pressureHpa} hPa`, icon: Gauge },
    { label: 'Visibility', value: `${current.visibilityKm} km`, icon: Eye },
    { label: 'UV index', value: `${current.uvIndex}`, icon: Sun },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Atmospheric monitoring"
        title="Weather intelligence"
        description={`Surface conditions, short-range trends, and station coverage for ${region.name}. The layout is production-ready for a future weather feed; the current values are simulated.`}
        meta="No live weather API is connected in this milestone."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Temperature"
          value={current.temperatureC}
          unit="°C"
          icon={CloudSun}
          tone="info"
          hint={`Feels like ${current.feelsLikeC}°C`}
        />
        <MetricCard
          label="Humidity"
          value={current.humidityPct}
          unit="%"
          icon={Droplets}
          tone="nominal"
          hint={`Dew point ${current.dewPointC}°C`}
        />
        <MetricCard
          label="Wind"
          value={current.windKph}
          unit="km/h"
          icon={Wind}
          tone="watch"
          hint={`From ${current.windDirection}`}
        />
        <MetricCard
          label="Pressure"
          value={current.pressureHpa}
          unit="hPa"
          icon={Gauge}
          tone="info"
          hint="Station composite"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartPanel
          title="24-hour temperature profile"
          subtitle="Temperature and precipitation probability"
          className="xl:col-span-2"
          action={
            <ChartLegend
              items={[
                { label: 'Temperature', color: CHART_COLORS.teal },
                { label: 'Rain chance', color: CHART_COLORS.blue },
              ]}
            />
          }
          footer="Illustrative hourly profile. Data is deterministic demonstration data for the selected region."
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={demo.temperature24h}
                margin={{ top: 8, right: 0, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="weatherTempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.teal} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="time" {...chartAxisProps} interval={3} />
                <YAxis
                  yAxisId="temp"
                  {...chartAxisProps}
                  width={38}
                  tickFormatter={(value: number) => `${value}°`}
                />
                <YAxis
                  yAxisId="rain"
                  orientation="right"
                  {...chartAxisProps}
                  width={34}
                  domain={[0, 100]}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.18)' }}
                />
                <Area
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke={CHART_COLORS.teal}
                  fill="url(#weatherTempGradient)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Bar
                  yAxisId="rain"
                  dataKey="precipitationChance"
                  name="Rain chance"
                  fill={CHART_COLORS.blue}
                  fillOpacity={0.32}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Current conditions</p>
              <p className="panel-subtitle">{region.name} · demonstration composite</p>
            </div>
            <StatusBadge tone="info">Demo</StatusBadge>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-4xl font-semibold tracking-tight text-content">
                  {current.temperatureC}
                  <span className="ml-1 text-base font-medium text-content-muted">°C</span>
                </p>
                <p className="mt-1 text-sm font-medium text-content-secondary">
                  {current.condition}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-teal/25 bg-accent-teal/10 text-accent-teal">
                <CloudSun className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {conditionMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-line/70 bg-black/15 p-3"
                >
                  <div className="flex items-center gap-1.5 text-content-faint">
                    <metric.icon className="h-3 w-3" aria-hidden="true" />
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em]">
                      {metric.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs font-medium text-content-secondary">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-line/60 pt-3 text-[10px] text-content-faint">
              <span>Condition classification</span>
              <span className="text-content-secondary">{current.condition}</span>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartPanel
          title="7-day temperature range"
          subtitle="Daily high and low outlook"
          className="xl:col-span-2"
          action={
            <ChartLegend
              items={[
                { label: 'High', color: CHART_COLORS.orange },
                { label: 'Low', color: CHART_COLORS.blue },
              ]}
            />
          }
          footer="Forecast values are illustrative and are not derived from a live model."
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={demo.forecast7d}
                margin={{ top: 8, right: 0, left: -18, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="day" {...chartAxisProps} />
                <YAxis
                  {...chartAxisProps}
                  width={38}
                  tickFormatter={(value: number) => `${value}°`}
                />
                <Tooltip
                  content={<ChartTooltip unit="°C" />}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                />
                <Bar
                  dataKey="high"
                  name="High"
                  fill={CHART_COLORS.orange}
                  radius={[2, 2, 0, 0]}
                  barSize={12}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="low"
                  name="Low"
                  fill={CHART_COLORS.blue}
                  radius={[2, 2, 0, 0]}
                  barSize={12}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Forecast detail</p>
              <p className="panel-subtitle">Seven-day demonstration outlook</p>
            </div>
            <span className="chip shrink-0">Simulated</span>
          </div>
          <ul className="flex-1 divide-y divide-line/50">
            {demo.forecast7d.map((day) => (
              <li
                key={day.day}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
              >
                <span className="w-12 shrink-0 font-mono text-[10px] text-content-muted">
                  {day.day}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-content-secondary">
                  {day.condition}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-content-muted">
                  {day.rainChance}%
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-xs text-content">
                  {day.high}° <span className="text-content-faint">{day.low}°</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            Rain probability is illustrative.
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col xl:col-span-2">
          <div className="panel-header">
            <div>
              <p className="panel-title">Station network</p>
              <p className="panel-subtitle">
                Demonstration surface stations across {region.name}
              </p>
            </div>
            <span className="chip shrink-0">{demo.airQuality.stations.length} stations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-2 font-semibold">Station</th>
                  <th className="px-4 py-2 font-semibold">Temperature</th>
                  <th className="px-4 py-2 font-semibold">Rain 24h</th>
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
                      {station.temperature}°C
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                      {station.rainfall} mm
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

        <AlertList
          alerts={weatherAlerts}
          title="Weather-related alerts"
          subtitle="Rainfall, flood, and air signals"
          className={cn('xl:col-span-1')}
          footer="Filtered from the demonstration alert queue."
        />
      </div>
    </div>
  );
}
