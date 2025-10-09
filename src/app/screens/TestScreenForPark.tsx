import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import SearchBar from '@/features/search/components/SearchBar';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../types';
import Footer from '@/shared/components/Footer';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import RouteInputBar, {
  RouteType,
  RoutePoint,
} from '@/features/routing/components/RouteInputBar';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapScreenNavigationProp = NavigationProp<RootStackParamList>;

const TestScreenForPark = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();

  // 검색 오버레이 상태
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // 경로 입력바 표시 상태 - 기본적으로 숨김
  const [showRouteInputBar, setShowRouteInputBar] = useState(false);

  // 경로 타입 상태 - 기본적으로 CONSTANT 모드
  const [routeType, setRouteType] = useState<RouteType>(RouteType.CONSTANT);

  // 현재 선택중인 경로 포인트
  const [currentSelectedPoint, setCurrentSelectedPoint] =
    useState<RoutePoint | null>(null);

  // 경로 데이터 상태
  const [routeData, setRouteData] = useState<{
    [key: string]: AutocompleteResult;
  }>({});

  // 검색 화면에서 선택한 장소 정보 받기
  const selectedPlace = route.params?.selectedPlace;

  useEffect(() => {
    if (selectedPlace) {
      console.log('선택된 장소:', selectedPlace);
      // 여기서 지도를 해당 장소로 이동시키는 로직 추가
    }
  }, [selectedPlace]);

  // 검색바 클릭 처리
  const handleSearchPress = () => {
    setShowSearchOverlay(true);
  };

  // 검색 오버레이 닫기
  const handleSearchClose = () => {
    setShowSearchOverlay(false);
  };

  // 장소 선택 처리
  const handlePlaceSelect = (place: AutocompleteResult) => {
    console.log('선택된 장소:', place);

    // 현재 선택중인 경로 포인트가 있으면 해당 필드에 설정
    if (currentSelectedPoint) {
      setRouteData(prev => ({
        ...prev,
        [currentSelectedPoint.id]: place,
      }));
      setCurrentSelectedPoint(null);
    } else {
      // 경로 포인트 선택이 없으면 기본적으로 출발지에 설정하고 RouteInputBar 표시
      setRouteData(prev => ({
        ...prev,
        start: place,
      }));
      setShowRouteInputBar(true);
    }

    setShowSearchOverlay(false);
    // 여기서 지도를 해당 장소로 이동시키는 로직 추가
  };

  // 경로 입력바 토글
  const toggleRouteInputBar = () => {
    setShowRouteInputBar(!showRouteInputBar);
  };

  // 경로 포인트 선택 처리
  const handleRoutePointPress = (point: RoutePoint) => {
    console.log('경로 포인트 선택:', point);
    setCurrentSelectedPoint(point);
    setShowSearchOverlay(true);
  };

  // 경로 타입 변경 처리
  const toggleRouteType = () => {
    const newType =
      routeType === RouteType.CONSTANT ? RouteType.LOOP : RouteType.CONSTANT;
    setRouteType(newType);
    console.log('경로 타입 변경:', newType);
  };

  return (
    <View style={tw('flex-1')}>
      {/* 지도 영역 (임시) */}
      <View style={tw('flex-1 bg-gray-100')}>
        {/* 여기에 실제 지도 컴포넌트가 들어갈 예정 */}
        <View style={tw('flex-1 items-center justify-center')}>
          <Text style={tw('text-gray-400 text-lg')}>지도 영역</Text>
          <Text style={tw('text-gray-300 text-sm mt-2')}>
            지도 라이브러리 연동 예정
          </Text>
        </View>

        {/* 검색바 또는 경로 입력바 (같은 위치에서 조건부 표시) */}
        <View style={tw('absolute top-12 left-4 right-4 z-10')}>
          {showRouteInputBar ? (
            <RouteInputBar
              routeType={routeType}
              onRoutePointPress={handleRoutePointPress}
              onClose={() => setShowRouteInputBar(false)}
              routeData={routeData}
            />
          ) : (
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="오늘은 어디로 갈까요?"
              readOnly={true}
              onPress={handleSearchPress}
            />
          )}
        </View>

        {/* 컨트롤 버튼들 */}
        {showRouteInputBar && (
          <View style={tw('absolute top-20 right-4 z-10')}>
            <TouchableOpacity
              style={tw('bg-green-500 px-3 py-2 rounded-lg')}
              onPress={toggleRouteType}
            >
              <Text style={tw('text-white text-sm font-semibold')}>
                {routeType === RouteType.CONSTANT ? '루프' : '일반'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 검색 오버레이 - 항상 마운트, 표시만 제어 */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder="오늘은 어디로 갈까요?"
      />

      <Footer />
    </View>
  );
};

export default TestScreenForPark;
