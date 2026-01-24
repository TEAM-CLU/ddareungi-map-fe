import { Coordinates } from '@/features/map/model/map.types';
import { OFF_ROUTE_CONFIG } from '@/features/navigation/model/navigation.constants';
import { clamp } from '@/shared/utils/clamp';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

export const getMinDistanceInWindow = (
  myPosition: Coordinates,
  intervalCoordinateList: Coordinates[],
  centerIdx: number,
) => {
  if (intervalCoordinateList.length === 0) return Number.POSITIVE_INFINITY;

  const startIdx = clamp(
    centerIdx - OFF_ROUTE_CONFIG.CLOSEST_INDEX_WINDOW_SIZE,
    0,
    intervalCoordinateList.length - 1,
  );
  const endIdx = clamp(
    centerIdx + OFF_ROUTE_CONFIG.CLOSEST_INDEX_WINDOW_SIZE,
    0,
    intervalCoordinateList.length - 1,
  );
  let minDistance = Number.POSITIVE_INFINITY;

  for (let i = startIdx; i <= endIdx; i++) {
    const measuredDistance = getDistanceBetweenCoords(
      myPosition,
      intervalCoordinateList[i],
    );
    if (measuredDistance < minDistance) minDistance = measuredDistance;
  }

  return minDistance;
};
