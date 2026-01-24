import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';

import {
  RouteType,
  RoutePoint,
  Route,
  FullJourneyPayload,
} from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useAppRoute } from '@/shared/hooks/useAppRoute';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useFullJourneyMutation } from '../services/routing.queries';

export const useRouteSelect = () => {
  const route = useAppRoute<'RouteSelect'>();
  const { navigation } = useAppNavigation();

  const {
    mutate: searchRoutes,
    data: routes,
    isPending: isLoadingRoutes,
    error: routeSearchError,
  } = useFullJourneyMutation();

  const {
    routeType,
    setRouteType,
    start,
    end,
    waypoints,
    setPrevScreen,
    setTotalCaloriesBurned,
    setTotalTrees,
    setStart,
    setEnd,
    setSelectedRouteData,
    addWaypoint,
    updateWaypoint,
    syncStartEndInLoopMode,
    isRouteComplete,
    resetAllData,
  } = useRouteStore(
    useShallow(state => ({
      routeType: state.routeType,
      setRouteType: state.setRouteType,
      start: state.start,
      end: state.end,
      waypoints: state.waypoints,
      setPrevScreen: state.setPrevScreen,
      setTotalCaloriesBurned: state.setTotalCaloriesBurned,
      setTotalTrees: state.setTotalTrees,
      setStart: state.setStart,
      setEnd: state.setEnd,
      setSelectedRouteData: state.setSelectedRouteData,
      addWaypoint: state.addWaypoint,
      updateWaypoint: state.updateWaypoint,
      syncStartEndInLoopMode: state.syncStartEndInLoopMode,
      isRouteComplete: state.isRouteComplete,
      resetAllData: state.resetAllData,
    })),
  );

  const setSelectedPlaceInfoForModal = useSearchStore(
    state => state.setSelectedPlaceInfoForModal,
  );

  const setShowSelectedRouteDetailModal = useModalStore(
    state => state.setShowSelectedRouteDetailModal,
  );

  // 시간 계산 기준(렌더링에 영향 있으니 state 유지)
  const [baseTime, setBaseTime] = useState(() => new Date());

  // params 소비 가드(렌더링 필요 없음 → ref가 정석)
  const paramsConsumedRef = useRef(true);

  // 포커스될 때마다 “이번 진입에서 params 소비 가능” 상태로
  useFocusEffect(
    useCallback(() => {
      paramsConsumedRef.current = false;
    }, []),
  );

  // routeType param 반영
  useEffect(() => {
    const nextRouteType = route.params?.routeType;
    if (!nextRouteType) return;
    setRouteType(nextRouteType);
  }, [route.params?.routeType, setRouteType]);

  const consumeRouteParams = useCallback(() => {
    const selectedPlace = route.params?.selectedPlace;
    const placeType = route.params?.placeType;

    if (!selectedPlace || !placeType) return;
    if (paramsConsumedRef.current) return;

    paramsConsumedRef.current = true;

    // auto: 비어있는 슬롯에 자동 할당
    if (placeType === 'auto') {
      if (!start?.name) {
        setStart(selectedPlace);
        return;
      }

      if (routeType === RouteType.CONSTANT && !end?.name) {
        setEnd(selectedPlace);
        return;
      }

      const emptyIndex = waypoints.findIndex(wp => !wp.place?.name);
      if (emptyIndex !== -1) {
        updateWaypoint(`waypoint-${emptyIndex}`, selectedPlace);
        return;
      }

      if (waypoints.length < 3) addWaypoint(selectedPlace);
      return;
    }

    // LOOP: start/end 동기화
    if (
      routeType === RouteType.LOOP &&
      (placeType === 'start' || placeType === 'end')
    ) {
      syncStartEndInLoopMode(selectedPlace, placeType);
      return;
    }

    // 일반 지정
    if (placeType === 'start') setStart(selectedPlace);
    else if (placeType === 'end') setEnd(selectedPlace);
    else if (placeType === 'waypoint-new') addWaypoint(selectedPlace);
    else if (placeType.startsWith('waypoint-'))
      updateWaypoint(placeType, selectedPlace);
  }, [
    route.params?.selectedPlace,
    route.params?.placeType,
    start?.name,
    end?.name,
    waypoints,
    routeType,
    setStart,
    setEnd,
    addWaypoint,
    updateWaypoint,
    syncStartEndInLoopMode,
  ]);

  // params 소비 트리거 effect는 “호출만”
  useEffect(() => {
    consumeRouteParams();
  }, [consumeRouteParams]);

  const fullJourneyPayload: FullJourneyPayload | null = useMemo(() => {
    if (!start || !end) return null;

    const filledWaypoints = waypoints
      .filter(wp => wp.place?.latitude && wp.place?.longitude)
      .map(wp => ({
        lat: wp.place!.latitude!,
        lng: wp.place!.longitude!,
      }));

    return {
      start: { lat: start.latitude, lng: start.longitude },
      end: { lat: end.latitude, lng: end.longitude },
      waypoints: filledWaypoints.length > 0 ? filledWaypoints : undefined,
    };
  }, [start, end, waypoints]);

  // ---------------- handlers ----------------

  const handleSetPointPress = useCallback(
    (field: RoutePoint) => {
      navigation.navigate('Map', {
        openSearchOverlay: true,
        placeType: field.fieldKey,
        returnTo: 'RouteSelect',
      });
    },
    [navigation],
  );

  const handleAddNewWaypointAndEditPress = useCallback(() => {
    navigation.navigate('Map', {
      openSearchOverlay: true,
      placeType: 'waypoint-new',
      returnTo: 'RouteSelect',
    });
  }, [navigation]);

  const handleCloseRouteInputBarPress = useCallback(() => {
    setSelectedPlaceInfoForModal(null);
    resetAllData();
    setRouteType(RouteType.CONSTANT);
    navigation.navigate('Map');
  }, [navigation, resetAllData, setRouteType, setSelectedPlaceInfoForModal]);

  const handleSearchRoutePress = useCallback(() => {
    if (!isRouteComplete()) {
      Alert.alert('경로 검색', '출발지, 도착지, 경유지를 모두 설정해주세요.');
      return;
    }

    if (!fullJourneyPayload) return;

    searchRoutes(fullJourneyPayload, {
      onSuccess: data => {
        console.log('경로 검색 성공:', data);
      },
      onError: error => {
        Alert.alert('오류', error.message);
      },
    });
  }, [isRouteComplete, fullJourneyPayload, searchRoutes]);

  const handleSetRouteItemPress = useCallback(
    (
      selectedRouteData: Route,
      totalCaloriesBurned: number,
      totalTrees: number,
    ) => {
      setSelectedRouteData(selectedRouteData);
      setShowSelectedRouteDetailModal(true);
      setPrevScreen('RouteSelect');
      navigation.navigate('Map');
      setTotalCaloriesBurned(totalCaloriesBurned);
      setTotalTrees(totalTrees);
    },
    [
      navigation,
      setSelectedRouteData,
      setShowSelectedRouteDetailModal,
      setPrevScreen,
      setTotalCaloriesBurned,
      setTotalTrees,
    ],
  );

  return {
    // data
    baseTime,
    setBaseTime,
    routes,
    isLoadingRoutes,
    routeSearchError,

    // handlers
    handleSetPointPress,
    handleAddNewWaypointAndEditPress,
    handleCloseRouteInputBarPress,
    handleSearchRoutePress,
    handleSetRouteItemPress,
  };
};
