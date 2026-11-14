import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { toneMeta } from '@/lib/status';
import type { StatusTone } from '@/types';
import { GlassPanel } from './GlassPanel';

export interface MetricTrend {
  value: string;
  direction: 'up' | 'down' | 'flat';
  positive?: boolean;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  tone?: StatusTone;
  trend?: MetricTrend;
  hint?: string;
  footer?: ReactNode;
  className?: string;
}

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'info',
  trend,
  hint,
  footer,
  className,
}: MetricCardProps) {
  const meta = toneMeta[tone];
  const TrendIcon = trend ? trendIcons[trend.direction] : null;
  const trendClass =
    trend?.positive === true
      ? 'text-signal-green'
      : trend?.positive === false
        ? 'text-signal-red'
        : 'text-content-muted';

  return (
    <GlassPanel className={cn('p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="stat-label">{label}</p>
          <p className="mt-2 flex items-baseline gap-1.5 font-mono text-2xl font-semibold tracking-tight text-content">
            {value}
            {unit ? (
              <span className="text-xs font-medium text-content-muted">{unit}</span>
            ) : null}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
              meta.bg,
              meta.border,
              meta.text,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      {trend || hint ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {trend && TrendIcon ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                trendClass,
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {trend.value}
            </span>
          ) : null}
          {hint ? (
            <span className="text-xs leading-relaxed text-content-muted">{hint}</span>
          ) : null}
        </div>
      ) : null}

      {footer ? (
        <div className="mt-3 border-t border-line/60 pt-3">{footer}</div>
      ) : null}
    </GlassPanel>
  );
}
