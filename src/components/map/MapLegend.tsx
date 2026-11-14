import { Info } from 'lucide-react';
import { MAP_ATTRIBUTION, MAP_TILES_CONFIGURED } from '@/config/map';
import { cn } from '@/lib/cn';
import type { MapLayerDefinition } from '@/types';

interface MapLegendProps {
  layers: MapLayerDefinition[];
  activeLayerIds: string[];
  className?: string;
}

export function MapLegend({
  layers,
  activeLayerIds,
  className,
}: MapLegendProps) {
  const activeLayers = layers.filter((layer) =>
    activeLayerIds.includes(layer.id),
  );

  return (
    <div
      className={cn(
        'absolute bottom-3 left-3 z-10 hidden w-52 rounded-lg border border-line bg-surface/85 p-2.5 shadow-panel backdrop-blur-xl md:block',
        className,
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-content-muted">
        Active layers
      </p>
      <ul className="mt-1.5 space-y-1">
        {activeLayers.length > 0 ? (
          activeLayers.map((layer) => (
            <li
              key={layer.id}
              className="flex items-center gap-2 text-[10px] text-content-secondary"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: layer.color }}
                aria-hidden="true"
              />
              <span className="truncate">{layer.label}</span>
            </li>
          ))
        ) : (
          <li className="text-[10px] text-content-faint">No overlays enabled</li>
        )}
      </ul>
      <div className="mt-2 flex items-start gap-1.5 border-t border-line/60 pt-2 text-[9px] leading-relaxed text-content-faint">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        <span>
          {MAP_TILES_CONFIGURED
            ? MAP_ATTRIBUTION
            : 'Local graticule preview. Base tiles are not configured.'}
        </span>
      </div>
    </div>
  );
}
