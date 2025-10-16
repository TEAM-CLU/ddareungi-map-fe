import React, { use, useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import WebView from 'react-native-webview';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import SlideModal from '@/shared/components/modal/SlideModal';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import { RouteType } from '@/features/routing/model/routing.types';
import SearchBar from '@/features/search/components/SearchBar';
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../types/index';
import { useMapWebview } from '@/features/map/hooks/useMapWebview';
import MyLocationButton from '@/features/location/components/MyLocationButton';
import StationRefreshButton from '@/features/station/components/StationMarkersToggleButton';
import { useQueryClient } from '@tanstack/react-query';
import StationMarkersToggleButton from '@/features/station/components/StationMarkersToggleButton';
import { MapAreaStationsData } from '@/features/station/model/station.types';
import StationDetailModal from '@/features/station/components/StationDetailModal';
import { Coordinates } from '@/features/map/model/map.types';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';

type MapScreenNavigationProp = NavigationProp<RootStackParamList>;
type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

const MapScreen = () => {
  const webRef = useRef<WebView | null>(null);
  const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();
  const placeDetailModalRef = useRef<BottomSheetModal>(null);
  ///////////
  const stationDetailModalRef = useRef<BottomSheetModal | null>(null);
  const [stationMetaData, setStationMetaData] =
    useState<MapAreaStationsData | null>(null);
  const [myPosition, setMyPosition] = useState<Coordinates | undefined>(
    undefined,
  );
  const nearbyStationModalRef = useRef<BottomSheetModal | null>(null);
  const [isStationButtonPressed, setIsStationButtonPressed] = useState(false);

  // NearbyStationModal 오픈 처리
  useEffect(() => {
    if (isStationButtonPressed) {
      nearbyStationModalRef.current?.present();
      setIsStationButtonPressed(false);
    }
  }, [isStationButtonPressed]);

  //////////

  // 맵 준비 상태
  const [isMapReady, setIsMapReady] = useState(false);
  const { showPlaceMarker } = useMapWebview(webRef, isMapReady);

  // 검색 관련 상태
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // RouteSelect에서 온 경우의 placeType 저장
  const [currentPlaceType, setCurrentPlaceType] = useState<
    'start' | 'end' | 'waypoint'
  >('start');

  // 선택된 장소 상태 (모달에서 표시할 장소)
  const [selectedPlaceForModal, setSelectedPlaceForModal] =
    useState<AutocompleteResult | null>(null);

  // 경로 타입 상태 (PlaceDetailModal에서 필요)
  const [routeType, setRouteType] = useState<RouteType>(RouteType.CONSTANT);

  // route params 처리
  React.useEffect(() => {
    if (route.params?.openSearchOverlay) {
      setShowSearchOverlay(true);
      if (route.params.placeType) {
        setCurrentPlaceType(route.params.placeType);
      }
    }
  }, [route.params]);

  // 검색바 클릭 처리 - SearchOverlay 표시
  const handleSearchbarPress = () => {
    setShowSearchOverlay(true);
  };

  // 검색 오버레이 닫기
  const handleSearchClose = () => {
    setShowSearchOverlay(false);
    // RouteSelect에서 온 경우 다시 RouteSelect로 돌아가기
    if (route.params?.openSearchOverlay) {
      navigation.goBack();
    }
  };

  // 장소 선택 처리 (검색 결과에서)
  const handlePlaceSelect = (place: AutocompleteResult) => {
    // RouteSelect에서 온 경우: RouteSelect로 돌아가면서 선택된 장소 전달
    if (route.params?.openSearchOverlay) {
      setShowSearchOverlay(false);
      navigation.navigate('RouteSelect', {
        selectedPlace: place,
        placeType: currentPlaceType,
      });
      return;
    }

    // 일반 검색의 경우: 기존 로직대로 맵에 마커 표시 + 모달
    if (place.latitude && place.longitude) {
      showPlaceMarker(place.latitude, place.longitude, place.name, place);
    }

    setShowSearchOverlay(false);
    setSelectedPlaceForModal(place);
    placeDetailModalRef.current?.present();
  };

  // PlaceDetailModal 출발/원점 버튼 클릭
  const handleStartPress = () => {
    if (selectedPlaceForModal) {
      placeDetailModalRef.current?.dismiss();
      navigation.navigate('RouteSelect', {
        selectedPlace: selectedPlaceForModal,
        placeType: 'start',
        routeType: routeType,
      });
    }
  };

  // PlaceDetailModal 도착 버튼 클릭
  const handleEndPress = () => {
    if (selectedPlaceForModal) {
      placeDetailModalRef.current?.dismiss();
      navigation.navigate('RouteSelect', {
        selectedPlace: selectedPlaceForModal,
        placeType: 'end',
        routeType: routeType,
      });
    }
  };

  // PlaceDetailModal 경유지 버튼 클릭
  const handleWaypointPress = () => {
    if (selectedPlaceForModal) {
      placeDetailModalRef.current?.dismiss();
      navigation.navigate('RouteSelect', {
        selectedPlace: selectedPlaceForModal,
        placeType: 'waypoint',
        routeType: routeType,
      });
    }
  };

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map
        webRef={webRef}
        setStationMetaData={setStationMetaData}
        stationDetailModalRef={stationDetailModalRef}
        setMyPosition={setMyPosition}
      />

      {/* 검색바 */}
      {!showSearchOverlay && (
        <View style={tw('absolute top-12 left-4 right-4 z-10')}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="오늘은 어디로 갈까요?"
            readOnly={true}
            onPress={handleSearchbarPress}
          />
        </View>
      )}

      {/* 검색 오버레이 */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder="오늘은 어디로 갈까요?"
      />

      <View style={[tw('absolute right-3'), { bottom: 150 }]}>
        <MyLocationButton webRef={webRef} />
      </View>

      <View style={[tw('absolute right-3'), { bottom: 100 }]}>
        <StationMarkersToggleButton webRef={webRef} />
      </View>

      <Footer setIsStationButtonPressed={setIsStationButtonPressed} />

      {/* Nearby 대여소 모달 */}
      <SlideModal
        ref={nearbyStationModalRef}
        snapPoints={['43%', '47%']}
        initialIndex={1}
        onClose={() => nearbyStationModalRef.current?.dismiss()}
      >
        <NearbyStationModal
          myPosition={myPosition}
          stationDetailModalRef={stationDetailModalRef}
          setStationMetaData={setStationMetaData}
          nearByModalRef={nearbyStationModalRef}
        />
      </SlideModal>

      {/* 대여소 상세 모달 */}
      <SlideModal
        ref={stationDetailModalRef}
        snapPoints={['43%', '47%']}
        initialIndex={1}
        onClose={() => stationDetailModalRef.current?.dismiss()}
      >
        <StationDetailModal
          myPosition={myPosition}
          stationMetaData={stationMetaData}
        />
      </SlideModal>
      {/* 장소 상세 모달 */}
      <SlideModal
        ref={placeDetailModalRef}
        snapPoints={['25%']}
        onClose={() => placeDetailModalRef.current?.dismiss()}
      >
        {selectedPlaceForModal && (
          <PlaceDetailModal
            place={selectedPlaceForModal}
            routeType={routeType}
            onSetAsStart={handleStartPress}
            onSetAsEnd={handleEndPress}
            onSetAsWaypoint={handleWaypointPress}
            onToggleRouteType={() => {
              setRouteType(prev =>
                prev === RouteType.CONSTANT
                  ? RouteType.LOOP
                  : RouteType.CONSTANT,
              );
            }}
          />
        )}
      </SlideModal>
    </View>
  );
};

export default MapScreen;
