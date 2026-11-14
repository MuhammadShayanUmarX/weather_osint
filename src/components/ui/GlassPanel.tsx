import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type PanelPadding = 'none' | 'sm' | 'md' | 'lg';
type PanelTone = 'default' | 'raised' | 'inset';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: PanelPadding;
  tone?: PanelTone;
}

const paddings: Record<PanelPadding, string> = {
  none: '',
  sm: 'p-3.5',
  md: 'p-5',
  lg: 'p-6',
};

const tones: Record<PanelTone, string> = {
  default: 'bg-surface/65',
  raised: 'bg-surface-raised/70',
  inset: 'bg-black/20',
};

export function GlassPanel({
  children,
  padding = 'none',
  tone = 'default',
  className,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line shadow-panel backdrop-blur-xl',
        tones[tone],
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
