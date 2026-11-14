import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { buildRegionDemo } from '@/data/demo';

export function useRegionDemo() {
  const { region } = useApp();
  const demo = useMemo(() => buildRegionDemo(region), [region]);
  return { region, demo };
}
