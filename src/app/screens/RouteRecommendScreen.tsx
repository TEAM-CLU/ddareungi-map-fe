import React, { useCallback, useEffect, useRef } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import RouteRecommendInputBar from '@/features/routing/components/recommend/RouteRecommendInputBar';
import RouteRecommendModal from '@/features/routing/components/recommend/RouteRecommendModal';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';
import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import { Route, RoutePoint } from '@/features/routing/model/routing.types';
import {
  useNavigation,
  useRoute,
  NavigationProp,
  RouteProp,
} from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAppRoute } from '@/shared/hooks/useAppRoute';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useModalStore } from '@/shared/stores/useModalStore';
import RoundButton from '@/shared/components/button/RoundButton';

const RouteRecommendScreen = () => {
  const route = useAppRoute<'RouteSelect'>();
  const { navigation } = useAppNavigation<'Map'>();

  const { setShowRouteRecommendModal, setShowSelectedRouteDetailModal } =
    useModalStore();

  const {
    setTotalCaloriesBurned,
    setTotalTrees,

    start,
    distance,
    setStart,
    setSelectedRouteData,

    routes,
    isLoadingRoutes,
    routeSearchError,
    searchCircularRoutes,
    resetAllData,
  } = useRouteStore();

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
    navigation.goBack();
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

  return (
    <View style={tw('flex-1 bg-white')}>
      {/* RouteRecommendInputBar */}
      <View style={tw('bg-brand-primary w-full pt-16 pb-4')}>
        <View style={tw('mx-2')}>
          <RouteRecommendInputBar
            onRoutePointPress={handleRoutePointPress}
            onDistancePress={handleDistancePress}
            onClose={handleRouteInputBarClose}
          />
        </View>
      </View>

      <View
        style={[
          tw(
            'bg-surface-primary flex flex-row w-full items-center justify-between px-4 py-1',
          ),
          { borderColor: '#D8D8D8', borderBottomWidth: 1 },
        ]}
      >
        <RouteTimeRefreshBar
          baseTime={baseTime}
          onRefresh={() => setBaseTime(new Date())}
        />
        <RoundButton
          title={'경로 검색하기'}
          onPress={handleRouteSearchConfirm}
          preset={'sm'}
        />
      </View>

      <RouteSelectContainer
        routes={routes}
        isLoading={isLoadingRoutes}
        error={routeSearchError}
        baseTime={baseTime}
        onRoutePress={handleRouteItemPress}
      />
    </View>
  );
};

export default RouteRecommendScreen;
