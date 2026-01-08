import { RootStackParamList } from '@/app/types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useAutocomplete } from '@/features/search/hooks/useAutocomplete';
import { useSearchMessenger } from '@/features/search/hooks/useSearchMessenger';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useBookmarkStore } from '@/features/bookmark/stores/useBookmarkStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useBookmarkMessenger } from '@/features/bookmark/hooks/useBookmarkMessenger';
import { PlaceInfo } from '../model/search.types';

/**
 * useSearchOrchestrator
 *
 * Map 화면 내부에서 발생하는 "검색 관련 모든 흐름"을 단일 훅으로 관리.
 * - 검색창 열기/닫기
 * - 자동완성 결과 선택 처리
 * - 선택된 장소의 지도 마커 표시 (WebView 메시지)
 * - RouteSelect / RouteRecommend 화면과의 데이터 연결
 * - 장소 상세 모달 열기
 *
 * 이 훅은 "검색 관련 UX 전체를 조율하는 오케스트레이터" 역할을 한다.
 */
export const useSearchOrchestrator = () => {
  /** ---------------------------
   * Navigation
   * --------------------------- */
  const { navigation } = useAppNavigation();

  /** ---------------------------
   * 검색 상태 (선택된 장소)
   * --------------------------- */
  const { setSelectedPlaceInfoForModal, setIsFocused, searchInputRef } =
    useSearchStore();

  /** 현재 검색의 목적 (출발/도착/경유 or auto) */
  const [currentPlaceType, setCurrentPlaceType] = useState<string | null>(null);

  /** ---------------------------
   * 모달 상태
   * --------------------------- */
  const {
    setShowPlaceDetailModal,
    setShowNearByStationModal,
    setShowRouteRecommendModal,
    setShowStationDetailModal,
  } = useModalStore();

  /** ---------------------------
   * WebView 메시지 (지도 마커, 위치 이동 등)
   * --------------------------- */
  const { showPlaceMarker, clearCurrentPlaceMarker } = useSearchMessenger();

  /** ---------------------------
   * 자동완성 상태 초기화
   * --------------------------- */
  const { clearSearch } = useAutocomplete();

  /** ---------------------------
   * 경로 상태 (출발/도착 중 하나라도 있는지)
   * --------------------------- */
  const { hasAnyRouteData, resetAllData } = useRouteStore();

  /** ---------------------------
   * 검색 오버레이 열기/닫기
   * --------------------------- */
  const { setShowSearchOverlay } = useSearchStore();

  /**
   * 북마크 데이터
   */
  const { bookmarks } = useBookmarkStore();

  const { showSingleBookmarkMarker } = useBookmarkMessenger();

  /**
   * 검색바 클릭
   * - 기존 경로정보 초기화
   * - 검색 오버레이 표시
   */
  const handleSearchbarPress = useCallback(() => {
    clearCurrentPlaceMarker();
    setSelectedPlaceInfoForModal(null);
    setShowPlaceDetailModal(false);
    setShowNearByStationModal(false);
    setShowRouteRecommendModal(false);
    setShowStationDetailModal(false);
    setShowSearchOverlay(true);
    setIsFocused(true);
    resetAllData();
  }, [
    resetAllData,
    setShowSearchOverlay,
    setIsFocused,
    clearCurrentPlaceMarker,
    setSelectedPlaceInfoForModal,
    setShowPlaceDetailModal,
    setShowNearByStationModal,
    setShowRouteRecommendModal,
    setShowStationDetailModal,
  ]);

  /**
   * 검색창 닫기
   * - 검색 오버레이 숨김
   * - 현재 placeType 초기화
   */
  const handleSearchClose = useCallback(() => {
    setShowSearchOverlay(false);
    setIsFocused(false);
    searchInputRef?.current?.blur();
    setCurrentPlaceType(null);
  }, [setShowSearchOverlay, setIsFocused, searchInputRef]);

  /** ---------------------------
   * 장소 선택 시 전체 흐름 처리
   *
   * 케이스 순서:
   * 1) 지도에 마커 찍기
   * 2) Map → (RouteSelect/RouteRecommend)로 복귀해야 하는 경우
   * 3) 이미 출발/도착 중 하나가 존재 → RouteSelect로 이동
   * 4) 그 외 → 장소 상세 모달 열기
   * --------------------------- */
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();

  const handlePlaceSelectionFlow = useCallback(
    (selectedPlace: PlaceInfo) => {
      // 검색 오버레이 닫기
      setShowSearchOverlay(false);
      setIsFocused(false);
      searchInputRef?.current?.blur();

      // 0) 해당 장소가 즐겨찾기인지 확인
      const foundBookmark = bookmarks.find(
        bookmark => bookmark.id === selectedPlace.placeId,
      );

      // 1) 즐겨찾기인 경우 즐겨찾기 마커 표시, 아닌 경우 일반 장소 마커 표시
      if (foundBookmark) {
        clearCurrentPlaceMarker();
        showSingleBookmarkMarker(foundBookmark);
      } else {
        if (selectedPlace.latitude && selectedPlace.longitude) {
          showPlaceMarker(
            selectedPlace.latitude,
            selectedPlace.longitude,
            selectedPlace.name,
            selectedPlace,
          );
        }
      }

      // 2) Map → RouteSelect/Recommend로 복귀해야 하는 경우
      const shouldReturn = route.params?.returnTo;
      if (shouldReturn) {
        navigation.navigate(shouldReturn, {
          selectedPlace,
          placeType: currentPlaceType || 'auto',
        });

        // 파라미터 재사용 방지
        navigation.setParams({
          returnTo: undefined,
          placeType: undefined,
        } as Partial<RootStackParamList['Map']>);

        setCurrentPlaceType(null);
        return;
      }

      // 3) 출발/도착 중 하나라도 이미 입력되어 있으므로 RouteSelect로 이동
      if (hasAnyRouteData()) {
        navigation.navigate('RouteSelect', {
          selectedPlace,
          placeType: currentPlaceType || 'auto',
        });

        setCurrentPlaceType(null);
        return;
      }

      // 4) 그 외 모든 경우 → 장소 상세 모달 열기
      setSelectedPlaceInfoForModal(selectedPlace);
      setShowPlaceDetailModal(true);
    },
    [
      route.params?.returnTo,
      currentPlaceType,
      navigation,
      hasAnyRouteData,
      setShowSearchOverlay,
      setSelectedPlaceInfoForModal,
      setShowPlaceDetailModal,
      showPlaceMarker,
      bookmarks,
      clearCurrentPlaceMarker,
      showSingleBookmarkMarker,
      setIsFocused,
      searchInputRef,
    ],
  );

  /** ---------------------------
   * RouteSelect → Map 복귀 시
   * 자동으로 검색창 열기
   * --------------------------- */
  useEffect(() => {
    if (!route.params?.openSearchOverlay) return;

    setShowSearchOverlay(true);
    setCurrentPlaceType(route.params.placeType ?? null);

    // 재사용 방지: 다음 렌더에서는 열리지 않도록 초기화
    navigation.setParams({
      openSearchOverlay: undefined,
    } as Partial<RootStackParamList['Map']>);
  }, [
    route.params?.openSearchOverlay,
    route.params?.placeType,
    navigation,
    setShowSearchOverlay,
  ]);

  /** ---------------------------
   * 외부에서 쓸 API
   * --------------------------- */
  return {
    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelectionFlow,
    clearSearch,
  };
};
