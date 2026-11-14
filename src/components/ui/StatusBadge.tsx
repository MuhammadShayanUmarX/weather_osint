import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { toneMeta } from '@/lib/status';
import type { StatusTone } from '@/types';

interface StatusBadgeProps {
  tone: StatusTone;
  children?: ReactNode;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({
  tone,
  children,
  className,
  dot = true,
}: StatusBadgeProps) {
  const meta = toneMeta[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
        meta.bg,
        meta.border,
        meta.text,
        className,
      )}
    >
      {dot ? (
        <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden="true" />
      ) : null}
      {children ?? meta.label}
    </span>
  );
}

export function StatusDot({
  tone,
  className,
}: {
  tone: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block h-1.5 w-1.5 rounded-full',
        toneMeta[tone].dot,
        className,
      )}
      aria-hidden="true"
    />
  );
}
