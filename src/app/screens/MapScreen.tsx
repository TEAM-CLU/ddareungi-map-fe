import React from 'react';
import { View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import MyLocationButton from '@/features/location/components/MyLocationButton';
import StationMarkersToggleBtn from '@/features/station/components/StationMarkersToggleBtn';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import ReturnToRouteSelectButton from '@/features/map/components/ReturnToRouteSelectButton';
import { useModalStore } from '@/shared/stores/useModalStore';
import SelectedRouteDetailBadge from '@/features/routing/components/SelectedRouteDetailBadge';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { useMapOrchestrator } from '@/shared/hooks/useMapOrchestrator';
import { useSearchOrchestrator } from '@/features/search/hooks/useSearchOrchestrator';
import SearchBar from '@/features/search/components/SearchBar';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getCategoryText } from '@/shared/utils/formatting';

const MapScreen = () => {
  const {
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleSelectedRouteDetailModalClose,
    handleOpenBookmarkModal,
  } = useMapOrchestrator();

  const { showSelectedRouteDetailModal } = useModalStore();
  const { selectedRouteData } = useRouteStore();
  const { handleSearchbarPress, handleSearchClose, handlePlaceSelectionFlow } =
    useSearchOrchestrator();

  const formattedRouteCategory = getCategoryText(
    selectedRouteData?.routeCategory ?? '',
  );

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map />

      {showSelectedRouteDetailModal && selectedRouteData && (
        <View
          style={[
            tw(
              'absolute top-12 left-4 flex flex-row justify-start items-center',
            ),
            { zIndex: 10, gap: 8 },
          ]}
        >
          <ReturnToRouteSelectButton
            onPress={handleSelectedRouteDetailModalClose}
          />
          <SelectedRouteDetailBadge
            existText={formattedRouteCategory}
            textColor="#01DA86"
          />
          <SelectedRouteDetailBadge
            value={selectedRouteData.summary.time}
            textColor={'#414548'}
            type="time"
          />
          <SelectedRouteDetailBadge
            value={selectedRouteData.summary.distance}
            textColor={'#414548'}
            type={'distance'}
          />
        </View>
      )}

      {/* 검색 오버레이 */}
      {!showSelectedRouteDetailModal && (
        <SearchOverlay
          onPress={handleSearchbarPress}
          onClose={handleSearchClose}
          onPlaceSelect={handlePlaceSelectionFlow}
        />
      )}

      <View style={[tw('absolute right-3'), { bottom: 150 }]}>
        <MyLocationButton />
      </View>

      <View style={[tw('absolute right-3'), { bottom: 100 }]}>
        <StationMarkersToggleBtn />
      </View>

      <Footer
        setIsStationBtnPressed={handleOpenNearbyStationModal}
        setIsRouteRecommendBtnPressed={handleOpenRouteRecommendModal}
        setIsBookmarkBtnPressed={handleOpenBookmarkModal}
      />
    </View>
  );
};

export default MapScreen;
