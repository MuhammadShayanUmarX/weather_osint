import type { MapLayerDefinition } from '@/types';

const configuredTileUrl = import.meta.env.VITE_MAP_TILE_URL?.trim() ?? '';

export const MAP_TILE_URL = configuredTileUrl;
export const MAP_TILES_CONFIGURED = configuredTileUrl.length > 0;
export const MAP_ATTRIBUTION =
  import.meta.env.VITE_MAP_ATTRIBUTION?.trim() ||
  '© OpenStreetMap contributors';

export interface MapStyleOption {
  id: string;
  label: string;
  description: string;
  background: string;
  grid: string;
  accent: string;
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'ops-dark',
    label: 'Operations Dark',
    description: 'Deep navy base for low-light operations',
    background: '#070d17',
    grid: 'rgba(148, 163, 184, 0.14)',
    accent: '#22d3ee',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    description: 'Neutral charcoal base with reduced contrast',
    background: '#0a0d12',
    grid: 'rgba(148, 163, 184, 0.12)',
    accent: '#94a3b8',
  },
  {
    id: 'oceanic',
    label: 'Oceanic',
    description: 'Blue-shifted base for hydro analysis',
    background: '#06111c',
    grid: 'rgba(96, 165, 250, 0.15)',
    accent: '#60a5fa',
  },
];

export type MapStyleId = (typeof MAP_STYLES)[number]['id'];

export const MAP_LAYERS: MapLayerDefinition[] = [
  {
    id: 'weather',
    label: 'Weather stations',
    description: 'Surface temperature and wind observations',
    color: '#2dd4bf',
    category: 'Atmosphere',
    defaultEnabled: true,
  },
  {
    id: 'rainfall',
    label: 'Rainfall accumulations',
    description: '24-hour precipitation totals',
    color: '#60a5fa',
    category: 'Hydrosphere',
    defaultEnabled: true,
  },
  {
    id: 'flood',
    label: 'Flood gauges',
    description: 'River level relative to warning threshold',
    color: '#fbbf24',
    category: 'Hydrosphere',
    defaultEnabled: true,
  },
  {
    id: 'air',
    label: 'Air quality stations',
    description: 'PM2.5 and composite AQI readings',
    color: '#22d3ee',
    category: 'Atmosphere',
    defaultEnabled: true,
  },
  {
    id: 'fire',
    label: 'Thermal anomalies',
    description: 'Satellite fire detections and radiative power',
    color: '#f87171',
    category: 'Cryosphere & land',
    defaultEnabled: false,
  },
  {
    id: 'drought',
    label: 'Drought index',
    description: 'Standardized precipitation index sampling',
    color: '#fb923c',
    category: 'Cryosphere & land',
    defaultEnabled: false,
  },
];
