import { CHART_COLORS } from '@/lib/chartTheme';

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  unit?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="min-w-[9rem] rounded-lg border border-line-strong bg-surface-overlay/95 px-3 py-2 shadow-float backdrop-blur-xl">
      {label !== undefined ? (
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-content-faint">
          {label}
        </p>
      ) : null}
      <div className="mt-1.5 space-y-1">
        {payload.map((item, index) => (
          <div
            key={`${item.dataKey ?? item.name ?? index}`}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-content-muted">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.color ?? CHART_COLORS.cyan }}
              />
              {item.name}
            </span>
            <span className="font-mono font-medium text-content">
              {typeof item.value === 'number'
                ? item.value.toLocaleString('en-US')
                : item.value}
              {unit ? ` ${unit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
