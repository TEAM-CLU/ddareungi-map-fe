import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { WebViewMessageEvent } from 'react-native-webview';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useModalStore } from '../stores/useModalStore';
import { useAppNavigation } from './useAppNavigation';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useRoutingMessenger } from '@/features/routing/hooks/useRoutingMessenger';
import { MapReadyMessage } from '@/shared/model/map.webview.types';
import { useShallow } from 'zustand/shallow';
import Modal from 'react-native-modal';

/**
 * useMapOrchestrator
 *
 * MapScreen에서 사용하는 "전역 레벨 제어 로직"을 한 곳에 모은 컨트롤러 훅.
 *
 * 이 훅의 역할:
 * - WebView / BottomSheetModal 같은 ref를 생성하고 전역 store에 등록
 * - 모달의 show/hide 상태(boolean)는 store에서 읽고,
 *   실제 present/dismiss 호출은 이 훅에서만 수행
 * - 지도 관련 전역 navigation / ref를 mapStore에 주입
 * - 거리 값, 경로 추천 관련 라우팅 핸들러 제공
 */
export const useMapOrchestrator = () => {
  const [isLocalMapReady, setIsLocalMapReady] = useState(false);
  /** ----------------------------------------
   * 1. Navigation 객체 (화면 이동용)
   * ---------------------------------------- */
  const { navigation } = useAppNavigation();
  const { clearStaticPath } = useRoutingMessenger();

  /** ----------------------------------------
   * 2. 화면 내부에서만 생성하는 Ref들
   *    - 실제 useRef() 호출은 여기서만
   *    - store에는 "보관" 용도로만 넘긴다.
   * ---------------------------------------- */

  // BottomSheetModal refs (실제 인스턴스)
  const placeDetailModalLocalRef = useRef<BottomSheetModal | null>(null);
  const selectedRouteDetailModalLocalRef = useRef<BottomSheetModal | null>(
    null,
  );
  const nearbyStationModalLocalRef = useRef<BottomSheetModal | null>(null);
  const stationDetailModalLocalRef = useRef<BottomSheetModal | null>(null);
  const routeRecommendModalLocalRef = useRef<BottomSheetModal | null>(null);
  const bookmarkModalLocalRef = useRef<BottomSheetModal | null>(null);
  const navigationDetailModalLocalRef = useRef<BottomSheetModal | null>(null);
  // 네비게이션 시작/종료 모달
  const navigationStartModalLocalRef = useRef<Modal | null>(null);
  const navigationEndModalLocalRef = useRef<Modal | null>(null);

  /** ----------------------------------------
   * 3. 경로/거리 관련 상태 (routeStore)
   * ---------------------------------------- */
  const { distance, setDistance, prevScreen } = useRouteStore(
    useShallow(state => ({
      distance: state.distance,
      setDistance: state.setDistance,
      prevScreen: state.prevScreen,
    })),
  );

  /** ----------------------------------------
   * 4. 모달 show/hide 및 모달 ref 보관용 상태 (modalStore)
   *    - store는 "boolean + ref 저장소" 역할만 담당
   *    - 실제 present/dismiss는 이 훅에서 useEffect로 수행
   * ---------------------------------------- */
  const {
    showPlaceDetailModal,
    showNearByStationModal,
    setShowNearByStationModal,
    showSelectedRouteDetailModal,
    setShowSelectedRouteDetailModal,
    showStationDetailModal,
    showRouteRecommendModal,
    setShowRouteRecommendModal,
    showBookmarkModal,
    setShowBookmarkModal,
    setModalRefs,
    showNavigationDetailModal,
  } = useModalStore();

  /** ----------------------------------------
   * 5. 지도 전역 상태 (mapStore)
   *    - WebView ref / navigation 객체를 전역에서 재사용할 수 있도록 등록
   * ---------------------------------------- */
  const setGlobalNavigation = useMapStore(state => state.setGlobalNavigation);

  /** ----------------------------------------
   * 6. 초기 mount 시: ref & navigation을 전역 store에 한번만 등록
   *
   * - WebView ref: 지도 조작용 (줌, 이동 등 WebView postMessage)
   * - BottomSheetModal refs: GlobalModals에서 접근할 수 있도록 주입
   * - navigation: 모달 내부/웹뷰 메시지 핸들러에서도 화면 전환 가능하게 공유
   * ---------------------------------------- */
  useEffect(() => {
    // BottomSheetModal Ref 등록 (GlobalModals ↔ Screen 연결)
    setModalRefs({
      placeDetailModalRef: placeDetailModalLocalRef,
      selectedRouteDetailModalRef: selectedRouteDetailModalLocalRef,
      nearbyStationModalRef: nearbyStationModalLocalRef,
      stationDetailModalRef: stationDetailModalLocalRef,
      routeRecommendModalRef: routeRecommendModalLocalRef,
      bookmarkModalRef: bookmarkModalLocalRef,
      navigationDetailModalRef: navigationDetailModalLocalRef,
      navigationStartModalRef: navigationStartModalLocalRef,
      navigationEndModalRef: navigationEndModalLocalRef,
    });

    // 네비게이션 객체 전역 저장 (모달/웹뷰 이벤트에서도 navigate 가능)
    setGlobalNavigation(navigation);
  }, [navigation, setModalRefs, setGlobalNavigation]);

  /** ----------------------------------------
   * 7. 모달 boolean 상태를 구독하고 → 실제 present/dismiss 실행
   *
   * - store: "지금 이 모달이 열려 있어야 하는가?"만 관리 (boolean)
   * - controller: ref.current.present()/dismiss()를 실제로 호출
   * ---------------------------------------- */

  // 선택된 경로 상세 모달
  useEffect(() => {
    const modal = selectedRouteDetailModalLocalRef.current;
    if (!modal) return;
    showSelectedRouteDetailModal ? modal.present() : modal.dismiss();
  }, [showSelectedRouteDetailModal]);

  // 주변 대여소 모달
  useEffect(() => {
    const modal = nearbyStationModalLocalRef.current;
    if (!modal) return;
    showNearByStationModal ? modal.present() : modal.dismiss();
  }, [showNearByStationModal]);

  // 경로 추천 모달
  useEffect(() => {
    const modal = routeRecommendModalLocalRef.current;
    if (!modal) return;
    showRouteRecommendModal ? modal.present() : modal.dismiss();
  }, [showRouteRecommendModal]);

  // 대여소 상세 모달
  useEffect(() => {
    const modal = stationDetailModalLocalRef.current;
    if (!modal) return;
    showStationDetailModal ? modal.present() : modal.dismiss();
  }, [showStationDetailModal]);

  // 장소 상세 모달
  useEffect(() => {
    const modal = placeDetailModalLocalRef.current;
    if (!modal) return;
    showPlaceDetailModal ? modal.present() : modal.dismiss();
  }, [showPlaceDetailModal]);

  // 즐겨찾기 모달
  useEffect(() => {
    const modal = bookmarkModalLocalRef.current;
    if (!modal) return;
    showBookmarkModal ? modal.present() : modal.dismiss();
  }, [showBookmarkModal]);

  // 네비게이션 상세 모달
  useEffect(() => {
    const modal = navigationDetailModalLocalRef.current;
    if (!modal) return;
    // 네비게이션 상세 모달은 show 상태가 없으므로 항상 present/dismiss 하지 않음
    showNavigationDetailModal ? modal.present() : modal.dismiss();
  }, [showNavigationDetailModal]);

  /** ----------------------------------------
   * 8. 외부에서 사용할 이벤트 핸들러들
   *    - Screen/Component 쪽에서 이 함수들만 호출하면
   *      내부에서 모달 상태/거리/네비게이션이 알아서 연동된다.
   * ---------------------------------------- */

  /** 주변 대여소 모달 열기 */
  const handleOpenNearbyStationModal = useCallback(() => {
    setShowNearByStationModal(true);
  }, [setShowNearByStationModal]);

  /** 경로 추천 모달 열기 */
  const handleOpenRouteRecommendModal = useCallback(() => {
    // 최초 진입 시 distance가 비어 있으면 기본값 5km 설정
    if (distance === null) setDistance(5);
    setShowRouteRecommendModal(true);
  }, [distance, setDistance, setShowRouteRecommendModal]);

  /** 선택된 경로 상세 모달 닫기 + 경로 선택 화면으로 이동 */
  const handleSelectedRouteDetailModalClose = useCallback(() => {
    clearStaticPath();
    setShowSelectedRouteDetailModal(false);
    navigation.navigate(prevScreen ?? 'RouteSelect');
  }, [navigation, setShowSelectedRouteDetailModal, clearStaticPath]);

  // mapReady 메시지 전용 핸들러
  const handleMapReadyMessage = (event: WebViewMessageEvent) => {
    try {
      const data: MapReadyMessage = JSON.parse(event.nativeEvent.data);

      if (data.type === 'mapReady') {
        console.log('✅ 지도 준비 완료');
        setIsLocalMapReady(data.isReady);
      }
    } catch (error) {
      console.error('Invalid JSON from WebView:', event.nativeEvent.data);
    }
  };

  /* 즐겨찾기 모달 열기 */
  const handleOpenBookmarkModal = useCallback(() => {
    setShowBookmarkModal(true);
  }, [setShowBookmarkModal]);

  /** ----------------------------------------
   * 9. 외부로 노출할 핸들러 함수
   * ---------------------------------------- */
  return {
    // 이벤트 핸들러
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleSelectedRouteDetailModalClose,
    handleOpenBookmarkModal,
    handleMapReadyMessage,
    isLocalMapReady,
    setIsLocalMapReady,
  };
};
