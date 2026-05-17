import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { RouteType } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { PlaceInfo } from '@/features/search/model/search.types';
import { useMapStore } from '@/features/map/stores/useMapStore';

interface UsePlaceRouteApplyActionsParams {
  place: PlaceInfo | null;
  onClose?: () => void;
}

export const usePlaceRouteApplyActions = ({
  place,
  onClose,
}: UsePlaceRouteApplyActionsParams) => {
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
    if (!place) return;
    onClose?.();

    const placeData: PlaceInfo = {
      placeId: `start-${Date.now()}`,
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      category: place.category,
      roadAddress: place.roadAddress,
    };

    if (routeType === RouteType.LOOP) {
      syncStartEndInLoopMode(placeData, 'start');
    } else {
      setStart(placeData);
    }

    navigation?.navigate('RouteSelect');
  }, [place, onClose, routeType, syncStartEndInLoopMode, setStart, navigation]);

  const handleApplyLoopRoutePress = useCallback(() => {
    if (!place) return;
    onClose?.();

    const placeData: PlaceInfo = {
      placeId: routeType === RouteType.LOOP ? '' : `end-${Date.now()}`,
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      category: place.category,
      roadAddress: place.roadAddress,
    };

    if (routeType === RouteType.LOOP) {
      addWaypoint(placeData);
    } else {
      setEnd(placeData);
    }

    navigation?.navigate('RouteSelect');
  }, [place, onClose, routeType, addWaypoint, setEnd, navigation]);

  return {
    toggleAnimation,
    routeType,
    handleToggleRouteTypePress,
    handleApplyConstantRoutePress,
    handleApplyLoopRoutePress,
  };
};
