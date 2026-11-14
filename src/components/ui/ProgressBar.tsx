import { cn } from '@/lib/cn';
import { toneMeta } from '@/lib/status';
import type { StatusTone } from '@/types';

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: StatusTone;
  className?: string;
  trackClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'info',
  className,
  trackClassName,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]',
        trackClassName,
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{
          width: `${percentage}%`,
          backgroundColor: toneMeta[tone].hex,
        }}
      />
    </div>
  );
}
