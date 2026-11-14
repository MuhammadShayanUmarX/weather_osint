import type { LucideIcon } from 'lucide-react';

export type StatusTone = 'nominal' | 'watch' | 'warning' | 'critical' | 'info';

export type DataSourceState =
  | 'operational'
  | 'degraded'
  | 'offline'
  | 'simulated'
  | 'not-configured';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface DemoLocation {
  name: string;
  coordinates: [number, number];
}

export interface Region {
  id: string;
  name: string;
  shortName: string;
  center: [number, number];
  zoom: number;
  bounds: [number, number, number, number];
  locations: DemoLocation[];
  rivers: string[];
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  region: string;
  severity: StatusTone;
  source: string;
  time: string;
  category: string;
}

export interface ObservationItem {
  id: string;
  location: string;
  coordinates: [number, number];
  parameter: string;
  value: string;
  observedAt: string;
  source: string;
  tone: StatusTone;
}

export interface DataSource {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: DataSourceState;
  lastSync: string;
  latency: string;
  coverage: string;
  note?: string;
}

export interface RiverGauge {
  id: string;
  name: string;
  level: number;
  warningLevel: number;
  status: StatusTone;
  trend: 'rising' | 'falling' | 'steady';
  discharge: number;
}

export interface StationReading {
  id: string;
  name: string;
  coordinates: [number, number];
  aqi: number;
  pm25: number;
  temperature: number;
  rainfall: number;
  tone: StatusTone;
}

export interface ForecastDay {
  day: string;
  condition: string;
  high: number;
  low: number;
  rainChance: number;
}

export interface MapLayerDefinition {
  id: string;
  label: string;
  description: string;
  color: string;
  category: string;
  defaultEnabled: boolean;
}

export interface MapMarker {
  id: string;
  label: string;
  detail?: string;
  coordinates: [number, number];
  tone: StatusTone;
  value?: string;
}

export interface DemoReport {
  id: string;
  title: string;
  type: string;
  region: string;
  createdAt: string;
  status: 'Ready' | 'Draft' | 'Scheduled';
  format: 'PDF' | 'GeoJSON' | 'CSV';
  pages: number;
}
