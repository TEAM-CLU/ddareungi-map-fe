import { RootStackParamList } from '@/app/types';
import { Coordinates } from '@/features/map/model/map.types';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import { useMapSearch } from '@/features/search/hooks/useMapSearch';
import { MapAreaStationData } from '@/features/station/model/station.types';
import { useRouteStore } from '@/features/routing/stores/routeStore';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useRef, useState, useEffect, useCallback } from 'react';
import WebView from 'react-native-webview';

/**
 * MapScreen 상태 및 이벤트를 통합 관리하는 훅
 */
export const useMapController = () => {
  const webRef = useRef<WebView | null>(null);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();

  const { showPlaceMarker } = useMapSearch(webRef);

  const { showSearchOverlay, setShowSearchOverlay, hasAnyRouteData } =
    useRouteStore();

  const [currentPlaceType, setCurrentPlaceType] = useState<string | null>(null);
  const [selectedPlaceForModal, setSelectedPlaceForModal] =
    useState<AutocompleteResult | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{
    coordinates: Coordinates | null;
  }>({ coordinates: null });

  const placeDetailModalRef = useRef<BottomSheetModal | null>(null);

  // RouteSelect에서 넘어올 때 검색창 자동 오픈
  // Route parameters 처리 - 검색 오버레이 열기
  useEffect(() => {
    if (route.params?.openSearchOverlay) {
      setShowSearchOverlay(true);
      setCurrentPlaceType(route.params.placeType ?? null);
    }
  }, [
    route.params?.openSearchOverlay,
    route.params?.placeType,
    setShowSearchOverlay,
  ]);

  const handleSearchbarPress = useCallback(() => {
    setShowSearchOverlay(true);
  }, [setShowSearchOverlay]);

  // 검색 닫기
  const handleSearchClose = useCallback(() => {
    setShowSearchOverlay(false);
  }, [setShowSearchOverlay]);

  const handlePlaceSelect = useCallback(
    (place: AutocompleteResult) => {
      // 검색 오버레이 닫기
      setShowSearchOverlay(false);

      // 지도에 마커 표시
      if (place.latitude && place.longitude) {
        showPlaceMarker(place.latitude, place.longitude, place.name, place);
      }

      // returnTo 파라미터가 있으면 해당 화면으로 이동
      const returnTo = route.params?.returnTo;
      if (returnTo) {
        if (returnTo === 'RouteSelect') {
          navigation.navigate('RouteSelect', {
            selectedPlace: place,
            placeType: currentPlaceType || 'auto',
          });
        } else if (returnTo === 'RouteRecommend') {
          navigation.navigate('RouteRecommend', {
            selectedPlace: place,
            placeType: currentPlaceType || 'start',
          });
        }
        setCurrentPlaceType(null);
        return;
      }

      // 이미 입력란이 하나라도 채워져 있으면 PlaceDetailModal 스킵하고 바로 RouteSelect로 이동
      if (hasAnyRouteData()) {
        navigation.navigate('RouteSelect', {
          selectedPlace: place,
          placeType: currentPlaceType || 'auto',
        });
        // placeType 초기화
        setCurrentPlaceType(null);
        return;
      }

      // 아무것도 채워져 있지 않으면 기존처럼 PlaceDetailModal 표시
      setSelectedPlaceForModal(place);
      placeDetailModalRef.current?.present();
    },
    [
      setShowSearchOverlay,
      showPlaceMarker,
      hasAnyRouteData,
      navigation,
      currentPlaceType,
      route.params?.returnTo,
    ],
  );

  const [searchText, setSearchText] = useState('');

  // 장소 상세 모달에서 "출발/도착/경유지로 설정" 눌렀을 때
  const [stationMetaData, setStationMetaData] =
    useState<MapAreaStationData | null>(null);
  const [myPosition, setMyPosition] = useState<Coordinates | undefined>(
    undefined,
  );

  const nearbyStationModalRef = useRef<BottomSheetModal | null>(null);
  const stationDetailModalRef = useRef<BottomSheetModal | null>(null);

  return {
    // 핵심 refs
    webRef,
    placeDetailModalRef,

    // Zustand store 상태 (필요시에만)
    showSearchOverlay,

    // 로컬 상태
    selectedPlaceForModal,
    setSelectedPlaceForModal,
    searchText,
    setSearchText,

    // 핸들러들
    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelect,

    // 기존 station 관련 (그대로 유지)
    nearbyStationModalRef,
    stationDetailModalRef,
    stationMetaData,
    setStationMetaData,
    myPosition,
    setMyPosition,
    currentLocation,
    setCurrentLocation,
  };
};
