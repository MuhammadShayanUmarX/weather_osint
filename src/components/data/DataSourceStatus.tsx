import { Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusDot } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { dataSourceMeta, toneMeta } from '@/lib/status';
import type { DataSource } from '@/types';

interface DataSourceStatusProps {
  sources: DataSource[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
  limit?: number;
  className?: string;
}

export function DataSourceStatus({
  sources,
  title = 'Data source status',
  subtitle = 'Planned and demonstration feeds',
  compact = false,
  limit,
  className,
}: DataSourceStatusProps) {
  const visibleSources =
    typeof limit === 'number' ? sources.slice(0, limit) : sources;
  const simulatedCount = sources.filter(
    (source) => source.status === 'simulated',
  ).length;
  const unconfiguredCount = sources.filter(
    (source) => source.status === 'not-configured',
  ).length;

  return (
    <GlassPanel className={cn('flex flex-col', className)}>
      <div className="panel-header">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
            <p className="panel-title">{title}</p>
          </div>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
        <span className="chip shrink-0">{simulatedCount} demo</span>
      </div>

      <div className="flex-1 divide-y divide-line/50">
        {visibleSources.map((source) => {
          const meta = dataSourceMeta[source.status];
          return (
            <div
              key={source.id}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
            >
              <StatusDot tone={meta.tone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-content-secondary">
                  {source.name}
                </p>
                {!compact ? (
                  <p className="truncate text-[10px] text-content-faint">
                    {source.provider} · {source.coverage}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <p className={cn('text-[10px] font-medium', toneMeta[meta.tone].text)}>
                  {meta.label}
                </p>
                {!compact ? (
                  <p className="text-[9px] text-content-faint">{source.lastSync}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
        <span>
          {unconfiguredCount > 0
            ? `${unconfiguredCount} source not configured`
            : 'No live integrations connected'}
        </span>
        <Link
          to="/settings"
          className="shrink-0 text-accent-cyan transition-colors hover:text-content"
        >
          View settings
        </Link>
      </div>
    </GlassPanel>
  );
}
