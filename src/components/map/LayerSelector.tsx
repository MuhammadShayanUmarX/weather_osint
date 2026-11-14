import { Layers3, X } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';
import { cn } from '@/lib/cn';
import type { MapLayerDefinition } from '@/types';

interface LayerSelectorProps {
  layers: MapLayerDefinition[];
  activeLayerIds: string[];
  onToggle: (layerId: string) => void;
  onClose: () => void;
  className?: string;
}

export function LayerSelector({
  layers,
  activeLayerIds,
  onToggle,
  onClose,
  className,
}: LayerSelectorProps) {
  const categories = Array.from(new Set(layers.map((layer) => layer.category)));

  return (
    <div
      className={cn(
        'w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line-strong bg-surface-overlay/95 shadow-float backdrop-blur-xl',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-line/70 px-3 py-2.5">
        <div className="flex items-center gap-2 text-content-secondary">
          <Layers3 className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
          <span className="text-xs font-semibold text-content">Map layers</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content"
          aria-label="Close layer selector"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[min(26rem,52vh)] overflow-y-auto p-1.5">
        {categories.map((category) => (
          <div key={category} className="mb-2 last:mb-0">
            <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-content-faint">
              {category}
            </p>
            {layers
              .filter((layer) => layer.category === category)
              .map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
                >
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: layer.color }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-content-secondary">
                      {layer.label}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-content-faint">
                      {layer.description}
                    </p>
                  </div>
                  <Toggle
                    checked={activeLayerIds.includes(layer.id)}
                    onChange={() => onToggle(layer.id)}
                    ariaLabel={`Toggle ${layer.label}`}
                  />
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="border-t border-line/70 px-3 py-2 text-[10px] leading-relaxed text-content-faint">
        Overlay points are demonstration data. Layer styling is ready for future
        live feeds.
      </div>
    </div>
  );
}
