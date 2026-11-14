import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { GlassPanel } from './GlassPanel';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = 'Loading interface data',
  className,
}: LoadingStateProps) {
  return (
    <GlassPanel
      className={cn(
        'flex min-h-40 flex-col items-center justify-center gap-3 p-6',
        className,
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin text-accent-cyan" aria-hidden="true" />
      <p className="text-xs text-content-muted">{label}</p>
    </GlassPanel>
  );
}
