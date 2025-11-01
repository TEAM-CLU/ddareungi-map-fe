import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { useRouteStore } from '@/features/routing/stores/routeStore';
import RouteRecommendInputBar from '@/features/routing/components/recommend/RouteRecommendInputBar';
import RouteRecommendModal from '@/features/routing/components/recommend/RouteRecommendModal';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';
import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import { RoutePoint } from '@/features/routing/model/routing.types';
import {
  useNavigation,
  useRoute,
  NavigationProp,
  RouteProp,
} from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SlideModal from '@/shared/components/modal/SlideModal';

type RouteRecommendScreenRouteProp = RouteProp<
  RootStackParamList,
  'RouteRecommend'
>;
type RouteRecommendScreenNavigationProp = NavigationProp<RootStackParamList>;

const RouteRecommendScreen = () => {
  const route = useRoute<RouteRecommendScreenRouteProp>();
  const navigation = useNavigation<RouteRecommendScreenNavigationProp>();

  const routeRecommendModalRef = useRef<BottomSheetModal | null>(null);

  const {
    start,
    distance,
    setStart,

    showSearchOverlay,
    setShowSearchOverlay,

    setCurrentSelectedPoint,
    currentFieldType,
    setCurrentFieldType,

    routes,
    isLoadingRoutes,
    routeSearchError,
    searchCircularRoutes,
    resetRouteInputData,
  } = useRouteStore();

  // 경로 시간 계산 기준 시간 (리프레시 가능)
  const [baseTime, setBaseTime] = React.useState<Date>(new Date());

  // Map에서 장소 선택 후 돌아온 경우 반영
  useEffect(() => {
    if (route.params?.selectedPlace && route.params?.placeType) {
      const { selectedPlace, placeType } = route.params;

      // 출발지만 처리
      if (placeType === 'start') {
        setStart(selectedPlace);
      }

      // params 초기화
      navigation.setParams({
        selectedPlace: undefined,
        placeType: undefined,
      } as any);
    }
  }, [route.params?.selectedPlace, route.params?.placeType]);

  // 출발지와 거리가 설정되면 API 호출
  useEffect(() => {
    if (
      start &&
      start.latitude &&
      start.longitude &&
      distance !== null &&
      distance > 0
    ) {
      console.log('[RouteRecommendScreen] 원형 경로 검색 실행:', {
        start: start.name,
        distance,
      });
      searchCircularRoutes();
    }
  }, [start, distance, searchCircularRoutes]);

  // 출발지 인풋 클릭 시 Map으로 이동
  const handleRoutePointPress = useCallback(
    (point: RoutePoint) => {
      setCurrentSelectedPoint(point);
      setCurrentFieldType('start');

      navigation.navigate('Map', {
        openSearchOverlay: true,
        placeType: point.id, // 'start'
        returnTo: 'RouteRecommend',
      });
    },
    [navigation, setCurrentSelectedPoint, setCurrentFieldType],
  );

  // 이동거리 인풋 클릭 시 RouteRecommendModal 오픈
  const handleDistancePress = useCallback(() => {
    routeRecommendModalRef.current?.present();
  }, []);

  // SearchOverlay에서 장소 선택 시
  const handlePlaceSelect = useCallback(
    (place: AutocompleteResult) => {
      if (currentFieldType === 'start') {
        setStart(place);
      }

      setShowSearchOverlay(false);
      setCurrentSelectedPoint(null);
      setCurrentFieldType(null);
    },
    [
      currentFieldType,
      setStart,
      setShowSearchOverlay,
      setCurrentSelectedPoint,
      setCurrentFieldType,
    ],
  );

  // SearchOverlay 닫기
  const handleSearchClose = useCallback(() => {
    setShowSearchOverlay(false);
    setCurrentSelectedPoint(null);
    setCurrentFieldType(null);
  }, [setShowSearchOverlay, setCurrentSelectedPoint, setCurrentFieldType]);

  // RouteRecommendInputBar 닫기 및 초기화 처리
  const handleRouteRecommendInputBarClose = useCallback(() => {
    console.log('[RouteRecommendScreen] X 버튼 클릭 - 초기화 및 Map으로 이동');
    resetRouteInputData();
    navigation.navigate('Map');
  }, [resetRouteInputData, navigation]);

  return (
    <View style={tw('flex-1 bg-white')}>
      {/* 상단 RouteRecommendInputBar */}
      {!showSearchOverlay && (
        <View style={tw('bg-brand-primary w-full pt-16 pb-4')}>
          <View style={tw('mx-2')}>
            <RouteRecommendInputBar
              onRoutePointPress={handleRoutePointPress}
              onDistancePress={handleDistancePress}
              onClose={handleRouteRecommendInputBarClose}
            />
          </View>
        </View>
      )}

      {/* SearchOverlay */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder="출발지를 검색하세요"
      />

      {!showSearchOverlay && (
        <>
          <RouteTimeRefreshBar
            baseTime={baseTime}
            onRefresh={() => setBaseTime(new Date())}
          />
          <RouteSelectContainer
            routes={routes}
            isLoading={isLoadingRoutes}
            error={routeSearchError}
            baseTime={baseTime}
          />
        </>
      )}

      {/* 경로추천 모달 */}
      <SlideModal
        ref={routeRecommendModalRef}
        snapPoints={['45%', '48%']}
        initialIndex={1}
        onClose={() => routeRecommendModalRef.current?.dismiss()}
      >
        <RouteRecommendModal
          navigation={navigation}
          routeRecommendModalRef={routeRecommendModalRef}
          setIsRouteRecommendBtnPressed={() => {}}
        />
      </SlideModal>
    </View>
  );
};

export default RouteRecommendScreen;
