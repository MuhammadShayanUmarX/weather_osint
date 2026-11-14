export const CHART_COLORS = {
  cyan: '#22d3ee',
  teal: '#2dd4bf',
  blue: '#60a5fa',
  green: '#34d399',
  amber: '#fbbf24',
  orange: '#fb923c',
  red: '#f87171',
  violet: '#a78bfa',
  grid: 'rgba(148, 163, 184, 0.10)',
  axis: '#64748b',
  tooltipBg: 'rgba(10, 16, 27, 0.96)',
  tooltipBorder: 'rgba(148, 163, 184, 0.20)',
} as const;

export const chartAxisProps = {
  tick: { fill: CHART_COLORS.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

export const chartGridProps = {
  stroke: CHART_COLORS.grid,
  strokeDasharray: '3 3',
  vertical: false,
} as const;
