import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Alert } from 'react-native';
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
import SlideModal from '@/shared/components/modal/SlideModal';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapScreenNavigationProp = NavigationProp<RootStackParamList>;

const TestScreenForPark = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();

  // SlideModal ref
  const placeDetailModalRef = useRef<BottomSheetModal>(null);

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

  // 선택된 장소 상태 (모달에서 표시할 장소)
  const [selectedPlaceForModal, setSelectedPlaceForModal] =
    useState<AutocompleteResult | null>(null);

  // 검색 화면에서 선택한 장소 정보 받기
  const selectedPlace = route.params?.selectedPlace;

  useEffect(() => {
    if (selectedPlace) {
      Alert.alert('선택된 장소:', selectedPlace.name);
      // 여기서 지도를 해당 장소로 이동시키는 로직 추가
    }
  }, [selectedPlace]);

  // 검색바 클릭 처리 - 검색 오버레이 표시
  const handleSearchbarPress = () => {
    setShowSearchOverlay(true);
  };

  // 검색 오버레이 닫기
  const handleSearchbarClose = () => {
    setShowSearchOverlay(false);
  };

  // 장소 선택 처리
  const handlePlaceSelect = (place: AutocompleteResult) => {
    // 현재 선택중인 경로 포인트가 있으면 해당 필드에 설정
    if (currentSelectedPoint) {
      if (
        routeType === RouteType.LOOP &&
        (currentSelectedPoint.id === 'start' ||
          currentSelectedPoint.id === 'end')
      ) {
        // Loop 모드에서 출발지나 도착지 설정 시 둘 다 동일하게 설정
        setRouteData(prev => ({
          ...prev,
          start: place,
          end: place,
        }));
      } else {
        // 일반적인 경우 (Constant 모드이거나 경유지 설정)
        setRouteData(prev => ({
          ...prev,
          [currentSelectedPoint.id]: place,
        }));
      }
      setCurrentSelectedPoint(null);
      setShowSearchOverlay(false);
    } else {
      // 경로 포인트 선택이 없으면 장소 상세 모달 표시
      setSelectedPlaceForModal(place);
      setShowSearchOverlay(false);
      // 딜레이 후 모달 표시
      setTimeout(() => {
        placeDetailModalRef.current?.present();
      }, 100);
    }

    // 여기서 지도를 해당 장소로 이동시키는 로직 추가
  };

  // 경로 포인트 선택 처리
  const handleRoutePointPress = (point: RoutePoint) => {
    setCurrentSelectedPoint(point);
    setShowSearchOverlay(true);
  };

  // 경로 타입 변경 처리
  const toggleRouteType = () => {
    const newType =
      routeType === RouteType.CONSTANT ? RouteType.LOOP : RouteType.CONSTANT;
    setRouteType(newType);
  };

  // RouteInputBar 데이터 초기화 처리
  const handleRouteDataReset = () => {
    setRouteData({});
    setCurrentSelectedPoint(null);
  };

  // PlaceDetailModal 출발/원점 버튼 클릭
  const handleStartPress = () => {
    if (selectedPlaceForModal) {
      if (routeType === RouteType.LOOP) {
        // Loop 모드: 원점 - 출발지=도착지로 동일하게 설정
        setRouteData(prev => ({
          ...prev,
          start: selectedPlaceForModal,
          end: selectedPlaceForModal, // Loop에서는 출발지=도착지
        }));
      } else {
        // Constant 모드: 출발지만 설정
        setRouteData(prev => ({
          ...prev,
          start: selectedPlaceForModal,
        }));
      }
      setShowRouteInputBar(true);
      placeDetailModalRef.current?.dismiss();
    }
  };

  // PlaceDetailModal 도착 버튼 클릭 (Constant 모드에서만 사용)
  const handleEndPress = () => {
    if (selectedPlaceForModal) {
      setRouteData(prev => ({
        ...prev,
        end: selectedPlaceForModal,
      }));
      setShowRouteInputBar(true);
      placeDetailModalRef.current?.dismiss();
    }
  };

  // PlaceDetailModal 반환점 버튼 클릭
  const handleWaypointPress = () => {
    if (selectedPlaceForModal) {
      // 경유지로 설정 - waypoint-1부터 순차적으로 설정
      setRouteData(prev => {
        // 빈 경유지 슬롯 찾기
        let waypointKey = 'waypoint-1';
        let index = 1;
        while (prev[waypointKey] && index < 10) {
          index++;
          waypointKey = `waypoint-${index}`;
        }

        return {
          ...prev,
          [waypointKey]: selectedPlaceForModal,
        };
      });
      setShowRouteInputBar(true);
      placeDetailModalRef.current?.dismiss();
    }
  };

  const handleModalClose = () => {
    setSelectedPlaceForModal(null);
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

          {/* 선택된 장소 임시 마커 표시 */}
          {selectedPlaceForModal && (
            <View style={tw('mt-4 bg-white p-3 rounded-lg shadow')}>
              <Text style={tw('text-green-600 font-semibold')}>📍</Text>
              <Text style={tw('text-gray-800')}>
                {selectedPlaceForModal.name}
              </Text>
              <Text style={tw('text-gray-500 text-xs')}>
                {selectedPlaceForModal.address}
              </Text>
            </View>
          )}
        </View>

        {/* 검색바 또는 경로 입력바 (같은 위치에서 조건부 표시) */}
        <View style={tw('absolute top-12 left-4 right-4 z-10')}>
          {showRouteInputBar ? (
            <RouteInputBar
              routeType={routeType}
              onRoutePointPress={handleRoutePointPress}
              onClose={() => {
                setShowRouteInputBar(false);
                handleRouteDataReset(); // RouteInputBar 닫을 때 데이터 초기화
              }}
              routeData={routeData}
            />
          ) : (
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="오늘은 어디로 갈까요?"
              readOnly={true}
              onPress={handleSearchbarPress}
            />
          )}
        </View>
      </View>

      {/* 검색 오버레이 - 항상 마운트, 표시만 제어 */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchbarClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder="오늘은 어디로 갈까요?"
      />

      {/* 장소 상세 정보 슬라이드 모달 */}
      <SlideModal
        ref={placeDetailModalRef}
        snapPoints={['25%', '30%']}
        initialIndex={1}
        onClose={handleModalClose}
      >
        {selectedPlaceForModal && (
          <PlaceDetailModal
            place={selectedPlaceForModal}
            onSetAsStart={handleStartPress}
            onSetAsEnd={handleEndPress}
            onSetAsWaypoint={handleWaypointPress}
            onToggleRouteType={toggleRouteType}
            routeType={routeType}
          />
        )}
      </SlideModal>

      <Footer />
    </View>
  );
};

export default TestScreenForPark;
