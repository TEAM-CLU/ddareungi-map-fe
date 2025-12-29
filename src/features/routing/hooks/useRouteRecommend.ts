import { RootStackParamList } from '@/app/types';
import { Route, RoutePoint } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useAppRoute } from '@/shared/hooks/useAppRoute';
import { useModalStore } from '@/shared/stores/useModalStore';
import React, { useEffect, useCallback, use } from 'react';
import { Alert } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

export const useRouteRecommend = () => {
  const route = useAppRoute<'RouteSelect'>();
  const { navigation } = useAppNavigation<'Map'>();

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

    routes,
    isLoadingRoutes,
    routeSearchError,
    searchCircularRoutes,
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
      routes: state.routes,
      isLoadingRoutes: state.isLoadingRoutes,
      routeSearchError: state.routeSearchError,
      searchCircularRoutes: state.searchCircularRoutes,
      resetAllData: state.resetAllData,
    })),
  );

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
  const handleRoutePointPress = useCallback(
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
  const handleDistancePress = useCallback(() => {
    setShowRouteRecommendModal(true);
  }, []);

  // RouteInputBar 닫기 버튼
  const handleRouteInputBarClose = useCallback(() => {
    resetAllData();
    navigation.navigate('Map');
  }, [resetAllData, navigation]);

  // 경로 검색 버튼
  const handleRouteSearchConfirm = useCallback(() => {
    if (!(start && start.latitude && start.longitude && distance !== null)) {
      Alert.alert('경로 검색', '출발지, 이동거리를 모두 설정해주세요.');
      return;
    }
    searchCircularRoutes();
  }, [start, distance, searchCircularRoutes]);

  // 검색된 경로 클릭 핸들러
  const handleRouteItemPress = useCallback(
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
    handleRoutePointPress,
    handleDistancePress,
    handleRouteInputBarClose,
    handleRouteSearchConfirm,
    handleRouteItemPress,
    baseTime,
    setBaseTime,
    routes,
    isLoadingRoutes,
    routeSearchError,
  };
};
