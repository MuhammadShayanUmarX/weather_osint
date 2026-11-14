import {
  Compass,
  Crosshair,
  Download,
  Layers3,
  MapPin,
  Ruler,
  ScanLine,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapContainer,
  type MapFocus,
} from '@/components/map/MapContainer';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MAP_LAYERS } from '@/config/map';
import { useRegionDemo } from '@/hooks/useRegionDemo';
import { cn } from '@/lib/cn';
import { formatCoordinate } from '@/lib/format';
import { buttonClasses, inputClasses } from '@/lib/ui';

const analysisTools = [
  {
    label: 'Buffer analysis',
    description: 'Create an exposure radius around the selected point.',
    icon: Crosshair,
  },
  {
    label: 'Terrain profile',
    description: 'Inspect elevation and slope along a transect.',
    icon: Ruler,
  },
  {
    label: 'Scene inspector',
    description: 'Open a future satellite scene at the selected location.',
    icon: ScanLine,
  },
  {
    label: 'Export selection',
    description: 'Download a future GeoJSON feature collection.',
    icon: Download,
  },
];

function squaredDistance(
  first: [number, number],
  second: [number, number],
): number {
  const deltaLng = first[0] - second[0];
  const deltaLat = first[1] - second[1];
  return deltaLng * deltaLng + deltaLat * deltaLat;
}

export function GeographicAnalysis() {
  const { region, demo } = useRegionDemo();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lngInput, setLngInput] = useState(
    () => (region.center[0] as number).toFixed(2),
  );
  const [latInput, setLatInput] = useState(
    () => (region.center[1] as number).toFixed(2),
  );
  const [formError, setFormError] = useState('');

  const focus = useMemo<MapFocus | null>(() => {
    const lng = Number(searchParams.get('lng'));
    const lat = Number(searchParams.get('lat'));
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return null;
    }
    return {
      coordinates: [lng, lat],
      label: searchParams.get('name') ?? 'Custom coordinate',
    };
  }, [searchParams]);

  const selectedCoordinates = focus?.coordinates ?? region.center;
  const selectedName =
    searchParams.get('name') ?? `${region.name} regional center`;

  useEffect(() => {
    const coordinates = focus?.coordinates ?? region.center;
    setLngInput(coordinates[0].toFixed(2));
    setLatInput(coordinates[1].toFixed(2));
  }, [focus, region.center]);

  const nearbyStations = useMemo(
    () =>
      [...demo.airQuality.stations]
        .sort(
          (first, second) =>
            squaredDistance(first.coordinates, selectedCoordinates) -
            squaredDistance(second.coordinates, selectedCoordinates),
        )
        .slice(0, 4),
    [demo.airQuality.stations, selectedCoordinates],
  );

  const handleFocus = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lng = Number(lngInput);
    const lat = Number(latInput);

    if (
      !Number.isFinite(lng) ||
      !Number.isFinite(lat) ||
      lng < -180 ||
      lng > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      setFormError('Enter a longitude from -180 to 180 and latitude from -90 to 90.');
      return;
    }

    setFormError('');
    setSearchParams({
      lng: lng.toFixed(4),
      lat: lat.toFixed(4),
      name: 'Custom coordinate',
    });
  };

  const clearSelection = () => {
    setSearchParams({});
    setLngInput((region.center[0] as number).toFixed(2));
    setLatInput((region.center[1] as number).toFixed(2));
    setFormError('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Spatial workspace"
        title="Geographic analysis"
        description={`Inspect the map canvas, focus on coordinates, and review nearby demonstration observations for ${region.name}. Analysis tools are staged for a future geospatial backend.`}
        meta="No geocoding, raster analysis, or export service is connected in this milestone."
        actions={
          <>
            <button
              type="button"
              onClick={clearSelection}
              disabled={!focus}
              className={buttonClasses('secondary')}
            >
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              Clear selection
            </button>
            <button
              type="button"
              disabled
              title="Export is not available in this milestone"
              className={buttonClasses('primary')}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export view
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <MapContainer
          region={region}
          layerFeatures={demo.mapFeatures}
          focus={focus}
          className="h-[560px] xl:col-span-2 xl:h-[600px]"
        />

        <GlassPanel className="flex flex-col xl:h-[600px]">
          <div className="panel-header">
            <div>
              <p className="panel-title">Selected location</p>
              <p className="panel-subtitle">Map focus and nearby observations</p>
            </div>
            <StatusBadge tone={focus ? 'info' : 'watch'}>
              {focus ? 'Custom' : 'Region center'}
            </StatusBadge>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-medium text-content">{selectedName}</p>
            <p className="mt-1 font-mono text-xs text-content-muted">
              {formatCoordinate(selectedCoordinates[1], 'lat')} ·{' '}
              {formatCoordinate(selectedCoordinates[0], 'lng')}
            </p>
            <p className="mt-1 text-[10px] text-content-faint">
              {region.name} · {region.shortName}
            </p>

            <div className="mt-5 border-t border-line/60 pt-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-content-faint">
                Nearby demonstration stations
              </p>
              <ul className="mt-2 space-y-1.5">
                {nearbyStations.map((station) => (
                  <li
                    key={station.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-black/15 px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-content-secondary">
                        {station.name}
                      </p>
                      <p className="font-mono text-[9px] text-content-faint">
                        {formatCoordinate(station.coordinates[1], 'lat')} ·{' '}
                        {formatCoordinate(station.coordinates[0], 'lng')}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-content-muted">
                      AQI {station.aqi}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-auto border-t border-line/60 pt-3 text-[10px] leading-relaxed text-content-faint">
              Coordinates and station readings are demonstration values. The map
              does not perform reverse geocoding or boundary lookup.
            </p>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col xl:col-span-2">
          <div className="panel-header">
            <div>
              <p className="panel-title">Coordinate lookup</p>
              <p className="panel-subtitle">
                Focus the map on a longitude and latitude
              </p>
            </div>
            <span className="chip shrink-0">Frontend only</span>
          </div>
          <div className="grid flex-1 gap-5 p-5 lg:grid-cols-2">
            <form onSubmit={handleFocus} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-content-faint">
                    Longitude
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    value={lngInput}
                    onChange={(event) => setLngInput(event.target.value)}
                    className={inputClasses('font-mono')}
                    aria-label="Longitude"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-content-faint">
                    Latitude
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    value={latInput}
                    onChange={(event) => setLatInput(event.target.value)}
                    className={inputClasses('font-mono')}
                    aria-label="Latitude"
                  />
                </label>
              </div>
              {formError ? (
                <p className="text-[11px] text-signal-orange">{formError}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" className={buttonClasses('primary')}>
                  <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
                  Focus map
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLngInput((region.center[0] as number).toFixed(2));
                    setLatInput((region.center[1] as number).toFixed(2));
                  }}
                  className={buttonClasses('ghost')}
                >
                  Use region center
                </button>
              </div>
              <p className="text-[10px] leading-relaxed text-content-faint">
                The coordinate is written to the URL so the focused view can be
                shared within this browser session.
              </p>
            </form>

            <div className="space-y-2">
              {analysisTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.label}
                    className="flex items-start gap-3 rounded-xl border border-line/60 bg-black/15 p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-content-muted">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-content-secondary">
                          {tool.label}
                        </p>
                        <StatusBadge tone="watch" dot={false}>
                          Planned
                        </StatusBadge>
                      </div>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-content-faint">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col">
          <div className="panel-header">
            <div>
              <p className="panel-title">Layer catalog</p>
              <p className="panel-subtitle">Available demonstration layers</p>
            </div>
            <Layers3 className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
          </div>
          <ul className="flex-1 divide-y divide-line/50">
            {MAP_LAYERS.map((layer) => (
              <li key={layer.id} className="flex items-start gap-3 px-4 py-2.5">
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
                <span
                  className={cn(
                    'shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em]',
                    layer.defaultEnabled
                      ? 'border-signal-green/25 bg-signal-green/10 text-signal-green'
                      : 'border-line bg-white/[0.03] text-content-faint',
                  )}
                >
                  {layer.defaultEnabled ? 'On' : 'Off'}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            Layer toggles are available directly on the map.
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
