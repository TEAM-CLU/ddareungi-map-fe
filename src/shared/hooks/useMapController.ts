import { RootStackParamList } from '@/app/types';
import { Coordinates } from '@/features/map/model/map.types';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import { useMapSearch } from '@/features/search/hooks/useMapSearch';
import { MapAreaStationData } from '@/features/station/model/station.types';
import { useRouteStore } from '@/features/routing/stores/routeStore';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useRef, useState, useEffect, useCallback } from 'react';
import WebView from 'react-native-webview';
import { StackNavigationProp } from '@react-navigation/stack';

/**
 * MapScreen 상태 및 이벤트를 통합 관리하는 훅
 */
export const useMapController = () => {
  // ---------- 기본 Refs 및 네비게이션 ----------
  const webRef = useRef<WebView | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();


  // ---------- 모달 Refs ----------
  const placeDetailModalRef = useRef<BottomSheetModal | null>(null);
  const selectedRouteDetailModalRef = useRef<BottomSheetModal | null>(null);
  const nearbyStationModalRef = useRef<BottomSheetModal | null>(null);
  const stationDetailModalRef = useRef<BottomSheetModal | null>(null);
  const routeRecommendModalRef = useRef<BottomSheetModal | null>(null);


  // ---------- 지도 검색 관련 훅 (마커 찍기 등) ----------
  const { showPlaceMarker } = useMapSearch(webRef);


  // ---------- Zustand store 상태 ----------
  const { 
    showSearchOverlay,
    setShowSearchOverlay,
    
    selectedRouteData,
    showSelectedRouteDetailModal,
    setShowSelectedRouteDetailModal,
    setNeedReset,

    hasAnyRouteData,
    resetAllData,
    distance,
    setDistance,
  } = useRouteStore();


  // ------------- 로컬 상태 -------------
  // 현재 검색이 어떤 목적(출발/도착/경유)인지 저장
  const [currentPlaceType, setCurrentPlaceType] = useState<string | null>(null);

  // 장소 상세 모달에 띄울 데이터
  const [selectedPlaceInfoForModal, setSelectedPlaceInfoForModal] =
    useState<AutocompleteResult | null>(null);

  const [searchText, setSearchText] = useState('');

  // 따릉이 대여소 관련 상태
  const [stationMetaData, setStationMetaData] =
    useState<MapAreaStationData | null>(null);

  const [myPosition, setMyPosition] = useState<Coordinates | undefined>(
    undefined,
  );

  
  // ----------- Effects --------------
  // 외부(RouteSelect)에서 진입 시 자동 검색 모드 활성화
  useEffect(() => {
    if (!route.params?.openSearchOverlay) return;

    setShowSearchOverlay(true);
    setCurrentPlaceType(route.params.placeType ?? null);

    navigation.setParams({
      openSearchOverlay: undefined,
    } as Partial<RootStackParamList['Map']>);
  }, [
    route.params?.openSearchOverlay,
    route.params?.placeType,
    setShowSearchOverlay,
    navigation,
  ]);

  // 선택된 경로 상세 모달 표시 제어
  // useEffect(() => {
  //   if (showSelectedRouteDetailModal && selectedRouteData) {
  //     selectedRouteDetailModalRef.current?.present();
  //   } else {
  //     selectedRouteDetailModalRef.current?.dismiss();
  //   }
  // }, [setShowSelectedRouteDetailModal, selectedRouteData]);

  useEffect(() => {
    if (showSelectedRouteDetailModal && selectedRouteData) {
      const timer = setTimeout(() => {
        selectedRouteDetailModalRef.current?.present();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      selectedRouteDetailModalRef.current?.dismiss();
    }
  }, [showSelectedRouteDetailModal, selectedRouteData]);

  // -------------- 이벤트 핸들러 --------------
  const handleSearchbarPress = useCallback(() => {
    resetAllData();
    setNeedReset(true);
    setShowSearchOverlay(true);
  }, [setShowSearchOverlay]);

  // 검색창 닫기
  const handleSearchClose = useCallback(() => {
    setShowSearchOverlay(false);
    setCurrentPlaceType(null);
  }, [setShowSearchOverlay]);

  /**
   * 검색 결과 리스트에서 장소를 선택했을 때의 로직
   * 1. RouteSelect에서 왔다면 -> 다시 RouteSelect로 데이터를 가지고 복귀
   * 2. 그냥 지도에서 검색했다면 -> 상세 모달 표시 or 경로 입력 화면으로 이동
   */
  const handlePlaceSelect = useCallback(
    (place: AutocompleteResult) => {
      // 1. 검색창 닫기
      setShowSearchOverlay(false);

      // 2. 지도 이동 및 마커 표시
      if (place.latitude && place.longitude) {
        showPlaceMarker(place.latitude, place.longitude, place.name, place);
      }

      // 3. 분기 처리: returnTo 파라미터가 있으면 해당 화면으로 이동
      const returnTo = route.params?.returnTo;

      if (returnTo) {
        // A. 경로 선택 화면으로 복귀
        if (returnTo === 'RouteSelect') {
          navigation.navigate('RouteSelect', {
            selectedPlace: place,
            placeType: currentPlaceType || 'auto',
          });
        }
        // B. 경로 추천 화면으로 복귀
        else if (returnTo === 'RouteRecommend') {
          navigation.navigate('RouteRecommend', {
            selectedPlace: place,
            placeType: currentPlaceType || 'start',
          });
        }

        navigation.setParams({
          returnTo: undefined,
          placeType: undefined,
        } as Partial<RootStackParamList['Map']>);
        setCurrentPlaceType(null);
        return;
      }

      // 4. 분기 처리: 이미 입력란이 하나라도 채워져 있으면 모달 스킵
      // (예: 출발지는 이미 있고, 검색 후 바로 도착지로 넣고 싶을 때 등)
      if (hasAnyRouteData()) {
        navigation.navigate('RouteSelect', {
          selectedPlace: place,
          placeType: currentPlaceType || 'auto',
        });
        setCurrentPlaceType(null);
        return;
      }

      // 5. 기본 동작: 장소 상세 모달 표시
      setSelectedPlaceInfoForModal(place);
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

  /* 주변 대여소 모달 클릭 */
  const handleOpenNearbyStationModal = useCallback(() => {
    nearbyStationModalRef.current?.present();
  }, []);

  /* 경로 추천 (거리 설정) 모달 클릭 */
  const handleOpenRouteRecommendModal = useCallback(() => {
    // distance가 null이면 기본값 5로 설정
    if (distance === null) {
      setDistance(5);
    }
    routeRecommendModalRef.current?.present();
  }, [distance, setDistance]);

  /* 
    * 선택된 경로 상세 모달 
    * 스와이프로 닫을 때 스토어 상태 동기화
  */
  const handleSelectedRouteDetailModalClose = useCallback(() => {
    setShowSelectedRouteDetailModal(false);
    navigation.goBack();
  }, [setShowSelectedRouteDetailModal, navigation]);

  /* 네비게이션 이동 버튼 클릭 */
  const handleStartNavigationPress = useCallback(() => {
    if (!selectedRouteData) return;
    setShowSelectedRouteDetailModal(false);
    setNeedReset(true);

    // 네비게이션 화면으로 이동 로직 추후 작성

  }, [navigation, selectedRouteData, setShowSelectedRouteDetailModal, setNeedReset]);

  return {
    // Refs
    webRef,
    navigation,

    placeDetailModalRef,
    nearbyStationModalRef,
    stationDetailModalRef,
    routeRecommendModalRef,
    selectedRouteDetailModalRef,

    // Zustand store 상태
    showSearchOverlay,
    selectedRouteData,

    // 로컬 상태
    selectedPlaceInfoForModal,
    setSelectedPlaceInfoForModal,
    searchText,
    setSearchText,

    // 핸들러들
    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelect,
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleSelectedRouteDetailModalClose,
    handleStartNavigationPress,

    // 기존 station 관련 (그대로 유지)
    stationMetaData,
    setStationMetaData,
    myPosition,
    setMyPosition,
  };
};
