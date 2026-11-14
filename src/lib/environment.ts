import type { StatusTone } from '@/types';

export function aqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for sensitive groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very unhealthy';
  return 'Hazardous';
}

export function aqiTone(aqi: number): StatusTone {
  if (aqi <= 50) return 'nominal';
  if (aqi <= 100) return 'watch';
  if (aqi <= 150) return 'warning';
  return 'critical';
}

export function riskLabel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'Elevated';
  if (score >= 40) return 'Guarded';
  return 'Low';
}

export function riskTone(score: number): StatusTone {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'watch';
  return 'nominal';
}

export function spiLabel(spi: number): string {
  if (spi <= -2) return 'Extreme drought';
  if (spi <= -1.5) return 'Severe drought';
  if (spi <= -1) return 'Moderate drought';
  if (spi < 1) return 'Near normal';
  return 'Wet';
}

export function spiTone(spi: number): StatusTone {
  if (spi <= -2) return 'critical';
  if (spi <= -1.5) return 'warning';
  if (spi <= -1) return 'watch';
  return 'nominal';
}

export function windDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16] ?? 'N';
}

export function conditionFromSignals(temperature: number, rain: number): string {
  if (rain > 60) return 'Heavy rain';
  if (rain > 25) return 'Light rain';
  if (temperature > 33) return 'Hot and hazy';
  if (temperature < 10) return 'Cold and clear';
  if (rain > 8) return 'Overcast';
  return 'Partly cloudy';
}
