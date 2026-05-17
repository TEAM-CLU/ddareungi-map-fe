import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalState {
  /* -----------------------------
          모달 오픈 / 닫힘 상태
  ------------------------------ */
  showPlaceDetailModal: boolean;
  showSelectedRouteDetailModal: boolean;
  showNearByStationModal: boolean;
  showStationDetailModal: boolean;
  showRouteRecommendModal: boolean;
  showBookmarkModal: boolean;
  showNavigationDetailModal: boolean;
  showNavigationStartModal: boolean;
  showNavigationEndModal: boolean;
  showNavigationFinishModal: boolean;

  /* -----------------------------
                Actions
  ------------------------------ */

  /** 각 모달의 show/hide 토글 함수들 */
  setShowPlaceDetailModal: (isVisible: boolean) => void;
  setShowSelectedRouteDetailModal: (isVisible: boolean) => void;
  setShowNearByStationModal: (isVisible: boolean) => void;
  setShowStationDetailModal: (isVisible: boolean) => void;
  setShowRouteRecommendModal: (isVisible: boolean) => void;
  setShowBookmarkModal: (isVisible: boolean) => void;
  setShowNavigationDetailModal: (isVisible: boolean) => void;
  setShowNavigationStartModal: (isVisible: boolean) => void;
  setShowNavigationEndModal: (isVisible: boolean) => void;
  setShowNavigationFinishModal: (isVisible: boolean) => void;
}
export const useModalStore = create<ModalState>()(
  devtools(
    set => ({
      /* 모달 오픈 여부 초기값 */
      showPlaceDetailModal: false,
      showSelectedRouteDetailModal: false,
      showNearByStationModal: false,
      showStationDetailModal: false,
      showRouteRecommendModal: false,
      showBookmarkModal: false,
      showNavigationDetailModal: false,
      showNavigationStartModal: false,
      showNavigationEndModal: false,
      showNavigationFinishModal: false,

      /* -----------------------------
                ACTION 구현부
      ------------------------------ */

      setShowPlaceDetailModal: isVisible =>
        set(
          { showPlaceDetailModal: isVisible },
          false,
          'modal/setShowPlaceDetailModal',
        ),

      setShowSelectedRouteDetailModal: isVisible =>
        set(
          { showSelectedRouteDetailModal: isVisible },
          false,
          'modal/setShowSelectedRouteDetailModal',
        ),

      setShowNearByStationModal: isVisible =>
        set(
          { showNearByStationModal: isVisible },
          false,
          'modal/setShowNearByStationModal',
        ),

      setShowStationDetailModal: isVisible =>
        set(
          { showStationDetailModal: isVisible },
          false,
          'modal/setShowStationDetailModal',
        ),

      setShowRouteRecommendModal: isVisible =>
        set(
          { showRouteRecommendModal: isVisible },
          false,
          'modal/setShowRouteRecommendModal',
        ),
      setShowBookmarkModal: isVisible =>
        set(
          { showBookmarkModal: isVisible },
          false,
          'modal/setShowBookmarkModal',
        ),
      setShowNavigationDetailModal: isVisible =>
        set(
          { showNavigationDetailModal: isVisible },
          false,
          'modal/setShowNavigationDetailModal',
        ),
      setShowNavigationStartModal: isVisible =>
        set(
          { showNavigationStartModal: isVisible },
          false,
          'modal/setShowNavigationStartModal',
        ),
      setShowNavigationEndModal: isVisible =>
        set(
          { showNavigationEndModal: isVisible },
          false,
          'modal/setShowNavigationEndModal',
        ),
      setShowNavigationFinishModal: isVisible =>
        set(
          { showNavigationFinishModal: isVisible },
          false,
          'modal/setShowNavigationFinishModal',
        ),
    }),
    { name: 'ModalStore' },
  ),
);
