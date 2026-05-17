export const stationKeys = {
  root: ['station'] as const,
  mapArea: (lat?: number, lng?: number, radius?: number) => [...stationKeys.root, 'mapArea', { lat, lng, radius }] as const,
  nearby: (lat?: number, lng?: number) => [...stationKeys.root, 'nearby', { lat, lng }] as const,
};
