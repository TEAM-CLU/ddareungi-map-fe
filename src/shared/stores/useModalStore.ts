// src/shared/stores/useModalStore.ts
import { ModalState } from '@/shared/model/index.types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
      navigationDetailModalRef: null,
      navigationStartModalRef: null,
      navigationEndModalRef: null,

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
    }),
    { name: 'ModalStore' },
  ),
);
