// ---------------- 헬퍼 함수 ------------------

import { RouteState, RouteType, Waypoint } from '../model/routing.types';

/*
  빈 경유지 객체 생성
 */
export const createEmptyWaypoint = (index = 0): Waypoint => ({
  waypointKey: `waypoint-${index}`,
  place: null,
});

/*
  경유지 배열의 키를 0부터 순차적으로 재할당
*/
export const reindexWaypoints = (waypoints: Waypoint[]): Waypoint[] =>
  waypoints.map((wp, idx) => ({ ...wp, waypointKey: `waypoint-${idx}` }));

/*
  LOOP 모드: 기본 경유지 1개
  CONSTANT 모드: 경유지 없음
*/
export const getDefaultWaypoints = (routeType: RouteType): Waypoint[] =>
  routeType === RouteType.LOOP ? [createEmptyWaypoint(0)] : [];

/*
  상태 업데이트 시 기존 검색된 경로를 무효화
  입력값 (출발/도착 등) 변경 시 기존 검색된 경로 유효하지 않음
 */
export const withRouteInvalidation = (updates: Partial<RouteState>) => ({
  ...updates,
  selectedRouteData: null,
});
