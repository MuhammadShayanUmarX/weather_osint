import { cn } from '@/lib/cn';

interface ChartLegendItem {
  label: string;
  color: string;
  dashed?: boolean;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 text-[10px] text-content-muted"
        >
          <span
            className={cn(
              'h-0.5 w-3 rounded-full',
              item.dashed ? 'opacity-70' : '',
            )}
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
