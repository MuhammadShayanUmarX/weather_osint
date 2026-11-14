import { FlaskConical } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  meta?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{eyebrow}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-signal-amber/20 bg-signal-amber/[0.06] px-2 py-0.5 text-[10px] font-medium text-signal-amber">
            <FlaskConical className="h-3 w-3" aria-hidden="true" />
            Simulated data
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-content sm:text-[28px]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-content-muted">
          {description}
        </p>
        {meta ? (
          <p className="mt-2 text-xs text-content-faint">{meta}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
