import { useEffect } from 'react';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useLocationStore } from '@/features/location/stores/useLocationStore';
import { useLocationMessenger } from '@/features/location/hooks/useLocationMessenger';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useRoutingMessenger } from '@/features/routing/hooks/useRoutingMessenger';
import { useBookmarkMessenger } from '@/features/bookmark/hooks/useBookmarkMessenger';
import { useShallow } from 'zustand/react/shallow';
import {
  formatDistanceAdaptiveText,
  formatTimeHMText,
  formatTimeMinutesNumber,
  formatTimeRangeText,
  getRouteCategoryText,
} from '@/shared/utils/formatting';
import { StaticPathData } from '@/shared/model/map.webview.types';
import { Route, RouteType, Waypoint } from '../model/routing.types';

interface UseSelectedRouteDetailModalParams {
  selectedRouteData: Route;
  startAddress: string | undefined;
  endAddress: string | undefined;
  waypoints?: Waypoint[];
  baseTime?: Date;
}

export const useSelectedRouteDetailModal = ({
  selectedRouteData,
  startAddress,
  endAddress,
  waypoints,
  baseTime = new Date(),
}: UseSelectedRouteDetailModalParams) => {
  const { isNavigationMode, routeId, setIsNavigationMode, setRouteId } =
    useNavigationStore(
      useShallow(state => ({
        isNavigationMode: state.isNavigationMode,
        routeId: state.routeId,
        setIsNavigationMode: state.setIsNavigationMode,
        setRouteId: state.setRouteId,
      })),
    );
  const { setShowSelectedRouteDetailModal, setShowNavigationStartModal } =
    useModalStore(
      useShallow(state => ({
        setShowSelectedRouteDetailModal: state.setShowSelectedRouteDetailModal,
        setShowNavigationStartModal: state.setShowNavigationStartModal,
      })),
    );
  const { totalCaloriesBurned, totalTrees, routeType, prevScreen } =
    useRouteStore(
      useShallow(state => ({
        totalCaloriesBurned: state.totalCaloriesBurned,
        totalTrees: state.totalTrees,
        routeType: state.routeType,
        prevScreen: state.prevScreen,
      })),
    );
  const {
    drawStaticPath,
    focusOnStaticPath,
    stopFollowingMyLocation,
    clearStaticPath,
  } = useRoutingMessenger();
  const setLocationMode = useLocationStore(state => state.setLocationMode);
  const { myLocationCompassOff } = useLocationMessenger();
  const { isMapReady, mapReadyVersion } = useMapStore(
    useShallow(state => ({
      isMapReady: state.isMapReady,
      mapReadyVersion: state.mapReadyVersion,
    })),
  );
  const { turnOffBookmarkMarkers } = useBookmarkMessenger();

  const {
    summary,
    segments,
    startStation,
    endStation,
    routeCategory,
    waypoints: wpArr,
    coordinates,
  } = selectedRouteData;

  const time = formatTimeHMText(summary.time);
  const distance = formatDistanceAdaptiveText(summary.distance);
  const timeRange = formatTimeRangeText(baseTime, summary.time);
  const formattedRouteCategory = getRouteCategoryText(routeCategory);

  const firstWalkingSegment = segments.find(seg => seg.type === 'walking');
  const lastWalkingSegment = segments
    .slice()
    .reverse()
    .find(seg => seg.type === 'walking');

  const bikingSegments = segments.filter(s => s.type === 'biking');
  const totalBikingDistance = bikingSegments.reduce(
    (acc, seg) => acc + seg.summary.distance,
    0,
  );
  const totalBikingTime = bikingSegments.reduce(
    (acc, seg) => acc + seg.summary.time,
    0,
  );

  const waypointsCount = waypoints ? waypoints.length : 0;

  useEffect(() => {
    if (!isMapReady) return;
    const handleRoutePress = () => {
      const staticPathData: StaticPathData = {
        routeType: prevScreen === 'RouteRecommend' ? RouteType.LOOP : routeType,
        startPoint: coordinates[0],
        endPoint: coordinates[coordinates.length - 1],
        waypoints: wpArr ? wpArr : null,
        startStationPoint: {
          lat: startStation.lat,
          lng: startStation.lng,
        },
        endStationPoint: endStation
          ? {
              lat: endStation.lat,
              lng: endStation.lng,
            }
          : {
              lat: startStation.lat,
              lng: startStation.lng,
            },
        pathCoordinates: coordinates,
      };
      stopFollowingMyLocation();
      drawStaticPath(staticPathData);
      turnOffBookmarkMarkers();
      myLocationCompassOff();
      setLocationMode('default');
    };

    handleRoutePress();
  }, [
    drawStaticPath,
    routeType,
    coordinates,
    wpArr,
    isMapReady,
    mapReadyVersion,
    focusOnStaticPath,
  ]);

  useEffect(() => {
    if (!isNavigationMode || !routeId) return;
    setShowSelectedRouteDetailModal(false);
  }, [isNavigationMode, routeId]);

  const handleStartNavigationModePress = () => {
    setRouteId(selectedRouteData.routeId);
    setIsNavigationMode(true);
    setShowNavigationStartModal(true);
    clearStaticPath();
  };

  return {
    totalCaloriesBurned,
    totalTrees,
    startStation,
    endStation,
    time,
    distance,
    timeRange,
    formattedRouteCategory,
    firstWalkingSegment,
    lastWalkingSegment,
    bikingSegments,
    totalBikingDistance,
    totalBikingTime,
    waypointsCount,
    startAddress,
    endAddress,
    handleStartNavigationModePress,
    formatTimeMinutesNumber,
  };
};
