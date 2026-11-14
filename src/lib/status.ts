import type { DataSourceState, StatusTone } from '@/types';

interface ToneMeta {
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
  hex: string;
}

export const toneMeta: Record<StatusTone, ToneMeta> = {
  nominal: {
    label: 'Nominal',
    text: 'text-signal-green',
    bg: 'bg-signal-green/10',
    border: 'border-signal-green/25',
    dot: 'bg-signal-green',
    hex: '#34d399',
  },
  watch: {
    label: 'Watch',
    text: 'text-signal-amber',
    bg: 'bg-signal-amber/10',
    border: 'border-signal-amber/25',
    dot: 'bg-signal-amber',
    hex: '#fbbf24',
  },
  warning: {
    label: 'Warning',
    text: 'text-signal-orange',
    bg: 'bg-signal-orange/10',
    border: 'border-signal-orange/25',
    dot: 'bg-signal-orange',
    hex: '#fb923c',
  },
  critical: {
    label: 'Critical',
    text: 'text-signal-red',
    bg: 'bg-signal-red/10',
    border: 'border-signal-red/25',
    dot: 'bg-signal-red',
    hex: '#f87171',
  },
  info: {
    label: 'Info',
    text: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10',
    border: 'border-accent-cyan/25',
    dot: 'bg-accent-cyan',
    hex: '#22d3ee',
  },
};

export const dataSourceMeta: Record<
  DataSourceState,
  { label: string; tone: StatusTone }
> = {
  operational: { label: 'Operational', tone: 'nominal' },
  degraded: { label: 'Degraded', tone: 'watch' },
  offline: { label: 'Offline', tone: 'critical' },
  simulated: { label: 'Simulated', tone: 'info' },
  'not-configured': { label: 'Not configured', tone: 'watch' },
};
