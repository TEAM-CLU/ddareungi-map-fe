import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { OFF_ROUTE_CONFIG } from '@/features/navigation/model/navigation.constants';
import { Coordinate } from '@/features/routing/model/routing.types';

export const getMinDistanceInWindow = (
  myPosition: Coordinate,
  intervalCoordinateList: Coordinate[],
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
