import maplibregl, {
  type GeoJSONSource,
  type LayerSpecification,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Check,
  ChevronDown,
  Info,
  Layers3,
  MapPin,
  Palette,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  MAP_ATTRIBUTION,
  MAP_LAYERS,
  MAP_STYLES,
  MAP_TILE_URL,
  MAP_TILES_CONFIGURED,
} from '@/config/map';
import { cn } from '@/lib/cn';
import { formatCoordinate } from '@/lib/format';
import { buttonClasses } from '@/lib/ui';
import type {
  DemoLocation,
  MapLayerDefinition,
  MapMarker,
  Region,
} from '@/types';
import { LayerSelector } from './LayerSelector';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';

export interface MapFocus {
  coordinates: [number, number];
  label?: string;
}

interface MapContainerProps {
  region: Region;
  layers?: MapLayerDefinition[];
  layerFeatures?: Partial<Record<string, MapMarker[]>>;
  focus?: MapFocus | null;
  className?: string;
  showSearch?: boolean;
  showLegend?: boolean;
}

function makeGraticule(): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const features: Array<GeoJSON.Feature<GeoJSON.LineString>> = [];

  for (let longitude = -180; longitude <= 180; longitude += 10) {
    features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [longitude, -85],
          [longitude, 85],
        ],
      },
    });
  }

  for (let latitude = -80; latitude <= 80; latitude += 10) {
    features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-180, latitude],
          [180, latitude],
        ],
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

function makeRegionPolygon(
  region: Region,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [west, south, east, north] = region.bounds;
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
  };
}

function toPointCollection(
  markers: MapMarker[],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: markers.map((marker) => ({
      type: 'Feature',
      properties: {
        id: marker.id,
        label: marker.label,
        detail: marker.detail ?? 'Demonstration observation',
        value: marker.value ?? '',
        tone: marker.tone,
      },
      geometry: {
        type: 'Point',
        coordinates: marker.coordinates,
      },
    })),
  };
}

function regionBounds(region: Region): [number, number, number, number] {
  return [region.bounds[0], region.bounds[1], region.bounds[2], region.bounds[3]];
}

function createMapStyle(
  layers: MapLayerDefinition[],
  features: Partial<Record<string, MapMarker[]>>,
  region: Region,
): StyleSpecification {
  const sources: StyleSpecification['sources'] = {
    graticule: { type: 'geojson', data: makeGraticule() },
    region: { type: 'geojson', data: makeRegionPolygon(region) },
  };

  const styleLayers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#070d17' },
    },
  ];

  if (MAP_TILES_CONFIGURED) {
    sources['base-raster'] = {
      type: 'raster',
      tiles: [MAP_TILE_URL],
      tileSize: 256,
      attribution: MAP_ATTRIBUTION,
    };
    styleLayers.push({
      id: 'base-raster',
      type: 'raster',
      source: 'base-raster',
      paint: {
        'raster-opacity': 0.82,
        'raster-saturation': -0.55,
        'raster-contrast': 0.12,
        'raster-brightness-min': 0.03,
        'raster-brightness-max': 0.72,
      },
    });
  }

  styleLayers.push(
    {
      id: 'graticule',
      type: 'line',
      source: 'graticule',
      paint: {
        'line-color': 'rgba(148, 163, 184, 0.14)',
        'line-width': 0.6,
      },
    },
    {
      id: 'region-fill',
      type: 'fill',
      source: 'region',
      paint: {
        'fill-color': '#22d3ee',
        'fill-opacity': 0.035,
      },
    },
    {
      id: 'region-outline',
      type: 'line',
      source: 'region',
      paint: {
        'line-color': '#22d3ee',
        'line-width': 1.2,
        'line-opacity': 0.55,
        'line-dasharray': [4, 4],
      },
    },
  );

  for (const layer of layers) {
    sources[`layer-${layer.id}`] = {
      type: 'geojson',
      data: toPointCollection(features[layer.id] ?? []),
    };
    styleLayers.push({
      id: `layer-${layer.id}-circles`,
      type: 'circle',
      source: `layer-${layer.id}`,
      layout: {
        visibility: layer.defaultEnabled ? 'visible' : 'none',
      },
      paint: {
        'circle-color': layer.color,
        'circle-radius': 5.5,
        'circle-opacity': 0.82,
        'circle-blur': 0.08,
        'circle-stroke-width': 1,
        'circle-stroke-color': 'rgba(5, 8, 14, 0.9)',
      },
    });
  }

  return {
    version: 8,
    sources,
    layers: styleLayers,
  };
}

export function MapContainer({
  region,
  layers = MAP_LAYERS,
  layerFeatures,
  focus = null,
  className,
  showSearch = true,
  showLegend = true,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [zoom, setZoom] = useState(region.zoom);
  const [coordinate, setCoordinate] = useState<[number, number]>(region.center);
  const [styleId, setStyleId] = useState<string>(MAP_STYLES[0]?.id ?? 'ops-dark');
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>(() =>
    layers.filter((layer) => layer.defaultEnabled).map((layer) => layer.id),
  );
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [stylePanelOpen, setStylePanelOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const features = useMemo(() => layerFeatures ?? {}, [layerFeatures]);

  const searchMatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = query
      ? region.locations.filter((location) =>
          location.name.toLowerCase().includes(query),
        )
      : region.locations;
    return matches.slice(0, 6);
  }, [region.locations, search]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) {
      return;
    }

    const map = new maplibregl.Map({
      container,
      style: createMapStyle(layers, features, region),
      center: region.center,
      zoom: region.zoom,
      minZoom: 1,
      maxZoom: 12,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      renderWorldCopies: true,
    });

    mapRef.current = map;

    map.on('load', () => setMapReady(true));
    map.on('moveend', () => setZoom(Number(map.getZoom().toFixed(2))));
    map.on('mousemove', (event) => {
      setCoordinate([event.lngLat.lng, event.lngLat.lat]);
    });

    for (const layer of layers) {
      const mapLayerId = `layer-${layer.id}-circles`;

      map.on('click', mapLayerId, (event) => {
        const feature = event.features?.[0];
        if (!feature) {
          return;
        }
        const properties = feature.properties as
          | { label?: string; detail?: string; value?: string }
          | null;

        const content = document.createElement('div');
        const title = document.createElement('p');
        title.className = 'text-xs font-semibold text-content';
        title.textContent = properties?.label ?? 'Demonstration station';
        const detail = document.createElement('p');
        detail.className = 'mt-0.5 text-[10px] text-content-muted';
        detail.textContent = properties?.detail ?? 'Demonstration layer';
        const value = document.createElement('p');
        value.className = 'mt-1 font-mono text-xs text-accent-cyan';
        value.textContent = properties?.value ?? '';
        content.append(title, detail, value);

        new maplibregl.Popup({ closeButton: true, offset: 12 })
          .setLngLat(event.lngLat)
          .setDOMContent(content)
          .addTo(map);
      });

      map.on('mouseenter', mapLayerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', mapLayerId, () => {
        map.getCanvas().style.cursor = '';
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // The map instance is created once; props are applied through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }
    const regionSource = map.getSource('region') as GeoJSONSource | undefined;
    regionSource?.setData(makeRegionPolygon(region));
    map.fitBounds(regionBounds(region), {
      padding: 48,
      duration: 600,
      maxZoom: 6,
    });
    setCoordinate(region.center);
  }, [region, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    for (const layer of layers) {
      const mapLayerId = `layer-${layer.id}-circles`;
      if (map.getLayer(mapLayerId)) {
        map.setLayoutProperty(
          mapLayerId,
          'visibility',
          activeLayerIds.includes(layer.id) ? 'visible' : 'none',
        );
      }
    }
  }, [activeLayerIds, layers, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    for (const layer of layers) {
      const source = map.getSource(`layer-${layer.id}`) as
        | GeoJSONSource
        | undefined;
      source?.setData(toPointCollection(features[layer.id] ?? []));
    }
  }, [features, layers, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }
    const style = MAP_STYLES.find((option) => option.id === styleId) ?? MAP_STYLES[0];

    if (style && map.getLayer('background')) {
      map.setPaintProperty('background', 'background-color', style.background);
    }
    if (style && map.getLayer('graticule')) {
      map.setPaintProperty('graticule', 'line-color', style.grid);
    }
    if (style && map.getLayer('region-fill')) {
      map.setPaintProperty('region-fill', 'fill-color', style.accent);
    }
    if (style && map.getLayer('region-outline')) {
      map.setPaintProperty('region-outline', 'line-color', style.accent);
    }
  }, [styleId, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !focus) {
      return;
    }
    map.flyTo({
      center: focus.coordinates,
      zoom: Math.max(map.getZoom(), 6),
      duration: 700,
    });
    setCoordinate(focus.coordinates);
  }, [focus, mapReady]);

  const toggleLayer = (layerId: string) => {
    setActiveLayerIds((current) =>
      current.includes(layerId)
        ? current.filter((id) => id !== layerId)
        : [...current, layerId],
    );
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 250 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 250 });
  };

  const handleReset = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    map.fitBounds(regionBounds(region), {
      padding: 48,
      duration: 600,
      maxZoom: 6,
    });
    setCoordinate(region.center);
  };

  const handleSearchSelect = (location: DemoLocation) => {
    const map = mapRef.current;
    map?.flyTo({
      center: location.coordinates,
      zoom: Math.max(map.getZoom(), 6),
      duration: 650,
    });
    setCoordinate(location.coordinates);
    setSearch(location.name);
    setSearchOpen(false);
  };

  return (
    <div
      className={cn(
        'relative isolate min-h-[360px] overflow-hidden rounded-2xl border border-line bg-canvas shadow-panel',
        className,
      )}
    >
      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        aria-label="Interactive environmental intelligence map"
      />
      <div className="map-vignette pointer-events-none absolute inset-0 z-[1]" />

      {!mapReady ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-canvas/45 p-4 backdrop-blur-sm">
          <LoadingState
            label="Initializing map canvas"
            className="w-64 bg-surface/90"
          />
        </div>
      ) : null}

      {showSearch ? (
        <div className="absolute left-3 top-3 z-20 w-[min(18rem,calc(100%-8.5rem))] sm:left-4 sm:top-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-faint"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setSearchOpen(false), 140);
              }}
              placeholder="Search location"
              aria-label="Search map location"
              className="h-9 w-full rounded-lg border border-line bg-surface/90 pl-8 pr-2.5 text-xs text-content placeholder:text-content-faint shadow-panel backdrop-blur-xl transition-colors focus:border-accent-cyan/40 focus:outline-none focus:ring-1 focus:ring-accent-cyan/25"
            />
          </div>

          {searchOpen ? (
            <div className="mt-2 overflow-hidden rounded-lg border border-line-strong bg-surface-overlay/95 shadow-float backdrop-blur-xl">
              <p className="border-b border-line/60 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-content-faint">
                Demonstration locations
              </p>
              {searchMatches.length > 0 ? (
                <ul className="p-1">
                  {searchMatches.map((location) => (
                    <li key={location.name}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSearchSelect(location)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-content-secondary transition-colors hover:bg-white/[0.05] hover:text-content"
                      >
                        <MapPin
                          className="h-3 w-3 text-content-faint"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {location.name}
                        </span>
                        <span className="font-mono text-[9px] text-content-faint">
                          {location.coordinates[1].toFixed(1)},{' '}
                          {location.coordinates[0].toFixed(1)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2.5 py-3 text-[10px] text-content-faint">
                  No demonstration locations match.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {!MAP_TILES_CONFIGURED ? (
        <div
          className={cn(
            'pointer-events-none absolute left-3 z-10 sm:left-4',
            showSearch ? 'top-[3.9rem]' : 'top-3 sm:top-4',
          )}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-signal-amber/20 bg-surface/85 px-2.5 py-1 text-[10px] font-medium text-signal-amber shadow-panel backdrop-blur-xl">
            <Info className="h-3 w-3" aria-hidden="true" />
            Local graticule preview · tiles not configured
          </span>
        </div>
      ) : null}

      <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2 sm:right-4 sm:top-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStylePanelOpen((current) => !current);
              setLayerPanelOpen(false);
            }}
            className={buttonClasses(
              'secondary',
              'sm',
              'h-9 gap-2 border-line bg-surface/90 backdrop-blur-xl',
            )}
            aria-expanded={stylePanelOpen}
          >
            <Palette className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Style</span>
            <ChevronDown
              className={cn(
                'hidden h-3 w-3 text-content-faint transition-transform sm:block',
                stylePanelOpen ? 'rotate-180' : '',
              )}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setLayerPanelOpen((current) => !current);
              setStylePanelOpen(false);
            }}
            className={buttonClasses(
              'secondary',
              'sm',
              'h-9 gap-2 border-line bg-surface/90 backdrop-blur-xl',
            )}
            aria-expanded={layerPanelOpen}
          >
            <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Layers</span>
            <span className="rounded bg-white/[0.06] px-1 font-mono text-[9px] text-content-muted">
              {activeLayerIds.length}
            </span>
          </button>
        </div>

        {stylePanelOpen ? (
          <div className="w-64 overflow-hidden rounded-xl border border-line-strong bg-surface-overlay/95 shadow-float backdrop-blur-xl">
            <div className="border-b border-line/70 px-3 py-2.5">
              <p className="text-xs font-semibold text-content">Map style</p>
              <p className="text-[10px] text-content-faint">
                Base appearance and operational palette.
              </p>
            </div>
            <div className="p-1.5">
              {MAP_STYLES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setStyleId(option.id);
                    setStylePanelOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors',
                    option.id === styleId
                      ? 'bg-accent-cyan/10'
                      : 'hover:bg-white/[0.05]',
                  )}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-md border"
                    style={{
                      backgroundColor: option.background,
                      borderColor: option.accent,
                    }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block text-xs font-medium',
                        option.id === styleId
                          ? 'text-accent-cyan'
                          : 'text-content-secondary',
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="block text-[10px] text-content-faint">
                      {option.description}
                    </span>
                  </span>
                  {option.id === styleId ? (
                    <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {layerPanelOpen ? (
          <LayerSelector
            layers={layers}
            activeLayerIds={activeLayerIds}
            onToggle={toggleLayer}
            onClose={() => setLayerPanelOpen(false)}
          />
        ) : null}
      </div>

      <MapControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      {showLegend ? (
        <MapLegend layers={layers} activeLayerIds={activeLayerIds} />
      ) : null}

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 rounded-lg border border-line bg-surface/85 px-3 py-1.5 font-mono text-[10px] text-content-muted shadow-panel backdrop-blur-xl md:flex">
        <span>LNG {formatCoordinate(coordinate[0], 'lng')}</span>
        <span className="h-3 w-px bg-line" />
        <span>LAT {formatCoordinate(coordinate[1], 'lat')}</span>
        <span className="h-3 w-px bg-line" />
        <span>Z {zoom.toFixed(1)}</span>
        <span className="h-3 w-px bg-line" />
        <span>{region.shortName}</span>
      </div>
    </div>
  );
}
