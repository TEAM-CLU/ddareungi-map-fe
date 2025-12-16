import { useState, useEffect, useCallback } from 'react';
import { DragEndParams } from 'react-native-draggable-flatlist';
import { useRouteStore } from '../stores/useRouteStore';
import { RouteItem, RouteType, Waypoint } from '../model/routing.types';

export const useRouteInput = () => {
  const {
    routeType,
    setRouteType,
    start,
    end,
    waypoints,
    setStart,
    setEnd,
    removeWaypoint,
    updateRouteFromDrag,
    getItems,
  } = useRouteStore();

  const [isProcessing, setIsProcessing] = useState(false);

  const items = getItems();

  // 2. 드래그 종료 핸들러
  const handleDragEnd = useCallback(
    ({ data }: DragEndParams<RouteItem>) => {
      if (data.length < 2) return;

      setIsProcessing(true);

      setTimeout(() => {
        const newStart = data[0].place;
        const newEnd = data[data.length - 1].place;
        const middleItems = data.slice(1, -1);

        const newWaypoints: Waypoint[] = middleItems
          .filter(item => item.place !== null)
          .map((item, index) => ({
            waypointKey: item.key.includes('waypoint')
              ? item.key
              : `waypoint-new-${Date.now()}-${index}`,
            place: item.place!,
          }));

        updateRouteFromDrag(newStart, newEnd, newWaypoints);

        requestAnimationFrame(() => {
          setIsProcessing(false);
        });
      }, 300);
    },
    [updateRouteFromDrag],
  );

  // 3️. 단순 스왑
  const handleSwap = useCallback(() => {
    if (routeType === RouteType.LOOP) return;

    const temp = start;
    setStart(end);
    setEnd(temp);
  }, [routeType, start, end, setStart, setEnd]);

  // 4️. 경유지 삭제
  const handleRemove = useCallback(
    (key: string) => {
      if (routeType === RouteType.LOOP && waypoints.length <= 1) return;
      removeWaypoint(key);
    },
    [routeType, waypoints.length, removeWaypoint],
  );

  const hasWaypoints = waypoints.length > 0;

  useEffect(() => {
    if (!start || !end) return;
    if (start?.address === end?.address && routeType !== RouteType.LOOP) {
      setRouteType(RouteType.LOOP);
    }
  }, [start, end, routeType, setRouteType]);

  return {
    items,
    isProcessing,
    routeType,
    start,
    end,
    hasWaypoints,
    handleDragEnd,
    handleSwap,
    handleRemove,
  };
};
