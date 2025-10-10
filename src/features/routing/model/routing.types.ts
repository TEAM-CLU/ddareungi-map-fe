import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';

export enum RouteType {
  CONSTANT = 'constant',
  LOOP = 'loop',
}

export interface RoutePoint {
  id: string;
  placeholder: string;
  value: string;
  type: 'start' | 'waypoint' | 'end';
}

export type RouteData = { [key: string]: AutocompleteResult };
