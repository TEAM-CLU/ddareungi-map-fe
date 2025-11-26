// src/shared/stores/useModalStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

/**
 * ModalState
 *
 * - "생성"은 컴포넌트 / 컨트롤러에서 하고
 * - 이 스토어는 단지 ref와 상태를 "보관"만 한다.
 */

interface ModalState {
  /* -----------------------------
          모달 Ref 저장소
     - 실제 생성은 useMapController에서 하고
     - 여기는 단지 "참조"를 들고 있음
  ------------------------------ */

  placeDetailModalRef: React.RefObject<BottomSheetModal | null> | null;
  selectedRouteDetailModalRef: React.RefObject<BottomSheetModal | null> | null;
  nearbyStationModalRef: React.RefObject<BottomSheetModal | null> | null;
  stationDetailModalRef: React.RefObject<BottomSheetModal | null> | null;
  routeRecommendModalRef: React.RefObject<BottomSheetModal | null> | null;
  bookmarkModalRef: React.RefObject<BottomSheetModal | null> | null;
  /* -----------------------------
          모달 오픈 / 닫힘 상태
  ------------------------------ */
  showPlaceDetailModal: boolean;
  showSelectedRouteDetailModal: boolean;
  showNearByStationModal: boolean;
  showStationDetailModal: boolean;
  showRouteRecommendModal: boolean;
  showBookmarkModal: boolean;

  /* -----------------------------
                Actions
  ------------------------------ */

  /**
   * 모달 ref들을 한 번에 저장하기 위한 헬퍼
   * - useMapController에서 useRef로 생성 후 여기로 넘김
   */
  setModalRefs: (
    modalRefs: Partial<
      Pick<
        ModalState,
        | 'placeDetailModalRef'
        | 'selectedRouteDetailModalRef'
        | 'nearbyStationModalRef'
        | 'stationDetailModalRef'
        | 'routeRecommendModalRef'
        | 'bookmarkModalRef'
      >
    >,
  ) => void;

  /** 각 모달의 show/hide 토글 함수들 */
  setShowPlaceDetailModal: (isVisible: boolean) => void;
  setShowSelectedRouteDetailModal: (isVisible: boolean) => void;
  setShowNearByStationModal: (isVisible: boolean) => void;
  setShowStationDetailModal: (isVisible: boolean) => void;
  setShowRouteRecommendModal: (isVisible: boolean) => void;
  setShowBookmarkModal: (isVisible: boolean) => void;
}

export const useModalStore = create<ModalState>()(
  devtools(
    set => ({
      /* 모달 ref 초기값 (실제 생성은 useMapController) */
      placeDetailModalRef: null,
      selectedRouteDetailModalRef: null,
      nearbyStationModalRef: null,
      stationDetailModalRef: null,
      routeRecommendModalRef: null,
      bookmarkModalRef: null,

      /* 모달 오픈 여부 초기값 */
      showPlaceDetailModal: false,
      showSelectedRouteDetailModal: false,
      showNearByStationModal: false,
      showStationDetailModal: false,
      showRouteRecommendModal: false,
      showBookmarkModal: false,

      /* -----------------------------
                ACTION 구현부
      ------------------------------ */

      setModalRefs: modalRefs =>
        set(
          currentState => ({ ...currentState, ...modalRefs }),
          false,
          'modal/setModalRefs',
        ),

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
    }),
    { name: 'ModalStore' },
  ),
);
