import { MAP_TILES_CONFIGURED } from '@/config/map';
import {
  aqiCategory,
  aqiTone,
  conditionFromSignals,
  riskLabel,
  riskTone,
  spiLabel,
  spiTone,
  windDirection,
} from '@/lib/environment';
import { formatCompact } from '@/lib/format';
import type {
  AlertItem,
  DataSource,
  DemoReport,
  ForecastDay,
  MapMarker,
  ObservationItem,
  Region,
  RiverGauge,
  StationReading,
  StatusTone,
} from '@/types';

export interface TemperaturePoint {
  time: string;
  temperature: number;
  humidity: number;
  precipitationChance: number;
}

export interface RainfallPoint {
  day: string;
  rainfall: number;
  average: number;
}

export interface AqiPoint {
  time: string;
  aqi: number;
  pm25: number;
}

export interface NdviPoint {
  month: string;
  ndvi: number;
  baseline: number;
}

export interface SpiPoint {
  month: string;
  spi: number;
}

export interface FirePoint {
  day: string;
  detections: number;
  frp: number;
}

export interface DischargePoint {
  day: string;
  discharge: number;
  warning: number;
}

export interface PollutantPoint {
  name: string;
  value: number;
  limit: number;
  unit: string;
}

export interface EnvironmentalChangeData {
  ndviAnomaly: number;
  vegetationLossHa: number;
  waterChangePct: number;
  urbanExpansionHa: number;
  burnedAreaHa: number;
  changeConfidence: number;
}

export interface DroughtData {
  spi: number;
  soilMoisturePct: number;
  reservoirPct: number;
  affectedPopulation: string;
  severity: string;
  trend: 'improving' | 'persisting' | 'deteriorating';
}

export interface FireData {
  activeDetections: number;
  frp: number;
  riskIndex: number;
  burnedAreaHa: number;
  confidence: number;
}

export interface CurrentWeather {
  condition: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windKph: number;
  windDegrees: number;
  windDirection: string;
  pressureHpa: number;
  visibilityKm: number;
  dewPointC: number;
  uvIndex: number;
}

export interface RainfallData {
  last24hMm: number;
  last7dMm: number;
  monthlyMm: number;
  anomalyPct: number;
  forecast24hMm: number;
  intensity: string;
  thresholdMm: number;
  wetDays: number;
}

export interface FloodData {
  riskScore: number;
  riskLabel: string;
  gaugesAboveWarning: number;
  peakDischarge: number;
  trend: string;
  rivers: RiverGauge[];
}

export interface AirQualityData {
  aqi: number;
  category: string;
  dominantPollutant: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  stations: StationReading[];
}

export interface RegionDemo {
  region: Region;
  current: CurrentWeather;
  rainfall: RainfallData;
  flood: FloodData;
  airQuality: AirQualityData;
  alerts: AlertItem[];
  observations: ObservationItem[];
  sources: DataSource[];
  temperature24h: TemperaturePoint[];
  rainfall14d: RainfallPoint[];
  aqi24h: AqiPoint[];
  ndviTrend: NdviPoint[];
  droughtSpi: SpiPoint[];
  fire7d: FirePoint[];
  discharge14d: DischargePoint[];
  pollutants: PollutantPoint[];
  forecast7d: ForecastDay[];
  environmentalChange: EnvironmentalChangeData;
  drought: DroughtData;
  fire: FireData;
  reports: DemoReport[];
  mapFeatures: Record<string, MapMarker[]>;
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hourLabels(): string[] {
  return Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);
}

function dayLabels(count: number): string[] {
  const formatter = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
  });
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (count - 1 - index));
    return formatter.format(date);
  });
}

function monthLabels(count: number): string[] {
  const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return formatter.format(date);
  });
}

export function buildRegionDemo(region: Region): RegionDemo {
  const rng = mulberry32(hashSeed(region.id));
  const rand = (min: number, max: number) => min + rng() * (max - min);
  const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
  const pick = <T,>(values: readonly T[]): T =>
    values[Math.floor(rng() * values.length)] as T;

  const temperatureC = Math.round(rand(14, 35));
  const humidityPct = Math.round(rand(35, 90));
  const windKph = Math.round(rand(4, 38));
  const windDegrees = Math.round(rand(0, 359));
  const pressureHpa = Math.round(rand(996, 1024));
  const visibilityKm = Math.round(rand(4, 20));
  const dewPointC = Math.round(temperatureC - (100 - humidityPct) / 5);
  const uvIndex = Math.round(rand(1, 11));

  const last24hMm = Math.round(rand(0, 118));
  const last7dMm = Math.round(last24hMm + rand(12, 190));
  const monthlyMm = Math.round(last7dMm + rand(35, 260));
  const anomalyPct = Math.round(rand(-52, 74));
  const forecast24hMm = Math.round(rand(0, 85));
  const thresholdMm = 50;
  const wetDays = randInt(1, 7);
  const intensity =
    last24hMm > 70
      ? 'Intense'
      : last24hMm > 30
        ? 'Moderate'
        : last24hMm > 5
          ? 'Light'
          : 'Trace';
  const condition = conditionFromSignals(temperatureC, last24hMm);

  const riskScore = Math.round(rand(18, 94));
  const rivers: RiverGauge[] = region.rivers.map((name, index) => {
    const warningLevel = Math.round(rand(58, 84));
    const level = Math.round(rand(34, 108));
    const status: StatusTone =
      level >= warningLevel + 8
        ? 'critical'
        : level >= warningLevel
          ? 'warning'
          : level >= warningLevel - 18
            ? 'watch'
            : 'nominal';
    const trend = pick(['rising', 'falling', 'steady'] as const);
    const discharge = Math.round(rand(420, 5200));
    return {
      id: `river-${region.id}-${index}`,
      name,
      level,
      warningLevel,
      status,
      trend,
      discharge,
    };
  });
  const gaugesAboveWarning = rivers.filter((river) => river.level >= river.warningLevel).length;
  const peakDischarge = Math.max(...rivers.map((river) => river.discharge));
  const floodTrend =
    gaugesAboveWarning > 2 ? 'rising' : gaugesAboveWarning > 0 ? 'mixed' : 'stable';

  const aqi = Math.round(rand(38, 208));
  const pm25 = Math.round(rand(12, 128));
  const pm10 = Math.round(pm25 * rand(1.4, 2.1));
  const no2 = Math.round(rand(8, 74));
  const o3 = Math.round(rand(18, 96));
  const so2 = Math.round(rand(2, 28));
  const co = Math.round(rand(0.3, 2.6) * 10) / 10;
  const dominantPollutant = pick(['PM2.5', 'PM10', 'O₃', 'NO₂'] as const);
  const stations: StationReading[] = region.locations.map((location, index) => {
    const stationAqi = Math.round(clamp(aqi + rand(-52, 52), 18, 260));
    const stationPm25 = Math.round(clamp(pm25 + rand(-30, 30), 6, 180));
    return {
      id: `station-${region.id}-${index}`,
      name: location.name,
      coordinates: location.coordinates,
      aqi: stationAqi,
      pm25: stationPm25,
      temperature: Math.round(clamp(temperatureC + rand(-4, 4), -5, 45)),
      rainfall: Math.round(clamp(last24hMm + rand(-30, 30), 0, 180)),
      tone: aqiTone(stationAqi),
    };
  });

  const burnedAreaHa = Math.round(rand(0, 2600));
  const fire: FireData = {
    activeDetections: randInt(0, 84),
    frp: Math.round(rand(4, 260)),
    riskIndex: Math.round(rand(22, 96)),
    burnedAreaHa,
    confidence: Math.round(rand(60, 98)),
  };

  const spi = Math.round(rand(-2.6, 0.9) * 10) / 10;
  const drought: DroughtData = {
    spi,
    soilMoisturePct: Math.round(rand(8, 42)),
    reservoirPct: Math.round(rand(18, 84)),
    affectedPopulation: `${formatCompact(randInt(50_000, 4_800_000))} people`,
    severity: spiLabel(spi),
    trend: pick(['improving', 'persisting', 'deteriorating'] as const),
  };

  const environmentalChange: EnvironmentalChangeData = {
    ndviAnomaly: Math.round(rand(-28, 12) * 10) / 10,
    vegetationLossHa: Math.round(rand(180, 4200)),
    waterChangePct: Math.round(rand(-18, 14)),
    urbanExpansionHa: Math.round(rand(40, 780)),
    burnedAreaHa,
    changeConfidence: Math.round(rand(62, 94)),
  };

  const alerts: AlertItem[] = [
    {
      id: `alert-${region.id}-rain`,
      title: `${last24hMm >= thresholdMm ? 'Heavy rainfall warning' : 'Rainfall watch'} — ${pick(region.locations).name}`,
      description: `${last24hMm} mm recorded in 24 hours against a ${thresholdMm} mm watch threshold. ${intensity} intensity classification.`,
      region: region.name,
      severity: last24hMm >= thresholdMm ? 'warning' : 'watch',
      source: 'Open-Meteo · simulated',
      time: `${randInt(6, 52)} min ago`,
      category: 'Rainfall',
    },
    {
      id: `alert-${region.id}-flood`,
      title: `River ${pick(region.rivers)} gauge ${gaugesAboveWarning > 0 ? 'above warning' : 'approaching watch'}`,
      description: `${gaugesAboveWarning} of ${rivers.length} demonstration gauges are at or above the warning threshold. Peak discharge is ${peakDischarge.toLocaleString('en-US')} m³/s.`,
      region: region.name,
      severity: riskTone(riskScore),
      source: 'Copernicus EMS · simulated',
      time: `${randInt(18, 96)} min ago`,
      category: 'Flood',
    },
    {
      id: `alert-${region.id}-air`,
      title: `Air quality ${aqiCategory(aqi).toLowerCase()} — ${pick(region.locations).name}`,
      description: `Composite AQI is ${aqi} with ${dominantPollutant} as the dominant pollutant. Values are demonstration data only.`,
      region: region.name,
      severity: aqiTone(aqi),
      source: 'OpenAQ · simulated',
      time: `${randInt(1, 5)} hr ago`,
      category: 'Air quality',
    },
    {
      id: `alert-${region.id}-fire`,
      title: `Thermal anomaly cluster — ${pick(region.locations).name}`,
      description: `${fire.activeDetections} active detections with ${fire.frp} MW aggregate radiative power in the demonstration feed.`,
      region: region.name,
      severity: fire.riskIndex >= 75 ? 'critical' : 'warning',
      source: 'NASA FIRMS · simulated',
      time: `${randInt(2, 8)} hr ago`,
      category: 'Fire',
    },
    {
      id: `alert-${region.id}-drought`,
      title: `${drought.severity} signal — ${region.name}`,
      description: `SPI-12 is ${drought.spi}. Soil moisture is at ${drought.soilMoisturePct}% and reservoir storage at ${drought.reservoirPct}%.`,
      region: region.name,
      severity: spiTone(spi),
      source: 'Copernicus Climate · simulated',
      time: `${randInt(3, 14)} hr ago`,
      category: 'Drought',
    },
    {
      id: `alert-${region.id}-vegetation`,
      title: `Vegetation anomaly ${environmentalChange.ndviAnomaly > 0 ? 'increase' : 'decline'} detected`,
      description: `NDVI anomaly is ${environmentalChange.ndviAnomaly}% against the seasonal baseline across sampled areas.`,
      region: region.name,
      severity: environmentalChange.ndviAnomaly < -10 ? 'watch' : 'info',
      source: 'Copernicus Sentinel-2 · simulated',
      time: `${randInt(6, 22)} hr ago`,
      category: 'Vegetation',
    },
  ];

  const observationSeed: Array<{
    parameter: string;
    value: string;
    tone: StatusTone;
  }> = [
    { parameter: 'Air temperature', value: `${temperatureC}°C`, tone: 'info' },
    {
      parameter: '24h rainfall',
      value: `${last24hMm} mm`,
      tone: last24hMm >= thresholdMm ? 'warning' : 'nominal',
    },
    {
      parameter: 'River level',
      value: `${rivers[0]?.level ?? 0}% of warning`,
      tone: rivers[0]?.status ?? 'nominal',
    },
    { parameter: 'Composite AQI', value: `${aqi}`, tone: aqiTone(aqi) },
    {
      parameter: 'Wind speed',
      value: `${windKph} km/h ${windDirection(windDegrees)}`,
      tone: 'info',
    },
    {
      parameter: 'Soil moisture',
      value: `${drought.soilMoisturePct}%`,
      tone: drought.soilMoisturePct < 18 ? 'watch' : 'nominal',
    },
    {
      parameter: 'NDVI anomaly',
      value: `${environmentalChange.ndviAnomaly}%`,
      tone: environmentalChange.ndviAnomaly < -10 ? 'watch' : 'nominal',
    },
    {
      parameter: 'Thermal detections',
      value: `${fire.activeDetections}`,
      tone: fire.activeDetections > 40 ? 'warning' : 'nominal',
    },
  ];

  const observations: ObservationItem[] = observationSeed.map((item, index) => {
    const location = region.locations[index % region.locations.length] as Region['locations'][number];
    return {
      id: `observation-${region.id}-${index}`,
      location: location.name,
      coordinates: location.coordinates,
      parameter: item.parameter,
      value: item.value,
      observedAt: `${randInt(2, 58)} min ago`,
      source: 'Demonstration dataset',
      tone: item.tone,
    };
  });

  const sources: DataSource[] = [
    {
      id: 'open-meteo',
      name: 'Open-Meteo',
      provider: 'Weather and climate forecast',
      category: 'Atmosphere',
      status: 'simulated',
      lastSync: 'Not connected',
      latency: '—',
      coverage: 'Global',
    },
    {
      id: 'chirps',
      name: 'CHIRPS',
      provider: 'Satellite-gauge rainfall',
      category: 'Hydrosphere',
      status: 'simulated',
      lastSync: 'Not connected',
      latency: '—',
      coverage: '50°N–50°S',
    },
    {
      id: 'nasa-firms',
      name: 'NASA FIRMS',
      provider: 'Thermal anomaly detections',
      category: 'Land',
      status: 'simulated',
      lastSync: 'Not connected',
      latency: '—',
      coverage: 'Global',
    },
    {
      id: 'sentinel-2',
      name: 'Copernicus Sentinel-2',
      provider: 'Multispectral vegetation',
      category: 'Land',
      status: 'simulated',
      lastSync: 'Not connected',
      latency: '—',
      coverage: 'Global',
    },
    {
      id: 'copernicus-ems',
      name: 'Copernicus EMS',
      provider: 'Flood and disaster mapping',
      category: 'Hydrosphere',
      status: 'simulated',
      lastSync: 'Not connected',
      latency: '—',
      coverage: 'Activation-based',
    },
    {
      id: 'era5',
      name: 'ERA5',
      provider: 'Climate reanalysis',
      category: 'Atmosphere',
      status: 'simulated',
      lastSync: 'Not connected',
      latency: '—',
      coverage: 'Global',
    },
    {
      id: 'openaq',
      name: 'OpenAQ',
      provider: 'Air quality station network',
      category: 'Atmosphere',
      status: 'simulated',
      lastSync: 'Not connected',
      latency: '—',
      coverage: 'Global',
    },
    {
      id: 'openstreetmap',
      name: 'OpenStreetMap',
      provider: 'Base map tiles',
      category: 'Basemap',
      status: MAP_TILES_CONFIGURED ? 'operational' : 'not-configured',
      lastSync: MAP_TILES_CONFIGURED ? 'Tile URL configured' : 'Not configured',
      latency: '—',
      coverage: 'Global',
      note: MAP_TILES_CONFIGURED
        ? 'Raster tiles supplied through VITE_MAP_TILE_URL.'
        : 'Set VITE_MAP_TILE_URL to enable raster base tiles.',
    },
  ];

  const hours = hourLabels();
  const days14 = dayLabels(14);
  const days7 = dayLabels(7);
  const months12 = monthLabels(12);

  const temperature24h: TemperaturePoint[] = hours.map((time, index) => ({
    time,
    temperature: Math.round(
      temperatureC + Math.sin(((index - 6) / 24) * Math.PI * 2) * 5 + rand(-1.4, 1.4),
    ),
    humidity: Math.round(
      clamp(
        humidityPct + Math.cos(((index - 6) / 24) * Math.PI * 2) * 9 + rand(-2, 2),
        20,
        98,
      ),
    ),
    precipitationChance: Math.round(
      clamp(last24hMm * 0.4 + rand(-12, 28), 0, 95),
    ),
  }));

  const rainfall14d: RainfallPoint[] = days14.map((day, index) => ({
    day,
    rainfall: Math.round(
      clamp(
        last24hMm * (0.2 + rng() * 0.9) +
          (index === days14.length - 1 ? last24hMm * 0.4 : 0),
        0,
        160,
      ),
    ),
    average: Math.round(clamp(monthlyMm / 22 + rand(-8, 12), 0, 90)),
  }));

  const aqi24h: AqiPoint[] = hours.map((time, index) => ({
    time,
    aqi: Math.round(
      clamp(aqi + Math.sin(index / 3) * 18 + rand(-8, 8), 10, 320),
    ),
    pm25: Math.round(
      clamp(pm25 + Math.sin(index / 4) * 14 + rand(-6, 6), 3, 220),
    ),
  }));

  const ndviTrend: NdviPoint[] = months12.map((month, index) => ({
    month,
    ndvi:
      Math.round(
        clamp(
          0.38 + Math.sin((index / 12) * Math.PI * 2) * 0.12 + rand(-0.03, 0.03),
          0.12,
          0.78,
        ) * 100,
      ) / 100,
    baseline: 0.42,
  }));

  const droughtSpi: SpiPoint[] = months12.map((month, index) => ({
    month,
    spi:
      Math.round(
        clamp(
          spi + Math.sin((index / 12) * Math.PI * 2 + 1) * 0.9 + rand(-0.25, 0.25),
          -3,
          2,
        ) * 10,
      ) / 10,
  }));

  const fire7d: FirePoint[] = days7.map((day) => ({
    day,
    detections: Math.round(clamp(fire.activeDetections * (0.3 + rng() * 0.9), 0, 120)),
    frp: Math.round(clamp(fire.frp * (0.3 + rng() * 0.9), 0, 380)),
  }));

  const discharge14d: DischargePoint[] = days14.map((day, index) => ({
    day,
    discharge: Math.round(
      clamp(
        peakDischarge * (0.55 + (index / 13) * 0.35 + rand(-0.1, 0.1)),
        100,
        peakDischarge * 1.2,
      ),
    ),
    warning: Math.round(peakDischarge * 0.85),
  }));

  const pollutants: PollutantPoint[] = [
    { name: 'PM2.5', value: pm25, limit: 25, unit: 'µg/m³' },
    { name: 'PM10', value: pm10, limit: 50, unit: 'µg/m³' },
    { name: 'NO₂', value: no2, limit: 40, unit: 'µg/m³' },
    { name: 'O₃', value: o3, limit: 100, unit: 'µg/m³' },
    { name: 'SO₂', value: so2, limit: 20, unit: 'µg/m³' },
    { name: 'CO', value: co, limit: 4, unit: 'mg/m³' },
  ];

  const conditions = [
    'Partly cloudy',
    'Light rain',
    'Overcast',
    'Clear',
    'Haze',
    'Thunderstorm watch',
    'Moderate rain',
  ];

  const forecast7d: ForecastDay[] = days7.map((day) => {
    const high = Math.round(clamp(temperatureC + rand(-3, 5), -5, 46));
    return {
      day,
      condition: pick(conditions),
      high,
      low: high - randInt(4, 10),
      rainChance: Math.round(clamp(forecast24hMm + rand(-30, 30), 0, 95)),
    };
  });

  const mapFeatures: Record<string, MapMarker[]> = {
    weather: stations.map((station, index) => ({
      id: `map-weather-${region.id}-${index}`,
      label: station.name,
      detail: 'Weather station',
      value: `${station.temperature}°C`,
      coordinates: station.coordinates,
      tone: station.temperature > 34 ? 'watch' : 'info',
    })),
    rainfall: stations.map((station, index) => ({
      id: `map-rain-${region.id}-${index}`,
      label: station.name,
      detail: '24h rainfall accumulation',
      value: `${station.rainfall} mm`,
      coordinates: station.coordinates,
      tone: station.rainfall >= thresholdMm ? 'warning' : 'info',
    })),
    flood: rivers.map((river, index) => {
      const location = region.locations[index % region.locations.length] as Region['locations'][number];
      return {
        id: `map-flood-${region.id}-${index}`,
        label: `${river.name} gauge`,
        detail: 'River level relative to warning threshold',
        value: `${river.level}%`,
        coordinates: location.coordinates,
        tone: river.status,
      };
    }),
    air: stations.map((station, index) => ({
      id: `map-air-${region.id}-${index}`,
      label: station.name,
      detail: 'Air quality station',
      value: `AQI ${station.aqi}`,
      coordinates: station.coordinates,
      tone: station.tone,
    })),
    fire: region.locations.slice(0, 4).map((location, index) => ({
      id: `map-fire-${region.id}-${index}`,
      label: location.name,
      detail: 'Thermal anomaly cluster',
      value: `${randInt(1, 24)} detections`,
      coordinates: location.coordinates,
      tone: index === 0 ? 'critical' : 'warning',
    })),
    drought: region.locations.slice(0, 4).map((location, index) => ({
      id: `map-drought-${region.id}-${index}`,
      label: location.name,
      detail: 'SPI-12 sampling point',
      value: `SPI ${spi}`,
      coordinates: location.coordinates,
      tone: spiTone(spi),
    })),
  };

  const reports: DemoReport[] = [
    {
      id: `RPT-${region.id.slice(0, 3).toUpperCase()}-1042`,
      title: `${region.name} weekly environmental brief`,
      type: 'Weekly brief',
      region: region.name,
      createdAt: '31 Oct 2026',
      status: 'Ready',
      format: 'PDF',
      pages: 12,
    },
    {
      id: `RPT-${region.id.slice(0, 3).toUpperCase()}-1038`,
      title: `${region.name} flood exposure snapshot`,
      type: 'Flood analysis',
      region: region.name,
      createdAt: '29 Oct 2026',
      status: 'Ready',
      format: 'GeoJSON',
      pages: 6,
    },
    {
      id: `RPT-${region.id.slice(0, 3).toUpperCase()}-1031`,
      title: `${region.name} air quality station audit`,
      type: 'Air quality',
      region: region.name,
      createdAt: '24 Oct 2026',
      status: 'Draft',
      format: 'PDF',
      pages: 9,
    },
    {
      id: `RPT-${region.id.slice(0, 3).toUpperCase()}-1024`,
      title: `${region.name} vegetation anomaly review`,
      type: 'Land change',
      region: region.name,
      createdAt: '18 Oct 2026',
      status: 'Scheduled',
      format: 'PDF',
      pages: 15,
    },
  ];

  return {
    region,
    current: {
      condition,
      temperatureC,
      feelsLikeC: temperatureC + Math.round(rand(-2, 4)),
      humidityPct,
      windKph,
      windDegrees,
      windDirection: windDirection(windDegrees),
      pressureHpa,
      visibilityKm,
      dewPointC,
      uvIndex,
    },
    rainfall: {
      last24hMm,
      last7dMm,
      monthlyMm,
      anomalyPct,
      forecast24hMm,
      intensity,
      thresholdMm,
      wetDays,
    },
    flood: {
      riskScore,
      riskLabel: riskLabel(riskScore),
      gaugesAboveWarning,
      peakDischarge,
      trend: floodTrend,
      rivers,
    },
    airQuality: {
      aqi,
      category: aqiCategory(aqi),
      dominantPollutant,
      pm25,
      pm10,
      no2,
      o3,
      so2,
      co,
      stations,
    },
    alerts,
    observations,
    sources,
    temperature24h,
    rainfall14d,
    aqi24h,
    ndviTrend,
    droughtSpi,
    fire7d,
    discharge14d,
    pollutants,
    forecast7d,
    environmentalChange,
    drought,
    fire,
    reports,
    mapFeatures,
  };
}
