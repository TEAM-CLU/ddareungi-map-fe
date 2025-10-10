import { RouteType } from '../model/routing.types';
import { ROUTE_CONSTANTS } from '../model/routing.constants';

// waypoint 삭제 가능 여부 확인 함수
export const canRemoveWaypoint = (
  routeType: RouteType,
  waypointsLength: number,
): boolean => {
  if (routeType === RouteType.LOOP && waypointsLength <= 1) {
    return false;
  }
  return true;
};

// waypoint 추가 가능 여부 확인 함수
export const canAddWaypoint = (waypointsLength: number): boolean => {
  return waypointsLength < ROUTE_CONSTANTS.MAX_WAYPOINTS;
};
