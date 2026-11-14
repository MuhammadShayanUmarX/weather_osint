import {
  Activity,
  Flame,
  Gauge,
  MapPin,
  ShieldAlert,
  TreePine,
} from 'lucide-react';
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
import { formatCoordinate } from '@/lib/format';
import { riskLabel, riskTone } from '@/lib/environment';
import type { StatusTone } from '@/types';

export function Fires() {
  const { region, demo } = useRegionDemo();
  const { fire } = demo;
  const fireLayers = MAP_LAYERS.filter((layer) => layer.id === 'fire').map(
    (layer) => ({ ...layer, defaultEnabled: true }),
  );
  const fireAlerts = demo.alerts.filter((alert) => alert.category === 'Fire');
  const detections = region.locations.slice(0, 5).map((location, index) => {
    const tone: StatusTone =
      index === 0 ? 'critical' : index < 3 ? 'warning' : 'watch';
    return {
      id: `detection-${index}`,
      location: location.name,
      coordinates: location.coordinates,
      confidence: Math.max(52, fire.confidence - index * 4),
      frp: Math.max(1, Math.round(fire.frp * (0.4 + index * 0.08))),
      tone,
    };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Thermal intelligence"
        title="Fire monitoring"
        description={`Thermal anomaly detections, radiative power, and fire risk indicators for ${region.name}. The page is ready for a future NASA FIRMS feed; all current detections are simulated.`}
        meta="No live thermal anomaly API is connected in this milestone."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active detections"
          value={fire.activeDetections}
          icon={Flame}
          tone={fire.activeDetections > 40 ? 'warning' : 'watch'}
          hint="Demonstration thermal clusters"
        />
        <MetricCard
          label="Aggregate FRP"
          value={fire.frp}
          unit="MW"
          icon={Activity}
          tone={fire.frp > 120 ? 'warning' : 'info'}
          hint="Fire radiative power"
        />
        <MetricCard
          label="Fire risk index"
          value={fire.riskIndex}
          unit="/100"
          icon={Gauge}
          tone={riskTone(fire.riskIndex)}
          hint="Composite demonstration risk"
        />
        <MetricCard
          label="Burned area"
          value={fire.burnedAreaHa.toLocaleString('en-US')}
          unit="ha"
          icon={TreePine}
          tone={fire.burnedAreaHa > 1500 ? 'warning' : 'watch'}
          hint="Thermal scar estimate"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <MapContainer
          region={region}
          layers={fireLayers}
          layerFeatures={demo.mapFeatures}
          className="h-[420px] xl:col-span-2"
        />

        <GlassPanel className="flex flex-col xl:h-[420px]">
          <div className="panel-header">
            <div>
              <p className="panel-title">Fire risk posture</p>
              <p className="panel-subtitle">Thermal anomaly and exposure signals</p>
            </div>
            <StatusBadge tone={riskTone(fire.riskIndex)}>
              {riskLabel(fire.riskIndex)}
            </StatusBadge>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <p className="stat-label">Composite risk index</p>
            <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-content">
              {fire.riskIndex}
              <span className="ml-1 text-base font-medium text-content-muted">/100</span>
            </p>
            <ProgressBar
              value={fire.riskIndex}
              max={100}
              tone={riskTone(fire.riskIndex)}
              className="mt-3"
            />

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-content-muted">Detection confidence</span>
                <span className="font-mono text-content-secondary">
                  {fire.confidence}%
                </span>
              </div>
              <ProgressBar value={fire.confidence} tone="nominal" />

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-content-muted">Burned area</span>
                <span className="font-mono text-content-secondary">
                  {fire.burnedAreaHa.toLocaleString('en-US')} ha
                </span>
              </div>
              <ProgressBar
                value={fire.burnedAreaHa}
                max={3000}
                tone={fire.burnedAreaHa > 1500 ? 'warning' : 'watch'}
              />
            </div>

            <div className="mt-auto flex items-start gap-2 border-t border-line/60 pt-3">
              <ShieldAlert
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-amber"
                aria-hidden="true"
              />
              <p className="text-[10px] leading-relaxed text-content-faint">
                Thermal detections are simulated. No official fire danger
                rating is provided by this interface.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartPanel
          title="7-day detection trend"
          subtitle="Daily detections and aggregate fire radiative power"
          className="xl:col-span-2"
          action={
            <ChartLegend
              items={[
                { label: 'Detections', color: CHART_COLORS.red },
                { label: 'FRP', color: CHART_COLORS.amber },
              ]}
            />
          }
          footer="Detections are counts; FRP is measured in megawatts. Both series are illustrative."
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={demo.fire7d}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="day" {...chartAxisProps} />
                <YAxis yAxisId="left" {...chartAxisProps} width={38} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  {...chartAxisProps}
                  width={40}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="detections"
                  name="Detections"
                  fill={CHART_COLORS.red}
                  fillOpacity={0.55}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="frp"
                  name="FRP (MW)"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={2}
                  dot={{ r: 2, fill: CHART_COLORS.amber, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <AlertList
          alerts={fireAlerts}
          title="Fire signals"
          subtitle="Thermal anomaly alerts"
          footer="Fire signals are simulated and are not official emergency notices."
        />
      </div>

      <GlassPanel className="flex flex-col">
        <div className="panel-header">
          <div>
            <p className="panel-title">Active detections</p>
            <p className="panel-subtitle">
              Demonstration thermal clusters near sampled locations
            </p>
          </div>
          <span className="chip shrink-0">{detections.length} clusters</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="table-head">
                <th className="px-4 py-2 font-semibold">Location</th>
                <th className="px-4 py-2 font-semibold">Coordinates</th>
                <th className="px-4 py-2 font-semibold">Confidence</th>
                <th className="px-4 py-2 font-semibold">FRP</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((detection) => (
                <tr key={detection.id} className="table-row">
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2 text-xs text-content-secondary">
                      <MapPin className="h-3 w-3 text-content-faint" aria-hidden="true" />
                      {detection.location}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                    {formatCoordinate(detection.coordinates[1], 'lat')} ·{' '}
                    {formatCoordinate(detection.coordinates[0], 'lng')}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-content-muted">
                    {detection.confidence}%
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-content">
                    {detection.frp} MW
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={detection.tone} />
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
