import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DragEndParams } from 'react-native-draggable-flatlist';
import { useRouteStore } from '../stores/useRouteStore';
import { RouteItem, RouteType, Waypoint } from '../model/routing.types';
import { useShallow } from 'zustand/react/shallow';
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
  } = useRouteStore(
    useShallow(state => ({
      routeType: state.routeType,
      setRouteType: state.setRouteType,
      start: state.start,
      end: state.end,
      waypoints: state.waypoints,
      setStart: state.setStart,
      setEnd: state.setEnd,
      removeWaypoint: state.removeWaypoint,
      updateRouteFromDrag: state.updateRouteFromDrag,
      getItems: state.getItems,
    })),
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const dragCommitIdRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [localItems, setLocalItems] = useState<RouteItem[] | null>(null);

  const items = useMemo(() => getItems(), [getItems, start, end, waypoints]);
  const renderItems = isDragging && localItems ? localItems : items;
  const hasWaypoints = waypoints.length > 0;

  useEffect(() => {
    if (!start || !end) return;
    if (start?.address === end?.address && routeType !== RouteType.LOOP) {
      setRouteType(RouteType.LOOP);
    }
  }, [start, end, routeType, setRouteType]);

  const handleDragBegin = useCallback(() => {
    setLocalItems(items);
    setIsDragging(true);
  }, [items]);

  // 2. 드래그 종료 핸들러
  const handleDragEnd = useCallback(
    ({ data }: DragEndParams<RouteItem>) => {
      if (data.length < 2) return;

      setIsProcessing(true);
      dragCommitIdRef.current += 1;
      setLocalItems(data);

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
        setIsDragging(false);
        setLocalItems(null);
      });
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

  return {
    items: renderItems,
    isProcessing,
    routeType,
    start,
    end,
    hasWaypoints,
    handleDragBegin,
    handleDragEnd,
    handleSwap,
    handleRemove,
  };
};
