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
import { Alert } from 'react-native';

interface UseRouteInputProps {
  routeType: RouteType;
  routeData?: Record<string, AutocompleteResult>;
  onRouteDataComplete?: (isComplete: boolean) => void;
  setRouteData?: React.Dispatch<
    React.SetStateAction<{ [key: string]: AutocompleteResult }>
  >; // 외부 상태 업데이트를 위한 callback
}

export const useRouteInput = ({
  routeType,
  routeData = {},
  onRouteDataComplete,
  setRouteData,
}: UseRouteInputProps) => {
  const [internalRouteData, setInternalRouteData] = useState(routeData);
  const [waypoints, setWaypoints] = useState<RoutePoint[]>(
    createInitialWaypoints(routeType, routeData),
  );

  // 외부 routeData 동기화 및 waypoints 업데이트
  useEffect(() => {
    if (routeData) {
      setInternalRouteData(prev => ({
        ...prev,
        ...routeData,
      }));

      // routeData에서 경유지 키들을 찾아서 waypoints 업데이트
      const waypointKeys = Object.keys(routeData).filter(key =>
        key.startsWith('waypoint-'),
      );

      if (waypointKeys.length > 0) {
        const newWaypoints = waypointKeys.map(key => ({
          id: key,
          placeholder: ROUTE_CONSTANTS.DEFAULT_PLACEHOLDERS.WAYPOINT,
          value: routeData[key]?.name || '',
          type: 'waypoint' as const,
        }));
        setWaypoints(newWaypoints);
      } else if (routeType === RouteType.LOOP && waypoints.length === 0) {
        // LOOP 모드에서 경유지가 없으면 기본 경유지 생성
        setWaypoints([createDefaultWaypoint('waypoint-1')]);
      }
    }
  }, [routeData]);

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

      setWaypoints(prev => {
        const newWaypoints = [...prev, newWaypoint];
        return newWaypoints;
      });
    } else {
      Alert.alert('경유지는 최대 3개까지 추가할 수 있습니다.');
    }
  }, [waypoints]);

  const handleRemoveWaypointPress = useCallback(
    (waypointId: string) => {
      if (!canRemoveWaypoint(routeType, waypoints.length)) return;

      // waypoints 배열에서 제거
      setWaypoints(prev => prev.filter(w => w.id !== waypointId));

      // internalRouteData에서도 해당 경유지 데이터 제거
      setInternalRouteData(prev => {
        const newData = { ...prev };
        delete newData[waypointId];
        return newData;
      });
    },
    [routeType, waypoints.length],
  );

  const resetWaypoints = useCallback(() => {
    setWaypoints(createInitialWaypoints(routeType));
  }, [routeType]);

  // LOOP 모드에서 출발지/도착지 동기화 함수
  const syncStartEndInLoopMode = useCallback(
    (newData: Record<string, AutocompleteResult>) => {
      if (routeType === RouteType.LOOP) {
        const updatedData = { ...newData };

        // 출발지가 변경되면 도착지도 같이 변경
        if (newData.start) {
          updatedData.end = newData.start;
        }
        // 도착지가 변경되면 출발지도 같이 변경
        else if (newData.end) {
          updatedData.start = newData.end;
        }
        return updatedData;
      }
      return newData;
    },
    [routeType],
  );

  return {
    internalRouteData,
    setInternalRouteData,
    waypoints,
    setWaypoints,
    handleAddWaypointPress,
    handleRemoveWaypointPress,
    resetWaypoints,
    syncStartEndInLoopMode,
  };
};
