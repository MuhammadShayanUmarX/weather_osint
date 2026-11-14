import { LocateFixed, Minus, Plus } from 'lucide-react';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-3 right-3 z-20 flex flex-col overflow-hidden rounded-lg border border-line bg-surface/90 shadow-float backdrop-blur-xl sm:bottom-4 sm:right-4">
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-cyan/40"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="h-px bg-line" />
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-cyan/40"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="h-px bg-line" />
      <button
        type="button"
        onClick={onReset}
        className="flex h-8 w-8 items-center justify-center text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-cyan/40"
        aria-label="Reset map view"
        title="Reset map view"
      >
        <LocateFixed className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="border-t border-line px-2 py-1 text-center font-mono text-[10px] text-content-faint">
        {zoom.toFixed(1)}
      </div>
    </div>
  );
}
