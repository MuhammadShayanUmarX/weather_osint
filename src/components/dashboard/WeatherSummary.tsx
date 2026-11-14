import { CloudSun, Droplets, Gauge, Wind } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { RegionDemo } from '@/data/demo';
import { CHART_COLORS } from '@/lib/chartTheme';
import { cn } from '@/lib/cn';

interface WeatherSummaryProps {
  data: RegionDemo;
  className?: string;
}

export function WeatherSummary({ data, className }: WeatherSummaryProps) {
  const { current, region, temperature24h } = data;

  const metrics = [
    {
      label: 'Humidity',
      value: `${current.humidityPct}%`,
      icon: Droplets,
    },
    {
      label: 'Wind',
      value: `${current.windKph} km/h ${current.windDirection}`,
      icon: Wind,
    },
    {
      label: 'Pressure',
      value: `${current.pressureHpa} hPa`,
      icon: Gauge,
    },
    {
      label: 'Visibility',
      value: `${current.visibilityKm} km`,
      icon: CloudSun,
    },
  ];

  return (
    <GlassPanel className={cn('flex flex-col', className)}>
      <div className="panel-header">
        <div>
          <p className="panel-title">Weather summary</p>
          <p className="panel-subtitle">{region.name} · station composite</p>
        </div>
        <StatusBadge tone="info">Simulated</StatusBadge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-5xl font-semibold tracking-tight text-content">
              {current.temperatureC}
              <span className="ml-1 text-lg font-medium text-content-muted">°C</span>
            </p>
            <p className="mt-1 text-sm font-medium text-content-secondary">
              {current.condition}
            </p>
            <p className="mt-0.5 text-[10px] text-content-faint">
              Feels like {current.feelsLikeC}°C · {region.name}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-teal/25 bg-accent-teal/10 text-accent-teal">
            <CloudSun className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4 h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={temperature24h}>
              <defs>
                <linearGradient id="weatherSummaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.teal} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="temperature"
                stroke={CHART_COLORS.teal}
                fill="url(#weatherSummaryGradient)"
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-line/70 bg-black/15 p-2.5"
            >
              <div className="flex items-center gap-1.5 text-content-faint">
                <metric.icon className="h-3 w-3" aria-hidden="true" />
                <span className="text-[9px] font-medium uppercase tracking-[0.12em]">
                  {metric.label}
                </span>
              </div>
              <p className="mt-1 truncate font-mono text-xs font-medium text-content-secondary">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-line/60 pt-3 text-[10px] text-content-faint">
          <span>24h temperature trend</span>
          <span>Demonstration feed</span>
        </div>
      </div>
    </GlassPanel>
  );
}
