import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { RouteType } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { PlaceInfo } from '@/features/search/model/search.types';
import { useStationStore } from '@/features/station/stores/useStationStore';
import { useMapStore } from '@/features/map/stores/useMapStore';

interface UseStationRouteApplyActionsParams {
  onClose?: () => void;
}

export const useStationRouteApplyActions = ({
  onClose,
}: UseStationRouteApplyActionsParams = {}) => {
  const {
    routeType,
    setRouteType,
    setStart,
    setEnd,
    addWaypoint,
    syncStartEndInLoopMode,
  } = useRouteStore(
    useShallow(state => ({
      routeType: state.routeType,
      setRouteType: state.setRouteType,
      setStart: state.setStart,
      setEnd: state.setEnd,
      addWaypoint: state.addWaypoint,
      syncStartEndInLoopMode: state.syncStartEndInLoopMode,
    })),
  );
  const stationMetaData = useStationStore(state => state.stationMetaData);
  const navigation = useMapStore(state => state.globalNavigation);
  const toggleAnimation = useRef(
    new Animated.Value(routeType === RouteType.LOOP ? 1 : 0),
  ).current;

  useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: routeType === RouteType.LOOP ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [routeType, toggleAnimation]);

  const handleToggleRouteTypePress = useCallback(() => {
    const newRouteType =
      routeType === RouteType.CONSTANT ? RouteType.LOOP : RouteType.CONSTANT;
    setRouteType(newRouteType);
  }, [routeType, setRouteType]);

  const handleApplyConstantRoutePress = useCallback(() => {
    if (!stationMetaData) return;
    onClose?.();

    const placeData: PlaceInfo = {
      placeId: `start-${Date.now()}`,
      name: stationMetaData.name,
      address: stationMetaData.address,
      latitude: stationMetaData.latitude,
      longitude: stationMetaData.longitude,
    };

    if (routeType === RouteType.LOOP) {
      syncStartEndInLoopMode(placeData, 'start');
    } else {
      setStart(placeData);
    }

    navigation?.navigate('RouteSelect');
  }, [
    stationMetaData,
    onClose,
    routeType,
    syncStartEndInLoopMode,
    setStart,
    navigation,
  ]);

  const handleApplyLoopRoutePress = useCallback(() => {
    if (!stationMetaData) return;
    onClose?.();

    const placeData: PlaceInfo = {
      placeId: routeType === RouteType.LOOP ? '' : `end-${Date.now()}`,
      name: stationMetaData.name,
      address: stationMetaData.address,
      latitude: stationMetaData.latitude,
      longitude: stationMetaData.longitude,
    };

    if (routeType === RouteType.LOOP) {
      addWaypoint(placeData);
    } else {
      setEnd(placeData);
    }

    navigation?.navigate('RouteSelect');
  }, [stationMetaData, onClose, routeType, addWaypoint, setEnd, navigation]);

  return {
    toggleAnimation,
    routeType,
    handleToggleRouteTypePress,
    handleApplyConstantRoutePress,
    handleApplyLoopRoutePress,
  };
};
