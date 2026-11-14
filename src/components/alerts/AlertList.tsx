import { BellRing } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusDot } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { toneMeta } from '@/lib/status';
import type { AlertItem } from '@/types';

interface AlertListProps {
  alerts: AlertItem[];
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
  footer?: ReactNode;
}

export function AlertList({
  alerts,
  title = 'Environmental alerts',
  subtitle = 'Demonstration alert queue',
  limit,
  className,
  footer,
}: AlertListProps) {
  const visibleAlerts = typeof limit === 'number' ? alerts.slice(0, limit) : alerts;

  return (
    <GlassPanel className={cn('flex flex-col', className)}>
      <div className="panel-header">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BellRing className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
            <p className="panel-title">{title}</p>
          </div>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
        <span className="chip shrink-0">
          {visibleAlerts.length} signal{visibleAlerts.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="min-h-0 flex-1">
        {visibleAlerts.length > 0 ? (
          <ul className="divide-y divide-line/50">
            {visibleAlerts.map((alert) => {
              const meta = toneMeta[alert.severity];
              return (
                <li
                  key={alert.id}
                  className="px-4 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-start gap-3">
                    <StatusDot tone={alert.severity} className="mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-medium leading-snug text-content-secondary">
                          {alert.title}
                        </p>
                        <span
                          className={cn(
                            'rounded border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em]',
                            meta.bg,
                            meta.border,
                            meta.text,
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-content-muted">
                        {alert.description}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-content-faint">
                        <span>{alert.category}</span>
                        <span>·</span>
                        <span>{alert.source}</span>
                        <span>·</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={BellRing}
            title="No demonstration alerts"
            description="No simulated environmental signals match the current region."
          />
        )}
      </div>

      {footer ? (
        <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
          {footer}
        </div>
      ) : null}
    </GlassPanel>
  );
}
