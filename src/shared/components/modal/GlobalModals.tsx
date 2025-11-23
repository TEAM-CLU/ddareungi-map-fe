import RouteRecommendModal from '@/features/routing/components/recommend/RouteRecommendModal';
import RouteSelectedDetailModal from '@/features/routing/components/RouteSelectedDetailModal';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import StationDetailModal from '@/features/station/components/StationDetailModal';
import { useModalStore } from '@/shared/stores/useModalStore';
import SlideModal from './SlideModal';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import NavigationDetailModal from '@/features/navigation/components/NavigationDetailModal';
import { useNavDetailModal } from '@/features/navigation/hooks/useNavDetailModal';
import { useNavDetailModalStore } from '@/features/navigation/stores/useNavDetailModalStore';
import { SetStateAction } from 'react';

const GlobalModals = () => {
  const { start, end, waypoints, selectedRouteData } = useRouteStore();
  const {
    setShowNearByStationModal,
    setShowStationDetailModal,
    setShowRouteRecommendModal,
    setShowPlaceDetailModal,
    setShowNavigationDetailModal,
    selectedRouteDetailModalRef,
    routeRecommendModalRef,
    nearbyStationModalRef,
    stationDetailModalRef,
    placeDetailModalRef,
    navigationDetailModalRef,
  } = useModalStore();

  const { selectedPlaceInfoForModal } = useSearchStore();

  const { soundRef, systemVolume, setSystemVolume, navVolume, setNavVolume } =
    useNavDetailModalStore();

  useNavDetailModal();

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
      {/* 네비게이션 디테일 모달 */}
      <SlideModal
        ref={navigationDetailModalRef}
        snapPoints={['43%', '47%']}
        initialIndex={1}
        onDismiss={() => setShowNavigationDetailModal(false)}
      >
        <NavigationDetailModal
          soundRef={soundRef}
          systemVolume={systemVolume}
          setSystemVolume={setSystemVolume}
          navVolume={navVolume}
          setNavVolume={setNavVolume}
        />
      </SlideModal>
    </>
  );
};
export default GlobalModals;
