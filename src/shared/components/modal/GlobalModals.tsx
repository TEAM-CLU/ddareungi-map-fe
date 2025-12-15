import RouteRecommendModal from '@/features/routing/components/recommend/RouteRecommendModal';
import RouteSelectedDetailModal from '@/features/routing/components/RouteSelectedDetailModal';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import StationDetailModal from '@/features/station/components/StationDetailModal';
import { useModalStore } from '@/shared/stores/useModalStore';
import SlideModal from './SlideModal';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import BookmarkModal from '@/shared/components/bookmark/BookmarkEditModal';

const GlobalModals = () => {
  const { start, end, waypoints, selectedRouteData } = useRouteStore();
  const {
    setShowNearByStationModal,
    setShowStationDetailModal,
    setShowRouteRecommendModal,
    setShowPlaceDetailModal,
    selectedRouteDetailModalRef,
    routeRecommendModalRef,
    nearbyStationModalRef,
    stationDetailModalRef,
    placeDetailModalRef,
    bookmarkModalRef,
    setShowBookmarkModal,
  } = useModalStore();

  const { selectedPlaceInfoForModal, setSelectedPlaceInfoForModal } =
    useSearchStore();

  return (
    <>
      {/* 선택된 경로 상세 모달 */}
      <SlideModal
        ref={selectedRouteDetailModalRef}
        snapPoints={['50%']}
        onDismiss={() => setShowRouteRecommendModal(false)}
        enablePanDownToClose={false}
      >
        <RouteSelectedDetailModal
          selectedRouteData={selectedRouteData}
          startAddress={start?.address || start?.name}
          endAddress={end?.address || end?.name}
          waypoints={waypoints}
        />
      </SlideModal>
      {/* 경로추천 모달 */}
      <SlideModal
        ref={routeRecommendModalRef}
        snapPoints={['45%', '49%']}
        initialIndex={1}
        onDismiss={() => setShowRouteRecommendModal(false)}
      >
        <RouteRecommendModal />
      </SlideModal>
      {/* Nearby 대여소 모달 */}
      <SlideModal
        ref={nearbyStationModalRef}
        snapPoints={['43%', '47%']}
        initialIndex={1}
        onDismiss={() => setShowNearByStationModal(false)}
      >
        <NearbyStationModal />
      </SlideModal>
      {/* 대여소 상세 모달 */}
      <SlideModal
        ref={stationDetailModalRef}
        snapPoints={['43%', '47%']}
        initialIndex={1}
        onDismiss={() => setShowStationDetailModal(false)}
      >
        <StationDetailModal onClose={() => setShowStationDetailModal(false)} />
      </SlideModal>
      {/* 장소 상세 모달 */}
      <SlideModal
        ref={placeDetailModalRef}
        onDismiss={() => setShowPlaceDetailModal(false)}
        snapPoints={['33%', '37%']}
        initialIndex={1}
        enablePanDownToClose={false}
      >
        <PlaceDetailModal
          place={selectedPlaceInfoForModal}
          onClose={() => setShowPlaceDetailModal(false)}
        />
      </SlideModal>
      {/* 즐겨찾기 모달 */}
      <SlideModal
        ref={bookmarkModalRef}
        snapPoints={['60%', '90%']}
        onDismiss={() => setShowBookmarkModal(false)}
        enablePanDownToClose={true}
        useFlexView={true}
      >
        <BookmarkModal />
      </SlideModal>
    </>
  );
};
export default GlobalModals;
