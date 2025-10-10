import { RoutePoint, RouteType } from './routing.types';
import { ROUTE_CONSTANTS } from './routing.constants';

// 기본 waypoint 생성 함수
export const createDefaultWaypoint = (id: string): RoutePoint => ({
  id,
  placeholder: ROUTE_CONSTANTS.DEFAULT_PLACEHOLDERS.WAYPOINT,
  value: '',
  type: 'waypoint',
});

// 기본 출발지 포인트 생성 함수
export const createStartPoint = (value: string = ''): RoutePoint => ({
  id: ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.START,
  placeholder: ROUTE_CONSTANTS.DEFAULT_PLACEHOLDERS.START,
  value,
  type: 'start',
});

// 기본 도착지 포인트 생성 함수
export const createEndPoint = (value: string = ''): RoutePoint => ({
  id: ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.END,
  placeholder: ROUTE_CONSTANTS.DEFAULT_PLACEHOLDERS.END,
  value,
  type: 'end',
});

// RouteType에 따른 초기 waypoints 생성 함수
export const createInitialWaypoints = (
  routeType: RouteType,
  routeData: any = {},
): RoutePoint[] => {
  if (routeType === RouteType.LOOP) {
    return [
      {
        id: 'waypoint-1',
        placeholder: ROUTE_CONSTANTS.DEFAULT_PLACEHOLDERS.WAYPOINT,
        value: routeData['waypoint-1']?.name || '',
        type: 'waypoint',
      },
    ];
  }
  return [];
};
