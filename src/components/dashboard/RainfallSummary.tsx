import { Bar, BarChart, ResponsiveContainer } from 'recharts';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { RegionDemo } from '@/data/demo';
import { CHART_COLORS } from '@/lib/chartTheme';
import { cn } from '@/lib/cn';
import { formatSigned } from '@/lib/format';

interface RainfallSummaryProps {
  data: RegionDemo;
  className?: string;
}

export function RainfallSummary({ data, className }: RainfallSummaryProps) {
  const { rainfall, rainfall14d } = data;
  const tone = rainfall.last24hMm >= rainfall.thresholdMm ? 'warning' : 'nominal';
  const recentRainfall = rainfall14d.slice(-7);

  return (
    <GlassPanel className={cn('flex flex-col', className)}>
      <div className="panel-header">
        <div>
          <p className="panel-title">Rainfall</p>
          <p className="panel-subtitle">Accumulation and threshold watch</p>
        </div>
        <StatusBadge tone={tone}>
          {rainfall.last24hMm >= rainfall.thresholdMm ? 'Above watch' : 'Within range'}
        </StatusBadge>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="stat-label">24h accumulation</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-content">
              {rainfall.last24hMm}
              <span className="ml-1 text-xs font-medium text-content-muted">mm</span>
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'font-mono text-xs font-medium',
                rainfall.anomalyPct >= 0 ? 'text-signal-green' : 'text-signal-red',
              )}
            >
              {formatSigned(rainfall.anomalyPct)}%
            </p>
            <p className="text-[9px] text-content-faint">vs seasonal baseline</p>
          </div>
        </div>

        <div className="mt-2 h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recentRainfall}>
              <Bar
                dataKey="rainfall"
                fill={CHART_COLORS.blue}
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between text-[10px] text-content-muted">
            <span>Watch threshold</span>
            <span className="font-mono text-content-secondary">
              {rainfall.last24hMm} / {rainfall.thresholdMm} mm
            </span>
          </div>
          <ProgressBar
            value={rainfall.last24hMm}
            max={rainfall.thresholdMm}
            tone={tone}
            className="mt-1.5"
          />
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-content-faint">
            <span>
              7d total{' '}
              <b className="font-mono font-medium text-content-secondary">
                {rainfall.last7dMm} mm
              </b>
            </span>
            <span className="text-right">
              Next 24h{' '}
              <b className="font-mono font-medium text-content-secondary">
                {rainfall.forecast24hMm} mm
              </b>
            </span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
