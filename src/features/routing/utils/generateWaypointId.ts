import { RoutePoint } from '../model/routing.types';
import { ROUTE_CONSTANTS } from '../model/routing.constants';

// 새로운 waypoint ID 생성 함수
export const generateNextWaypointId = (
  existingWaypoints: RoutePoint[],
): string => {
  const existingIds = existingWaypoints.map(w => parseInt(w.id.split('-')[1]));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `${ROUTE_CONSTANTS.DEFAULT_WAYPOINT_ID_PREFIX}${maxId + 1}`;
};
