import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useCallback, useEffect } from 'react';
import { WebViewMessageEvent } from 'react-native-webview';
import { useModalStore } from '../stores/useModalStore';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useRoutingMessenger } from '@/features/routing/hooks/useRoutingMessenger';
import { MapReadyMessage } from '@/shared/model/map.webview.types';
import { useShallow } from 'zustand/react/shallow';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/types';
import { handleCatch } from '@/shared/utils/errorHandler';

/**
 * useMapOrchestrator
 *
 * MapScreen에서 사용하는 "전역 레벨 제어 로직"을 한 곳에 모은 컨트롤러 훅.
 *
 * 이 훅의 역할:
 * - 모달 open/close 제어 함수 제공
 * - 지도 관련 전역 navigation / ref를 mapStore에 주입
 * - 거리 값, 경로 추천 관련 라우팅 핸들러 제공
 */
interface UseMapOrchestratorParams {
  navigation: StackNavigationProp<RootStackParamList>;
}

export const useMapOrchestrator = ({
  navigation,
}: UseMapOrchestratorParams) => {
  const { clearStaticPath } = useRoutingMessenger();

  const { setIsMapReady, bumpMapReadyVersion } = useMapStore(
    useShallow(state => ({
      setIsMapReady: state.setIsMapReady,
      bumpMapReadyVersion: state.bumpMapReadyVersion,
    })),
  );

  /** ----------------------------------------
   * 2. 경로/거리 관련 상태 (routeStore)
   * ---------------------------------------- */
  const { distance, setDistance, prevScreen } = useRouteStore(
    useShallow(state => ({
      distance: state.distance,
      setDistance: state.setDistance,
      prevScreen: state.prevScreen,
    })),
  );

  /** ----------------------------------------
   * 3. 모달 show/hide 상태 (modalStore)
   * ---------------------------------------- */
  const {
    setShowNearByStationModal,
    setShowSelectedRouteDetailModal,
    setShowRouteRecommendModal,
    setShowBookmarkModal,
  } = useModalStore();

  /** ----------------------------------------
   * 4. 지도 전역 상태 (mapStore)
   *    - WebView ref / navigation 객체를 전역에서 재사용할 수 있도록 등록
   * ---------------------------------------- */
  const setGlobalNavigation = useMapStore(state => state.setGlobalNavigation);

  /** ----------------------------------------
   * 5. 초기 mount 시: navigation을 전역 store에 한번만 등록
   *
   * - navigation: 모달 내부/웹뷰 메시지 핸들러에서도 화면 전환 가능하게 공유
   * ---------------------------------------- */
  useEffect(() => {
    // 네비게이션 객체 전역 저장 (모달/웹뷰 이벤트에서도 navigate 가능)
    setGlobalNavigation(navigation);
  }, [navigation, setGlobalNavigation]);

  /** ----------------------------------------
   * 6. 외부에서 사용할 이벤트 핸들러들
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
  const handleCloseSelectedRouteDetailModal = useCallback(() => {
    clearStaticPath();
    setShowSelectedRouteDetailModal(false);
    navigation.navigate(prevScreen ?? 'RouteSelect');
  }, [navigation, setShowSelectedRouteDetailModal, clearStaticPath]);

  // mapReady 메시지 전용 핸들러
  const handleMapReadyMessage = (event: WebViewMessageEvent) => {
    try {
      const data: MapReadyMessage = JSON.parse(event.nativeEvent.data);

      if (data.type === 'mapReady') {
        setIsMapReady(data.isReady);
        console.log('✅ 지도 준비 완료');
        bumpMapReadyVersion();
      }
    } catch (error) {
      handleCatch(error, { mode: 'silent' });
    }
  };

  /* 즐겨찾기 모달 열기 */
  const handleOpenBookmarkModal = useCallback(() => {
    setShowBookmarkModal(true);
  }, [setShowBookmarkModal]);

  /** ----------------------------------------
   * 7. 외부로 노출할 핸들러 함수
   * ---------------------------------------- */
  return {
    // 이벤트 핸들러
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleCloseSelectedRouteDetailModal,
    handleOpenBookmarkModal,
    handleMapReadyMessage,
  };
};
