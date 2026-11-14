import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusDot } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import type { ObservationItem } from '@/types';

interface RecentObservationsProps {
  observations: ObservationItem[];
  limit?: number;
  className?: string;
}

export function RecentObservations({
  observations,
  limit = 7,
  className,
}: RecentObservationsProps) {
  const visibleObservations = observations.slice(0, limit);

  return (
    <GlassPanel className={cn('flex flex-col', className)}>
      <div className="panel-header">
        <div>
          <p className="panel-title">Recent observations</p>
          <p className="panel-subtitle">
            Latest demonstration readings across the selected region
          </p>
        </div>
        <span className="chip shrink-0">Simulated</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="table-head">
              <th className="px-4 py-2 font-semibold">Parameter</th>
              <th className="px-4 py-2 font-semibold">Location</th>
              <th className="px-4 py-2 font-semibold">Reading</th>
              <th className="px-4 py-2 font-semibold">Observed</th>
              <th className="px-4 py-2 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {visibleObservations.map((observation) => (
              <tr key={observation.id} className="table-row">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <StatusDot tone={observation.tone} />
                    <span className="text-xs text-content-secondary">
                      {observation.parameter}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-content-muted">
                  {observation.location}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-content">
                  {observation.value}
                </td>
                <td className="px-4 py-2.5 text-[10px] text-content-faint">
                  {observation.observedAt}
                </td>
                <td className="px-4 py-2.5 text-[10px] text-content-faint">
                  {observation.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
        Observation timestamps are illustrative and do not represent live
        telemetry.
      </div>
    </GlassPanel>
  );
}
