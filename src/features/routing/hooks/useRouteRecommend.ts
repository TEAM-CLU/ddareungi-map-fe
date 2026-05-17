import { RootStackParamList } from '@/app/types';
import {
  CircularJourneyPayload,
  Route,
  RoutePoint,
} from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useAppRoute } from '@/shared/hooks/useAppRoute';
import { useModalStore } from '@/shared/stores/useModalStore';
import React, { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useCircularJourneyMutation } from '../services/routing.queries';
import { useShallow } from 'zustand/react/shallow';

export const useRouteRecommend = () => {
  const { navigation } = useAppNavigation<'Map'>();

  const {
    mutate: searchCircularRoutes,
    data: routes,
    isPending: isLoadingRoutes,
    error: routeSearchError,
  } = useCircularJourneyMutation();

  const { setShowRouteRecommendModal, setShowSelectedRouteDetailModal } =
    useModalStore(
      useShallow(state => ({
        setShowRouteRecommendModal: state.setShowRouteRecommendModal,
        setShowSelectedRouteDetailModal: state.setShowSelectedRouteDetailModal,
      })),
    );

  const {
    setTotalCaloriesBurned,
    setTotalTrees,

    setPrevScreen,

    start,
    distance,
    setStart,
    setSelectedRouteData,

    resetAllData,
  } = useRouteStore(
    useShallow(state => ({
      setTotalCaloriesBurned: state.setTotalCaloriesBurned,
      setTotalTrees: state.setTotalTrees,
      setPrevScreen: state.setPrevScreen,
      start: state.start,
      distance: state.distance,
      setStart: state.setStart,
      setSelectedRouteData: state.setSelectedRouteData,
      resetAllData: state.resetAllData,
    })),
  );

  const route = useAppRoute<'RouteSelect'>();

  // 경로 시간 계산 기준 시간 (리프레시 가능)
  const [baseTime, setBaseTime] = React.useState<Date>(new Date());

  // ---------- Map → RouteRecommend ----------

  useEffect(() => {
    if (route.params?.selectedPlace && route.params?.placeType) {
      const { selectedPlace, placeType } = route.params;

      // 출발지 설정
      if (placeType === 'start') {
        setStart(selectedPlace);
      }

      // params 초기화
      navigation.setParams({
        selectedPlace: undefined,
        placeType: undefined,
      } as Partial<RootStackParamList['RouteRecommend']>);
    }
  }, [route.params?.selectedPlace, route.params?.placeType]);

  // ---------- Event handlers ----------

  // 출발지 입력창 터치
  const handleSetStartPointPress = useCallback(
    (field: RoutePoint) => {
      navigation.navigate('Map', {
        openSearchOverlay: true,
        placeType: field.fieldKey,
        returnTo: 'RouteRecommend',
      });
    },
    [navigation],
  );

  // 이동거리 입력창 터치
  const handleSetDistanceAimedPress = useCallback(() => {
    setShowRouteRecommendModal(true);
  }, []);

  // RouteInputBar 닫기 버튼
  const handleCloseRouteInputBarPress = useCallback(() => {
    resetAllData();
    navigation.navigate('Map');
  }, [resetAllData, navigation]);

  // 경로 검색 버튼
  const handleSearchRoutePress = useCallback(() => {
    if (!(start && start.latitude && start.longitude && distance !== null)) {
      Alert.alert('경로 검색', '출발지, 이동거리를 모두 설정해주세요.');
      return;
    }

    const payload: CircularJourneyPayload = {
      start: { lat: start.latitude, lng: start.longitude },
      targetDistance: distance * 1000,
    };

    searchCircularRoutes(payload, {
      onError: error => {
        Alert.alert('오류', error.message);
      },
    });
  }, [start, distance, searchCircularRoutes]);

  // 검색된 경로 클릭 핸들러
  const handleSetRouteItemPress = useCallback(
    (
      selectedRouteData: Route,
      totalCaloriesBurned: number,
      totalTrees: number,
    ) => {
      setSelectedRouteData(selectedRouteData);
      setPrevScreen('RouteRecommend');

      navigation.navigate('Map');
      setShowSelectedRouteDetailModal(true);
      setTotalCaloriesBurned(totalCaloriesBurned);
      setTotalTrees(totalTrees);
    },
    [
      navigation,
      setSelectedRouteData,
      setShowSelectedRouteDetailModal,
      setTotalCaloriesBurned,
      setTotalTrees,
    ],
  );

  return {
    handleSetStartPointPress,
    handleSetDistanceAimedPress,
    handleCloseRouteInputBarPress,
    handleSearchRoutePress,
    handleSetRouteItemPress,
    baseTime,
    setBaseTime,
    routes,
    isLoadingRoutes,
    routeSearchError,
  };
};
