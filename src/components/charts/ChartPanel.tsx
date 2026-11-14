import type { ReactNode } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/cn';

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartPanel({
  title,
  subtitle,
  action,
  footer,
  children,
  className,
}: ChartPanelProps) {
  return (
    <GlassPanel className={cn('flex flex-col', className)}>
      <div className="panel-header">
        <div className="min-w-0">
          <p className="panel-title">{title}</p>
          {subtitle ? <p className="panel-subtitle">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="min-w-0 flex-1 p-4">{children}</div>
      {footer ? (
        <div className="border-t border-line/60 px-5 py-2.5 text-[10px] leading-relaxed text-content-faint">
          {footer}
        </div>
      ) : null}
    </GlassPanel>
  );
}
