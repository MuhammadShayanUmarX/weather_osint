import { GlassPanel } from '@/components/ui/GlassPanel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { RegionDemo } from '@/data/demo';
import { riskTone } from '@/lib/environment';
import { cn } from '@/lib/cn';
import { toneMeta } from '@/lib/status';

interface FloodSummaryProps {
  data: RegionDemo;
  className?: string;
}

export function FloodSummary({ data, className }: FloodSummaryProps) {
  const { flood } = data;
  const tone = riskTone(flood.riskScore);

  return (
    <GlassPanel className={cn('flex flex-col', className)}>
      <div className="panel-header">
        <div>
          <p className="panel-title">Flood monitoring</p>
          <p className="panel-subtitle">River gauge network</p>
        </div>
        <StatusBadge tone={tone}>{flood.riskLabel}</StatusBadge>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="stat-label">Composite risk</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-content">
              {flood.riskScore}
              <span className="ml-1 text-xs font-medium text-content-muted">/100</span>
            </p>
          </div>
          <p className="text-right text-[10px] leading-relaxed text-content-faint">
            {flood.gaugesAboveWarning} of {flood.rivers.length} gauges
            <br />
            above warning
          </p>
        </div>

        <div className="mt-3 space-y-2.5">
          {flood.rivers.slice(0, 3).map((river) => (
            <div key={river.id}>
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <span className="truncate text-content-muted">{river.name}</span>
                <span className={cn('font-mono font-medium', toneMeta[river.status].text)}>
                  {river.level}%
                </span>
              </div>
              <ProgressBar
                value={river.level}
                max={100}
                tone={river.status}
                className="mt-1"
              />
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-line/60 pt-3 text-[10px] text-content-faint">
          <span>Peak discharge</span>
          <span className="font-mono font-medium text-content-secondary">
            {flood.peakDischarge.toLocaleString('en-US')} m³/s
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}
