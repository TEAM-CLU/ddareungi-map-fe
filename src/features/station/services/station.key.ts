export const stationKeys = {
  root: ['station'] as const,
  list: () => [...stationKeys.root, 'list'] as const,
  mapArea: () => [...stationKeys.root, 'mapArea'] as const,
};
