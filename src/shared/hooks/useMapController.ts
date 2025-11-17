// src/shared/hooks/useMapController.ts
import { RootStackParamList } from '@/app/types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useMapSearch } from '@/features/search/hooks/useMapSearch';
import { useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import WebView from 'react-native-webview';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useModalStore } from '../stores/useModalStore';
import { useMyPositionStore } from '../stores/useMyPositionStore';
import { useAppNavigation } from './useAppNavigation';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { useStationStore } from '@/features/station/stores/useStationStore';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { AutocompleteResult } from '@/features/search/model/search.types';

/**
 * useMapController
 *
 * MapScreen에서 발생하는 모든 "상태/이벤트"를 단일 훅으로 통합 관리한다.
 *
 * 구성:
 * 1) Ref 생성 (WebView, Modal BottomSheet)
 * 2) zustand store에 필요한 ref / navigation 주입
 * 3) 지도 검색/선택/마커/모달/경로 선택 등 복잡한 흐름 제어
 * 4) 모달 present/dismiss 제어
 *
 * 역할 정리:
 * - 생성(useRef)은 반드시 여기서 한다 (store에는 저장만)
 * - show/hide 여부는 store에서 boolean만 관리
 * - 실제 모달 present/dismiss는 오직 이 곳에서만 실행
 * - 네비게이션은 useAppNavigation()을 통해 안전한 타입 기반 접근
 */
export const useMapController = () => {
  /** ----------------------------------------
   * 1. Navigation 객체 (화면 이동)
   * ---------------------------------------- */
  const { navigation } = useAppNavigation();

  /** ----------------------------------------
   * 2. 화면 내부에서 생성하는 Ref들
   *    - store에는 "보관"만 하고,
   *    - 실제 생성은 항상 이 컨트롤러에서만 수행
   * ---------------------------------------- */
  const webViewRef = useRef<WebView | null>(null);

  // 모든 BottomSheetModal Ref (전역 모달 제어용)
  const placeDetailModalLocalRef = useRef<BottomSheetModal | null>(null);
  const selectedRouteDetailModalLocalRef = useRef<BottomSheetModal | null>(
    null,
  );
  const nearbyStationModalLocalRef = useRef<BottomSheetModal | null>(null);
  const stationDetailModalLocalRef = useRef<BottomSheetModal | null>(null);
  const routeRecommendModalLocalRef = useRef<BottomSheetModal | null>(null);

  /** 현재 MapScreen의 route params */
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();

  /** WebView 기반 지도 조작을 위한 커스텀 함수 모음 */
  const { showPlaceMarker } = useMapSearch();

  /** ----------------------------------------
   * 3. routeStore (경로 선택 / 검색 오버레이 / 거리)
   * ---------------------------------------- */
  const {
    showSearchOverlay,
    setShowSearchOverlay,
    selectedRouteData,
    hasAnyRouteData,
    resetAllData,
    distance,
    setDistance,
  } = useRouteStore();

  /** ----------------------------------------
   * 4. modalStore (모달 show/hide와 모달 ref 보관)
   * ---------------------------------------- */
  const {
    showPlaceDetailModal,
    setShowPlaceDetailModal,
    showNearByStationModal,
    setShowNearByStationModal,
    showSelectedRouteDetailModal,
    setShowSelectedRouteDetailModal,
    showStationDetailModal,
    showRouteRecommendModal,
    setShowRouteRecommendModal,
    setModalRefs,
  } = useModalStore();

  /** ----------------------------------------
   * 5. 검색 상태 (장소 선택 정보, 검색 텍스트)
   * ---------------------------------------- */
  const { selectedPlaceInfoForModal, setSelectedPlaceInfoForModal } =
    useSearchStore();

  /** ----------------------------------------
   * 6. 대여소 상태 (선택된 스테이션 정보, lamda 값)
   * ---------------------------------------- */
  const { stationMetaData, setStationMetaData, lamda } = useStationStore();

  /** ----------------------------------------
   * 7. 지도 관련 전역 상태 (전역 navigation, webRef 저장용)
   * ---------------------------------------- */
  const { setWebRef, setGlobalNavigation } = useMapStore();

  /** ----------------------------------------
   * 8. 현재 위치 상태
   * ---------------------------------------- */

  /** ----------------------------------------
   * 9. MapScreen 내부 전용 local state
   *    - 출발지/도착지/경유지 구분용
   * ---------------------------------------- */
  const [currentPlaceType, setCurrentPlaceType] = useState<string | null>(null);

  /** ----------------------------------------
   * 10. 초기 mount 시 전역 store에 ref & nav 등록
   *
   * - store는 "생성"이 아니라 "저장소" 역할이므로
   *   useRef → 여기서 생성해서 store에 넘겨줘야 함
   * ---------------------------------------- */
  useEffect(() => {
    // WebView Ref (전역에서 지도 조작할 수 있도록)
    setWebRef(webViewRef);

    // BottomSheetModal Ref 등록 (GlobalModals와 연결됨)
    setModalRefs({
      placeDetailModalRef: placeDetailModalLocalRef,
      selectedRouteDetailModalRef: selectedRouteDetailModalLocalRef,
      nearbyStationModalRef: nearbyStationModalLocalRef,
      stationDetailModalRef: stationDetailModalLocalRef,
      routeRecommendModalRef: routeRecommendModalLocalRef,
    });

    // 네비게이션 객체 전역 저장 (모달 내부에서도 navigate 가능)
    setGlobalNavigation(navigation);
  }, [navigation, setWebRef, setModalRefs, setGlobalNavigation]);

  /** ----------------------------------------
   * 11. RouteSelect → Map 돌아왔을 때 자동 검색창 열기
   * ---------------------------------------- */
  useEffect(() => {
    if (!route.params?.openSearchOverlay) return;

    setShowSearchOverlay(true);
    setCurrentPlaceType(route.params.placeType ?? null);

    // 재사용 방지: 다음 렌더부터는 열리지 않도록 초기화
    navigation.setParams({
      openSearchOverlay: undefined,
    } as Partial<RootStackParamList['Map']>);
  }, [
    route.params?.openSearchOverlay,
    route.params?.placeType,
    navigation,
    setShowSearchOverlay,
  ]);

  /** ----------------------------------------
   * 12. 모달 상태 변경 감지 → 실제 present / dismiss 실행
   *
   * store는 boolean만 갖고 있고,
   * 모달의 생명주기 제어는 controller에서만 수행한다.
   * ---------------------------------------- */

  useEffect(() => {
    const modal = selectedRouteDetailModalLocalRef.current;
    if (!modal) return;
    showSelectedRouteDetailModal ? modal.present() : modal.dismiss();
  }, [showSelectedRouteDetailModal]);

  useEffect(() => {
    const modal = nearbyStationModalLocalRef.current;
    if (!modal) return;
    showNearByStationModal ? modal.present() : modal.dismiss();
  }, [showNearByStationModal]);

  useEffect(() => {
    const modal = routeRecommendModalLocalRef.current;
    if (!modal) return;
    showRouteRecommendModal ? modal.present() : modal.dismiss();
  }, [showRouteRecommendModal]);

  useEffect(() => {
    const modal = stationDetailModalLocalRef.current;
    if (!modal) return;
    showStationDetailModal ? modal.present() : modal.dismiss();
  }, [showStationDetailModal]);

  useEffect(() => {
    const modal = placeDetailModalLocalRef.current;
    if (!modal) return;
    showPlaceDetailModal ? modal.present() : modal.dismiss();
  }, [showPlaceDetailModal]);

  /** ----------------------------------------
   * 13. 이벤트 핸들러
   * ---------------------------------------- */

  /** 검색바 클릭 → 기존 경로 초기화 + 검색 오버레이 열기 */
  const handleSearchbarPress = useCallback(() => {
    resetAllData();
    setShowSearchOverlay(true);
  }, [resetAllData, setShowSearchOverlay]);

  /** 검색창 닫기 */
  const handleSearchClose = useCallback(() => {
    setShowSearchOverlay(false);
    setCurrentPlaceType(null);
  }, [setShowSearchOverlay]);

  /**
   * 장소 검색 후 선택 처리 흐름
   *
   * 케이스별 처리:
   * - returnTo 파라미터 존재 → RouteSelect or RouteRecommend로 복귀
   * - 기존 경로 데이터 존재 → RouteSelect로 이동
   * - 그 외 → 장소 상세 모달 오픈
   */
  const handlePlaceSelect = useCallback(
    (selectedPlace: AutocompleteResult) => {
      setShowSearchOverlay(false);

      // 지도에 마커 찍기
      if (selectedPlace.latitude && selectedPlace.longitude) {
        showPlaceMarker(
          selectedPlace.latitude,
          selectedPlace.longitude,
          selectedPlace.name,
          selectedPlace,
        );
      }

      // RouteSelect 또는 RouteRecommend로 바로 이동해야 하는 경우
      const shouldReturn = route.params?.returnTo;
      if (shouldReturn) {
        navigation.navigate(shouldReturn, {
          selectedPlace,
          placeType: currentPlaceType || 'auto',
        });

        navigation.setParams({
          returnTo: undefined,
          placeType: undefined,
        } as Partial<RootStackParamList['Map']>);

        setCurrentPlaceType(null);
        return;
      }

      // 이미 출발/도착 중 하나가 채워져 있으면 RouteSelect로 이동
      if (hasAnyRouteData()) {
        navigation.navigate('RouteSelect', {
          selectedPlace,
          placeType: currentPlaceType || 'auto',
        });
        setCurrentPlaceType(null);
        return;
      }

      // 아무 조건도 아니면 → 장소 상세 모달 열기
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
    ],
  );

  /** 주변 대여소 모달 열기 */
  const handleOpenNearbyStationModal = useCallback(() => {
    setShowNearByStationModal(true);
  }, [setShowNearByStationModal]);

  /** 경로 추천 모달 열기 */
  const handleOpenRouteRecommendModal = useCallback(() => {
    if (distance === null) setDistance(5);
    setShowRouteRecommendModal(true);
  }, [distance, setDistance, setShowRouteRecommendModal]);

  /** 선택된 경로 상세 모달 닫기 */
  const handleSelectedRouteDetailModalClose = useCallback(() => {
    setShowSelectedRouteDetailModal(false);
    navigation.navigate('RouteSelect');
  }, [navigation, setShowSelectedRouteDetailModal]);

  /** “안내 시작하기” 버튼 클릭 → 내부 상태 초기화 */
  const handleStartNavigationPress = useCallback(() => {
    if (!selectedRouteData) return;
    resetAllData();
  }, [selectedRouteData, resetAllData]);

  /** ----------------------------------------
   * 14. 외부에서 사용할 값만 반환
   * ---------------------------------------- */
  return {
    webViewRef,
    navigation,

    // 상태
    showSearchOverlay,
    selectedRouteData,
    selectedPlaceInfoForModal,
    stationMetaData,

    // 이벤트 핸들러
    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelect,
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleSelectedRouteDetailModalClose,
    handleStartNavigationPress,

    // setter 들
    setSelectedPlaceInfoForModal,
    setStationMetaData,
  };
};
