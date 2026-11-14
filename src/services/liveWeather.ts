// Service to fetch live real-time weather from Open-Meteo across Pakistan

export interface LiveWeatherData {
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  precipitation: number;
  surfacePressure: number;
  windSpeed: number;
  weatherCode?: number;
  time: string;
}

export type TempCategory = 'severe_cold' | 'cold' | 'mild' | 'warm' | 'hot' | 'extreme_heat';

export interface PakistanStationWeather {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  tempCategory: TempCategory;
  isRaining: boolean;
  rainIntensity: 'none' | 'light' | 'moderate' | 'heavy';
  alertLevel: 'normal' | 'warning' | 'critical';
  alertText?: string;
}

// Comprehensive Meteorological Grid for Pakistan (including J&K, Gilgit-Baltistan, and Ladakh)
export const PAKISTAN_CITIES = [
  // Federal & Punjab
  { id: 'isb', name: 'Islamabad', region: 'ICT', lat: 33.6844, lng: 73.0479 },
  { id: 'rwp', name: 'Rawalpindi', region: 'Punjab', lat: 33.5651, lng: 73.0169 },
  { id: 'lhr', name: 'Lahore', region: 'Punjab', lat: 31.5497, lng: 74.3436 },
  { id: 'fsd', name: 'Faisalabad', region: 'Punjab', lat: 31.4504, lng: 73.135 },
  { id: 'mux', name: 'Multan', region: 'Punjab', lat: 30.1575, lng: 71.5249 },
  { id: 'skt', name: 'Sialkot', region: 'Punjab', lat: 32.4945, lng: 74.5229 },
  { id: 'bwp', name: 'Bahawalpur', region: 'Punjab', lat: 29.3544, lng: 71.6911 },

  // Sindh
  { id: 'khi', name: 'Karachi', region: 'Sindh', lat: 24.8607, lng: 67.0011 },
  { id: 'hyd', name: 'Hyderabad', region: 'Sindh', lat: 25.396, lng: 68.3578 },
  { id: 'suk', name: 'Sukkur', region: 'Sindh', lat: 27.7052, lng: 68.8574 },
  { id: 'lkn', name: 'Larkana', region: 'Sindh', lat: 27.5598, lng: 68.212 },
  { id: 'nwb', name: 'Nawabshah', region: 'Sindh', lat: 26.2483, lng: 68.4096 },

  // Khyber Pakhtunkhwa
  { id: 'pew', name: 'Peshawar', region: 'KP', lat: 34.0151, lng: 71.5249 },
  { id: 'abt', name: 'Abbottabad', region: 'KP', lat: 34.1688, lng: 73.2215 },
  { id: 'swa', name: 'Swat (Mingora)', region: 'KP', lat: 34.7717, lng: 72.3602 },
  { id: 'mrd', name: 'Mardan', region: 'KP', lat: 34.1989, lng: 72.0404 },
  { id: 'dik', name: 'D.I. Khan', region: 'KP', lat: 31.8327, lng: 70.9024 },

  // Balochistan
  { id: 'que', name: 'Quetta', region: 'Balochistan', lat: 30.1798, lng: 66.975 },
  { id: 'gwd', name: 'Gwadar', region: 'Balochistan', lat: 25.1216, lng: 62.3254 },
  { id: 'trb', name: 'Turbat', region: 'Balochistan', lat: 26.0031, lng: 63.0544 },
  { id: 'zrg', name: 'Ziarat', region: 'Balochistan', lat: 30.3824, lng: 67.7256 },
  { id: 'kzd', name: 'Khuzdar', region: 'Balochistan', lat: 27.8119, lng: 66.6177 },

  // Azad Jammu & Kashmir, Jammu, and Kashmir
  { id: 'mzd', name: 'Muzaffarabad', region: 'AJK', lat: 34.3705, lng: 73.4711 },
  { id: 'mrq', name: 'Mirpur', region: 'AJK', lat: 33.1484, lng: 73.7519 },
  { id: 'srn', name: 'Srinagar', region: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973 },
  { id: 'jmu', name: 'Jammu', region: 'Jammu & Kashmir', lat: 32.7266, lng: 74.857 },
  { id: 'anp', name: 'Anantnag', region: 'Jammu & Kashmir', lat: 33.7311, lng: 75.1522 },

  // Gilgit-Baltistan & Ladakh
  { id: 'gil', name: 'Gilgit', region: 'Gilgit-Baltistan', lat: 35.9221, lng: 74.3087 },
  { id: 'skd', name: 'Skardu', region: 'Gilgit-Baltistan', lat: 35.2971, lng: 75.6333 },
  { id: 'hnz', name: 'Hunza', region: 'Gilgit-Baltistan', lat: 36.3167, lng: 74.65 },
  { id: 'leh', name: 'Leh', region: 'Ladakh', lat: 34.1526, lng: 77.5771 },
  { id: 'krg', name: 'Kargil', region: 'Ladakh', lat: 34.5539, lng: 76.1349 },
];

export function categorizeTemperature(temp: number): TempCategory {
  if (temp <= 0) return 'severe_cold'; // Freezing/Snow
  if (temp <= 14) return 'cold';        // Srdi (Chilly/Cold)
  if (temp <= 25) return 'mild';        // Motadil / Pleasant
  if (temp <= 34) return 'warm';        // Garmi shuru
  if (temp <= 41) return 'hot';         // Shadeed Garmi
  return 'extreme_heat';                // Severe Heatwave
}

export function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Fog / Haze';
  if (code <= 55) return 'Light Drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 75) return 'Snow';
  if (code <= 82) return 'Heavy Rain Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Clear';
}

export async function fetchLiveWeather(lat: number, lon: number): Promise<LiveWeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,wind_speed_10m,weather_code`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      apparentTemperature: data.current.apparent_temperature,
      precipitation: data.current.precipitation,
      surfacePressure: data.current.surface_pressure,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      time: data.current.time,
    };
  } catch (error) {
    console.warn('Could not fetch live weather:', error);
    return null;
  }
}

export async function fetchPakistanStations(): Promise<PakistanStationWeather[]> {
  try {
    const lats = PAKISTAN_CITIES.map((c) => c.lat).join(',');
    const lons = PAKISTAN_CITIES.map((c) => c.lng).join(',');
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code`,
    );
    if (!res.ok) throw new Error('PMD/Open-Meteo batch request failed');
    const data = await res.json();
    const results = Array.isArray(data) ? data : [data];

    return PAKISTAN_CITIES.map((city, idx) => {
      const item = results[idx]?.current;
      const temp = item?.temperature_2m ?? 20;
      const humidity = item?.relative_humidity_2m ?? 55;
      const windSpeed = item?.wind_speed_10m ?? 12;
      const precip = item?.precipitation ?? 0;
      const code = item?.weather_code ?? 0;
      const condition = getWeatherCondition(code);

      const tempCategory = categorizeTemperature(temp);

      // Rain condition detection: either precipitation > 0.1 mm or weather code indicating rain/thunderstorm
      const isRaining = precip > 0.05 || (code >= 51 && code <= 67) || (code >= 80 && code <= 99);
      let rainIntensity: 'none' | 'light' | 'moderate' | 'heavy' = 'none';
      if (isRaining) {
        if (precip > 5 || code >= 95 || code === 82 || code === 65) {
          rainIntensity = 'heavy';
        } else if (precip > 1.5 || code === 63 || code === 81) {
          rainIntensity = 'moderate';
        } else {
          rainIntensity = 'light';
        }
      }

      let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
      let alertText: string | undefined = undefined;

      if (isRaining && (rainIntensity === 'heavy' || rainIntensity === 'moderate')) {
        alertLevel = 'critical';
        alertText = `Active ${rainIntensity.toUpperCase()} Rain Alert (${precip.toFixed(1)} mm)`;
      } else if (temp <= 0) {
        alertLevel = 'warning';
        alertText = 'Freezing Temperature / Glacial Frost';
      } else if (temp >= 40) {
        alertLevel = 'critical';
        alertText = 'Extreme Heatwave Warning (>40°C)';
      } else if (windSpeed > 35) {
        alertLevel = 'warning';
        alertText = 'High Wind Gale Advisory';
      }

      return {
        id: city.id,
        name: city.name,
        region: city.region,
        lat: city.lat,
        lng: city.lng,
        temp,
        humidity,
        windSpeed,
        precipitation: precip,
        condition,
        tempCategory,
        isRaining,
        rainIntensity,
        alertLevel,
        alertText,
      };
    });
  } catch {
    // Offline fallback
    return PAKISTAN_CITIES.map((city) => {
      const temp =
        city.region === 'Gilgit-Baltistan' || city.region === 'Ladakh'
          ? 2
          : city.region === 'Sindh'
          ? 29
          : 22;
      return {
        id: city.id,
        name: city.name,
        region: city.region,
        lat: city.lat,
        lng: city.lng,
        temp,
        humidity: 50,
        windSpeed: 10,
        precipitation: 0,
        condition: 'Clear Sky',
        tempCategory: categorizeTemperature(temp),
        isRaining: false,
        rainIntensity: 'none',
        alertLevel: 'normal',
      };
    });
  }
}
