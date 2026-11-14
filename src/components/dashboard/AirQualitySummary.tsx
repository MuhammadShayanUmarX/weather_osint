import { AqiGauge } from '@/components/charts/AqiGauge';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { RegionDemo } from '@/data/demo';
import { aqiTone } from '@/lib/environment';
import { cn } from '@/lib/cn';

interface AirQualitySummaryProps {
  data: RegionDemo;
  className?: string;
}

export function AirQualitySummary({ data, className }: AirQualitySummaryProps) {
  const { airQuality } = data;
  const tone = aqiTone(airQuality.aqi);
  const stationsAboveWatch = airQuality.stations.filter(
    (station) => station.aqi > 100,
  ).length;

  return (
    <GlassPanel className={cn('flex flex-col', className)}>
      <div className="panel-header">
        <div>
          <p className="panel-title">Air quality</p>
          <p className="panel-subtitle">Composite station index</p>
        </div>
        <StatusBadge tone={tone}>{airQuality.category}</StatusBadge>
      </div>

      <div className="flex flex-1 flex-col items-center p-4">
        <AqiGauge value={airQuality.aqi} className="h-28 w-28" />

        <div className="mt-3 grid w-full grid-cols-2 gap-2">
          <div className="rounded-lg border border-line/70 bg-black/15 p-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.12em] text-content-faint">
              PM2.5
            </p>
            <p className="mt-0.5 font-mono text-sm font-medium text-content-secondary">
              {airQuality.pm25}
            </p>
            <p className="text-[8px] text-content-faint">µg/m³</p>
          </div>
          <div className="rounded-lg border border-line/70 bg-black/15 p-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.12em] text-content-faint">
              Dominant
            </p>
            <p className="mt-0.5 font-mono text-sm font-medium text-content-secondary">
              {airQuality.dominantPollutant}
            </p>
            <p className="text-[8px] text-content-faint">pollutant</p>
          </div>
        </div>

        <p className="mt-auto pt-2 text-center text-[10px] text-content-faint">
          {stationsAboveWatch} station{stationsAboveWatch === 1 ? '' : 's'} above
          watch threshold
        </p>
      </div>
    </GlassPanel>
  );
}
