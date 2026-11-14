import {
  CloudSun,
  Settings,
} from 'lucide-react';
import type { NavGroup, NavItem } from '@/types';

export const navigationGroups: NavGroup[] = [
  {
    label: 'Pakistan Weather OSINT',
    items: [
      { label: 'Live Weather Map', path: '/', icon: CloudSun, end: true },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', path: '/settings', icon: Settings }],
  },
];

export const allNavigationItems: NavItem[] = navigationGroups.flatMap(
  (group) => group.items,
);
