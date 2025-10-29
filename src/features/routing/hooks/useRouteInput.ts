import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import { RoutePoint, RouteType } from '../model/routing.types';
import { useCallback, useEffect, useState } from 'react';
import {
  createDefaultWaypoint,
  createInitialWaypoints,
} from '../model/routing.data';
import { ROUTE_CONSTANTS } from '../model/routing.constants';
import { canAddWaypoint, canRemoveWaypoint } from '../utils/validateWaypoint';
import { generateNextWaypointId } from '../utils/generateWaypointId';

interface UseRouteInputProps {
  routeType: RouteType;
  routeData?: Record<string, AutocompleteResult>;
  onRouteDataComplete?: (isComplete: boolean) => void;
}

export const useRouteInput = ({
  routeType,
  routeData = {},
  onRouteDataComplete,
}: UseRouteInputProps) => {
  const [internalRouteData, setInternalRouteData] = useState(routeData);
  const [waypoints, setWaypoints] = useState<RoutePoint[]>(
    createInitialWaypoints(routeType, routeData),
  );

  // 외부 routeData 동기화
  useEffect(() => {
    setInternalRouteData(routeData);
  }, [routeData]);

  // routeType 변경 시 waypoints 초기화 - LOOP <-> CONSTANT 전환했을 때 경유지 내용 초기화
  useEffect(() => {
    if (routeType === RouteType.LOOP && waypoints.length === 0) {
      setWaypoints([createDefaultWaypoint('waypoint-1')]);
    } else if (routeType === RouteType.CONSTANT && waypoints.length > 0) {
      setWaypoints([]);
    }
  }, [routeType]);

  // 모든 라우트 필드 채워져 있는지 확인 - 채우기 전이면 searchOverlay, 다 채우면 라우팅 결과 보여줌 
  useEffect(() => {
    const isStartSet =
      !!internalRouteData[ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.START];
    const isEndSet =
      !!internalRouteData[ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.END];

    const activeWaypointIds = waypoints.map(w => w.id);
    const filledWaypointCount = activeWaypointIds.filter(
      id => !!internalRouteData[id],
    ).length;
    const allWaypointsFilled =
      filledWaypointCount === activeWaypointIds.length &&
      activeWaypointIds.length > 0;

    let isComplete = false;
    if (routeType === RouteType.CONSTANT) {
      isComplete =
        isStartSet &&
        isEndSet &&
        (activeWaypointIds.length === 0 || allWaypointsFilled);
    } else if (routeType === RouteType.LOOP) {
      isComplete =
        isStartSet && activeWaypointIds.length >= 1 && allWaypointsFilled;
    }

    onRouteDataComplete?.(isComplete);
  }, [internalRouteData, routeType, waypoints]);

  // 핸들러 함수
    const handleAddWaypointPress = useCallback(() => {
    if (canAddWaypoint(waypoints.length)) {
      const newWaypointId = generateNextWaypointId(waypoints);
      const newWaypoint = createDefaultWaypoint(newWaypointId);
      setWaypoints(prev => [...prev, newWaypoint]);
    }
  }, [waypoints]);

  const handleRemoveWaypointPress = useCallback(
    (waypointId: string) => {
      if (!canRemoveWaypoint(routeType, waypoints.length)) return;
      setWaypoints(prev => prev.filter(w => w.id !== waypointId));
    },
    [routeType, waypoints.length],
  );

  const resetWaypoints = useCallback(() => {
    setWaypoints(createInitialWaypoints(routeType));
  }, [routeType]);

  return {
    internalRouteData,
    setInternalRouteData,
    waypoints,
    setWaypoints,
    handleAddWaypointPress,
    handleRemoveWaypointPress,
    resetWaypoints,
  };
};
