import { useState, useEffect, useCallback } from 'react';
import { DragEndParams } from 'react-native-draggable-flatlist';
import { useRouteStore } from '../stores/useRouteStore';
import { RouteItem, RouteType, Waypoint } from '../model/routing.types';

export const useRouteInput = () => {
  const {
    routeType,
    start,
    end,
    waypoints,
    setStart,
    setEnd,
    removeWaypoint,
    updateRouteFromDrag,
  } = useRouteStore();

  const [items, setItems] = useState<RouteItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Store -> 로컬 리스트 동기화
  useEffect(() => {
    if (isProcessing) return;

    const newItems: RouteItem[] = [];

    // 출발지
    newItems.push({
      key: 'fixed-start',
      place: start,
    });

    // 경유지
    waypoints.forEach(wp => {
      newItems.push({
        key: wp.waypointKey,
        place: wp.place,
      });
    });

    // 도착지
    newItems.push({
      key: 'fixed-end',
      place: end,
    });

    const uniqueItems = newItems.map((item, index) => ({
      ...item,
      key: item.key.startsWith('fixed') ? `${item.key}-${index}` : item.key,
    }));

    setItems(uniqueItems);
  }, [start, end, waypoints, isProcessing]);

  // 2. 드래그 종료 핸들러
  const handleDragEnd = useCallback(
    ({ data }: DragEndParams<RouteItem>) => {
      if (data.length < 2) return;

      setIsProcessing(true);
      setItems(data);

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
