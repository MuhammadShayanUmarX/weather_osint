import { aqiCategory, aqiTone } from '@/lib/environment';
import { cn } from '@/lib/cn';
import { toneMeta } from '@/lib/status';

interface AqiGaugeProps {
  value: number;
  max?: number;
  className?: string;
}

export function AqiGauge({ value, max = 300, className }: AqiGaugeProps) {
  const tone = aqiTone(value);
  const meta = toneMeta[tone];
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / max, 0), 1);

  return (
    <div className={cn('relative flex h-36 w-36 items-center justify-center', className)}>
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Air quality index ${value}, ${aqiCategory(value)}`}
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={meta.hex}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-semibold tracking-tight text-content">
          {value}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-content-faint">
          AQI
        </span>
        <span className={cn('mt-1 max-w-[6rem] text-center text-[9px] font-medium leading-tight', meta.text)}>
          {aqiCategory(value)}
        </span>
      </div>
    </div>
  );
}
