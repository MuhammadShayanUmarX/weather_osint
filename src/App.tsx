import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AirQuality } from '@/pages/AirQuality';
import { Drought } from '@/pages/Drought';
import { EnvironmentalChange } from '@/pages/EnvironmentalChange';
import { Fires } from '@/pages/Fires';
import { Floods } from '@/pages/Floods';
import { GeographicAnalysis } from '@/pages/GeographicAnalysis';
import { NotFound } from '@/pages/NotFound';
import { Overview } from '@/pages/Overview';
import { Rainfall } from '@/pages/Rainfall';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Weather } from '@/pages/Weather';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Overview />} />
        <Route path="weather" element={<Weather />} />
        <Route path="rainfall" element={<Rainfall />} />
        <Route path="floods" element={<Floods />} />
        <Route path="air-quality" element={<AirQuality />} />
        <Route path="environmental-change" element={<EnvironmentalChange />} />
        <Route path="drought" element={<Drought />} />
        <Route path="fires" element={<Fires />} />
        <Route path="geographic-analysis" element={<GeographicAnalysis />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
