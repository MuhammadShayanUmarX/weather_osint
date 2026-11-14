import { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Circle,
  CircleMarker,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  Plus,
  Minus,
  Crosshair,
  Maximize2,
  Navigation,
  X,
  Thermometer,
  CloudRain,
  Sun,
  Snowflake,
  AlertTriangle,
  RefreshCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  fetchPakistanStations,
  fetchLiveWeather,
  PAKISTAN_CITIES,
  type PakistanStationWeather,
  type LiveWeatherData,
} from '@/services/liveWeather';
import { soundAlert } from '@/lib/soundAlert';

// Custom weather marker badge generator with Srdi (Cold) / Garmi (Hot) color tokens
function createWeatherMarkerIcon(station: PakistanStationWeather) {
  // Srdi vs Garmi color badges
  let tempColorClass = 'text-sky-300 border-sky-400 bg-sky-950/90';
  let tempIcon = '⛅';

  if (station.tempCategory === 'severe_cold') {
    tempColorClass = 'text-cyan-200 border-cyan-300 bg-cyan-950/95 shadow-cyan-900/60';
    tempIcon = '❄️';
  } else if (station.tempCategory === 'cold') {
    tempColorClass = 'text-blue-300 border-blue-400 bg-blue-950/90 shadow-blue-900/60';
    tempIcon = '🧥';
  } else if (station.tempCategory === 'mild') {
    tempColorClass = 'text-emerald-300 border-emerald-400 bg-emerald-950/90';
    tempIcon = '⛅';
  } else if (station.tempCategory === 'warm') {
    tempColorClass = 'text-amber-300 border-amber-400 bg-amber-950/90';
    tempIcon = '☀️';
  } else if (station.tempCategory === 'hot') {
    tempColorClass = 'text-orange-300 border-orange-500 bg-orange-950/95 shadow-orange-900/60';
    tempIcon = '🔥';
  } else if (station.tempCategory === 'extreme_heat') {
    tempColorClass = 'text-rose-300 border-rose-500 bg-rose-950/95 shadow-rose-900/70 animate-pulse';
    tempIcon = '🌡️';
  }

  // Active Rain badge highlight
  if (station.isRaining) {
    tempColorClass = 'text-rose-200 border-rose-500 bg-rose-950/95 ring-2 ring-rose-500 shadow-rose-900/80';
    tempIcon = '🌧️';
  }

  const html = `
    <div class="flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-xl backdrop-blur-md text-[11px] font-bold ${tempColorClass}">
      <span>${tempIcon}</span>
      <span>${Math.round(station.temp)}°C</span>
      <span class="opacity-80 text-[10px] font-normal">${station.name}</span>
      ${station.isRaining ? '<span class="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>' : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-weather-marker',
    iconSize: [98, 28],
    iconAnchor: [49, 14],
  });
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function Overview() {
  const [mapStyle, setMapStyle] = useState<'osm' | 'satellite'>('osm');
  const [showLayers, setShowLayers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundOn, setSoundOn] = useState(true);

  // Default centered on Pakistan
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.3753, 69.3451]);
  const [mapZoom, setMapZoom] = useState(6);

  // GeoJSON & Weather Data State
  const [geoData, setGeoData] = useState<any>(null);
  const [stations, setStations] = useState<PakistanStationWeather[]>([]);
  const [centerWeather, setCenterWeather] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRainZones, setActiveRainZones] = useState<PakistanStationWeather[]>([]);

  // Layer switches
  const [layers, setLayers] = useState({
    borders: true,
    weatherBadges: true,
    rainFences: true,
    coldZones: true,
    hotZones: true,
  });

  const beepIntervalRef = useRef<any>(null);

  // Load official high-precision Pakistan GeoJSON
  useEffect(() => {
    fetch('/pakistan.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.warn('GeoJSON loading:', err));
  }, []);

  // Fetch live PMD & Open-Meteo Weather
  const refreshAllWeather = async () => {
    setLoading(true);
    try {
      const [stationList, centerData] = await Promise.all([
        fetchPakistanStations(),
        fetchLiveWeather(mapCenter[0], mapCenter[1]),
      ]);
      setStations(stationList);
      if (centerData) setCenterWeather(centerData);

      // Check active rain stations
      const raining = stationList.filter((s) => s.isRaining);
      setActiveRainZones(raining);

      // Trigger audio beep if active rain fence is found
      if (raining.length > 0 && soundOn) {
        soundAlert.playRainAlertBeep();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllWeather();
  }, [mapCenter]);

  // Periodic rain alert monitor with sound beeper
  useEffect(() => {
    if (soundOn && activeRainZones.length > 0) {
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = setInterval(() => {
        soundAlert.playRainAlertBeep();
      }, 15000); // Alert beep every 15s when active rain zones exist
    } else {
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    }
    return () => {
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    };
  }, [soundOn, activeRainZones]);

  // GeoJSON Styling for Pakistan's Official Edge
  const pakistanBorderStyle = {
    color: '#059669', // Emerald high-precision border
    weight: 3.5,
    opacity: 0.95,
    fillColor: '#10b981',
    fillOpacity: 0.08,
  };

  const tileUrls = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const attributions = {
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    satellite: 'Tiles &copy; Esri &mdash; Survey of Pakistan & PMD Integration',
  };

  // Weather stats counters
  const totalRaining = stations.filter((s) => s.isRaining).length;
  const coldCount = stations.filter((s) => s.tempCategory === 'cold' || s.tempCategory === 'severe_cold').length;
  const hotCount = stations.filter((s) => s.tempCategory === 'warm' || s.tempCategory === 'hot' || s.tempCategory === 'extreme_heat').length;

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Top Map View Area */}
      <div className="relative h-[700px] w-full overflow-hidden rounded-2xl border border-[#1e2d44] bg-[#080d19] shadow-2xl">
        {/* Leaflet Map */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          className={`h-full w-full ${mapStyle === 'osm' ? 'osm-dark-tiles' : ''}`}
          style={{ background: '#0a101d' }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url={tileUrls[mapStyle]}
            attribution={attributions[mapStyle]}
            maxZoom={19}
          />

          {/* OFFICIAL HIGH-PRECISION PAKISTAN BORDER HIGHLIGHT (INCLUDING JAMMU & KASHMIR, LADAKH, GILGIT-BALTISTAN) */}
          {layers.borders && geoData && (
            <GeoJSON
              data={geoData}
              style={pakistanBorderStyle}
              onEachFeature={(_feature, layer) => {
                layer.bindTooltip(
                  `<div class="p-1 text-xs">
                    <span class="font-bold text-emerald-400">Pakistan Sovereign Borders</span><br/>
                    <span class="text-slate-300">Including Gilgit-Baltistan, AJK, Jammu & Kashmir, and Ladakh</span>
                  </div>`,
                  { sticky: true },
                );
              }}
            />
          )}

          {/* ACTIVE RAIN RED FENCE (Red fencing zone with pulse animation & sound alert) */}
          {layers.rainFences &&
            stations
              .filter((st) => st.isRaining)
              .map((st) => (
                <div key={`rain-fence-${st.id}`}>
                  {/* Outer animated red fence */}
                  <Circle
                    center={[st.lat, st.lng]}
                    radius={35000} // 35 km fencing perimeter
                    pathOptions={{
                      className: 'rain-fence-pulse',
                      color: '#ef4444',
                      fillColor: '#b91c1c',
                      fillOpacity: 0.35,
                      weight: 4,
                    }}
                  >
                    <Popup>
                      <div className="p-2 text-xs text-slate-100">
                        <div className="flex items-center gap-1.5 font-bold text-rose-400">
                          <AlertTriangle className="h-4 w-4 text-rose-400" />
                          <span>ACTIVE RAIN RED FENCE</span>
                        </div>
                        <p className="mt-1 font-semibold text-white">{st.name} Weather Station</p>
                        <p className="text-slate-300">Rainfall: {st.precipitation.toFixed(1)} mm ({st.rainIntensity})</p>
                        <p className="text-slate-300">Status: Red Alert Perimeter Active</p>
                      </div>
                    </Popup>
                  </Circle>

                  {/* Core pulsing radar ping */}
                  <CircleMarker
                    center={[st.lat, st.lng]}
                    radius={8}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: '#ef4444',
                      fillOpacity: 0.95,
                      weight: 2,
                    }}
                  />
                </div>
              ))}

          {/* SRDI ZONES (Cold / Freezing visual perimeter overlay) */}
          {layers.coldZones &&
            stations
              .filter((st) => st.tempCategory === 'severe_cold' || st.tempCategory === 'cold')
              .map((st) => (
                <Circle
                  key={`cold-zone-${st.id}`}
                  center={[st.lat, st.lng]}
                  radius={22000}
                  pathOptions={{
                    color: '#38bdf8',
                    fillColor: '#0284c7',
                    fillOpacity: 0.16,
                    weight: 1.5,
                    dashArray: '4, 4',
                  }}
                >
                  <Tooltip sticky>
                    <div className="p-1 text-xs">
                      <span className="font-bold text-sky-300">❄️ Cold Zone: {st.name} ({st.temp}°C)</span>
                      <br />
                      <span className="text-slate-300">Condition: {st.condition}</span>
                    </div>
                  </Tooltip>
                </Circle>
              ))}

          {/* GARMI ZONES (Hot / Heatwave visual perimeter overlay) */}
          {layers.hotZones &&
            stations
              .filter((st) => st.tempCategory === 'hot' || st.tempCategory === 'extreme_heat')
              .map((st) => (
                <Circle
                  key={`hot-zone-${st.id}`}
                  center={[st.lat, st.lng]}
                  radius={22000}
                  pathOptions={{
                    color: '#f97316',
                    fillColor: '#ea580c',
                    fillOpacity: 0.18,
                    weight: 1.5,
                    dashArray: '4, 4',
                  }}
                >
                  <Tooltip sticky>
                    <div className="p-1 text-xs">
                      <span className="font-bold text-orange-400">🔥 Warm/Heat Zone: {st.name} ({st.temp}°C)</span>
                      <br />
                      <span className="text-slate-300">Condition: {st.condition}</span>
                    </div>
                  </Tooltip>
                </Circle>
              ))}

          {/* LIVE STATION WEATHER BADGES ON MAP */}
          {layers.weatherBadges &&
            stations.map((st) => (
              <Marker
                key={st.id}
                position={[st.lat, st.lng]}
                icon={createWeatherMarkerIcon(st)}
              >
                <Popup>
                  <div className="w-64 p-1.5 text-xs text-slate-200">
                    <div className="flex items-center justify-between border-b border-[#1e2f47] pb-1.5">
                      <div>
                        <span className="font-bold text-sky-400">{st.name}</span>
                        <span className="ml-1 text-[10px] text-slate-400">({st.region})</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        st.isRaining ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {st.isRaining ? '🌧️ RAINING' : 'LIVE'}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Weather:</span>
                        <span className="font-semibold text-slate-100">{st.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Temperature:</span>
                        <span className="font-bold text-sky-400 text-sm">{st.temp}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Climate Status:</span>
                        <span className="capitalize font-medium text-slate-200">
                          {st.tempCategory.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Precipitation:</span>
                        <span className={st.precipitation > 0 ? 'font-bold text-rose-400' : 'text-slate-300'}>
                          {st.precipitation.toFixed(1)} mm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Relative Humidity:</span>
                        <span className="text-slate-200">{st.humidity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wind Velocity:</span>
                        <span className="text-slate-200">{st.windSpeed} km/h</span>
                      </div>

                      {st.alertText && (
                        <div className="mt-2 rounded-lg bg-rose-500/20 p-2 text-center text-[11px] font-bold text-rose-300 border border-rose-500/40">
                          ⚠️ {st.alertText}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Top-Left Search Bar on Map */}
        <div className="absolute left-4 top-4 z-[1000] flex w-80 items-center gap-2 rounded-xl border border-[#233552] bg-[#0c1626]/90 px-3 py-2 text-sm text-slate-200 shadow-xl backdrop-blur-md">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Pakistan (Srinagar, Lahore, Skardu...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                const found = PAKISTAN_CITIES.find((c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
                );
                if (found) {
                  setMapCenter([found.lat, found.lng]);
                  setMapZoom(9);
                }
              }
            }}
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Top-Right Tools: Sound Beeper, Refresh, Basemap */}
        <div className="absolute right-4 top-4 z-[1000] flex items-center gap-2">
          {/* Audio Alert Toggle */}
          <button
            onClick={() => {
              const res = soundAlert.toggleSound();
              setSoundOn(res);
            }}
            title={soundOn ? 'Sound Alert Beeps Enabled' : 'Sound Alert Muted'}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xl backdrop-blur-md transition ${
              soundOn
                ? 'border-rose-500/50 bg-rose-950/80 text-rose-300 animate-pulse'
                : 'border-[#233552] bg-[#0c1626]/90 text-slate-400 hover:text-slate-200'
            }`}
          >
            {soundOn ? <Volume2 className="h-4 w-4 text-rose-400" /> : <VolumeX className="h-4 w-4" />}
            <span>{soundOn ? 'Rain Beep: ON' : 'Beep: Muted'}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={refreshAllWeather}
            title="Refresh Live Data"
            className="flex items-center gap-1.5 rounded-xl border border-[#233552] bg-[#0c1626]/90 px-3 py-2 text-xs font-medium text-slate-200 shadow-xl backdrop-blur-md hover:bg-[#15243d]"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync PMD</span>
          </button>

          {/* Basemap Switcher */}
          <div className="flex items-center gap-2 rounded-xl border border-[#233552] bg-[#0c1626]/90 px-3 py-2 text-xs text-slate-200 shadow-xl backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value as any)}
              className="cursor-pointer bg-transparent font-medium text-slate-200 focus:outline-none"
            >
              <option value="osm" className="bg-[#0c1626] text-slate-200">OpenStreetMap (Dark Mode)</option>
              <option value="satellite" className="bg-[#0c1626] text-slate-200">Satellite (Esri Imagery)</option>
            </select>
          </div>
        </div>

        {/* Left Map Controls */}
        <div className="absolute left-4 top-16 z-[1000] flex flex-col gap-1 rounded-xl border border-[#233552] bg-[#0c1626]/90 p-1 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-[#1a2942] hover:text-white"
            title="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMapZoom((z) => Math.max(z - 1, 4))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-[#1a2942] hover:text-white"
            title="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="my-0.5 h-px bg-[#233552]" />
          <button
            onClick={() => {
              setMapCenter([30.3753, 69.3451]);
              setMapZoom(6);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-[#1a2942] hover:text-white"
            title="Reset to Pakistan Overview"
          >
            <Crosshair className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-[#1a2942] hover:text-white"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setMapCenter([33.6844, 73.0479]);
              setMapZoom(8);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-[#1a2942] hover:text-white"
            title="Center Islamabad"
          >
            <Navigation className="h-3.5 w-3.5 rotate-45 text-emerald-400" />
          </button>
        </div>

        {/* Floating Layer Toggles & Live Weather Stats */}
        {showLayers && (
          <div className="absolute left-16 top-16 z-[1000] w-72 rounded-2xl border border-[#233552] bg-[#0c1626]/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#1e2f47] pb-2">
              <span className="text-xs font-semibold text-slate-200">Weather Intelligence Layers</span>
              <button
                onClick={() => setShowLayers(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex cursor-pointer items-center gap-2.5 text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.borders}
                  onChange={(e) => setLayers({ ...layers, borders: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
                <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span>Pakistan National Borders</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.weatherBadges}
                  onChange={(e) => setLayers({ ...layers, weatherBadges: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
                <Thermometer className="h-3.5 w-3.5 text-sky-400" />
                <span>Live Weather Station Badges</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.rainFences}
                  onChange={(e) => setLayers({ ...layers, rainFences: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
                <CloudRain className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-semibold text-rose-300">Active Rain Red Fence (Beep)</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.coldZones}
                  onChange={(e) => setLayers({ ...layers, coldZones: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                />
                <Snowflake className="h-3.5 w-3.5 text-cyan-400" />
                <span>Srdi Zones (&le; 14°C)</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={layers.hotZones}
                  onChange={(e) => setLayers({ ...layers, hotZones: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Garmi Zones (&ge; 26°C)</span>
              </label>
            </div>

            {/* Quick Summary Counts */}
            <div className="mt-3 border-t border-[#1e2f47] pt-2.5 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Active Rain Fences:</span>
                <span className={totalRaining > 0 ? 'font-bold text-rose-400 animate-pulse' : 'text-slate-400'}>
                  {totalRaining} Stations
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cold Zones (Srdi):</span>
                <span className="font-bold text-cyan-300">{coldCount} Stations</span>
              </div>
              <div className="flex justify-between">
                <span>Warm/Hot Zones (Garmi):</span>
                <span className="font-bold text-amber-300">{hotCount} Stations</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Coordinates & Scale Bar */}
        <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-3">
          <div className="rounded-lg border border-[#233552] bg-[#0c1626]/90 px-3 py-1.5 text-[11px] text-slate-300 shadow backdrop-blur-md">
            <span className="border-b-2 border-emerald-400 pb-0.5 font-mono">300 km</span>
          </div>
          <div className="rounded-lg border border-[#233552] bg-[#0c1626]/90 px-3 py-1.5 text-[11px] font-mono text-slate-300 shadow backdrop-blur-md">
            Lat: {mapCenter[0].toFixed(4)}° N &nbsp; Lon: {mapCenter[1].toFixed(4)}° E &nbsp; Zoom: {mapZoom}
          </div>
        </div>
      </div>

      {/* Bottom Live Weather Cards Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Rain Alert Monitor */}
        <div className={`rounded-2xl border p-4 shadow-xl backdrop-blur-md ${
          activeRainZones.length > 0
            ? 'border-rose-500/60 bg-rose-950/40 shadow-rose-950/50'
            : 'border-[#1e2d44] bg-[#0b1322]/80'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className={`h-4 w-4 ${activeRainZones.length > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
              <p className="text-xs font-semibold text-slate-200">Active Rain Fencing Radar</p>
            </div>
            {activeRainZones.length > 0 ? (
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 animate-pulse">
                RED ALERT
              </span>
            ) : (
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Clear Sky
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-300">
            {activeRainZones.length > 0 ? (
              <div className="space-y-1.5">
                {activeRainZones.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setMapCenter([r.lat, r.lng]);
                      setMapZoom(9);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-lg bg-rose-900/30 p-1.5 hover:bg-rose-900/50"
                  >
                    <span className="font-bold text-rose-300">{r.name}</span>
                    <span className="text-[11px] text-rose-200">{r.precipitation.toFixed(1)} mm ({r.rainIntensity})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                No active severe rain fence detected across Pakistan stations.
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Srdi Tracker (Cold & Freezing Stations) */}
        <div className="rounded-2xl border border-[#1e2d44] bg-[#0b1322]/80 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-cyan-400" />
              <p className="text-xs font-semibold text-slate-200">Srdi (Cold) Frontier</p>
            </div>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
              {coldCount} Active
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            {stations
              .filter((s) => s.tempCategory === 'severe_cold' || s.tempCategory === 'cold')
              .slice(0, 3)
              .map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setMapCenter([s.lat, s.lng]);
                    setMapZoom(9);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-lg bg-[#080d19] p-1.5 hover:bg-[#152a47]"
                >
                  <span className="font-medium text-slate-200">{s.name} ({s.region})</span>
                  <span className="font-bold text-cyan-400">{s.temp}°C</span>
                </div>
              ))}
          </div>
        </div>

        {/* Card 3: Garmi Tracker (Warm & Hot Stations) */}
        <div className="rounded-2xl border border-[#1e2d44] bg-[#0b1322]/80 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-semibold text-slate-200">Garmi (Hot) Frontier</p>
            </div>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              {hotCount} Active
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            {stations
              .filter((s) => s.tempCategory === 'warm' || s.tempCategory === 'hot' || s.tempCategory === 'extreme_heat')
              .slice(0, 3)
              .map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setMapCenter([s.lat, s.lng]);
                    setMapZoom(9);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-lg bg-[#080d19] p-1.5 hover:bg-[#152a47]"
                >
                  <span className="font-medium text-slate-200">{s.name} ({s.region})</span>
                  <span className="font-bold text-amber-400">{s.temp}°C</span>
                </div>
              ))}
          </div>
        </div>

        {/* Card 4: Viewport Weather Realtime */}
        <div className="rounded-2xl border border-[#1e2d44] bg-[#0b1322]/80 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-semibold text-slate-200">Center Realtime Weather</p>
            </div>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
              LIVE
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Temperature:</span>
              <span className="font-bold text-sky-400">{centerWeather ? `${centerWeather.temperature}°C` : '22.0°C'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Humidity & Wind:</span>
              <span>{centerWeather ? `${centerWeather.humidity}% · ${centerWeather.windSpeed} km/h` : '55% · 12 km/h'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Precipitation:</span>
              <span className={centerWeather && centerWeather.precipitation > 0 ? 'font-bold text-rose-400' : 'text-slate-300'}>
                {centerWeather ? `${centerWeather.precipitation} mm` : '0.0 mm'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
