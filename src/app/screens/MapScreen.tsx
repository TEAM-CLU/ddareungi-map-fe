import React, { memo, useRef } from 'react';
import { View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import SlideModal from '@/shared/components/modal/SlideModal';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import SearchBar from '@/features/search/components/SearchBar';
import MyLocationButton from '@/features/location/components/MyLocationButton';
import StationDetailModal from '@/features/station/components/StationDetailModal';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import { useMapController } from '@/shared/hooks/useMapController';
import RouteRecommendModal from '@/features/routing/components/recommend/RouteRecommendModal';
import StationMarkersToggleBtn from '@/features/station/components/StationMarkersToggleBtn';
// import { useRoutePreviewOnMap } from '@/features/routing/hooks/useRoutePreviewOnMap';
import RouteSelectedDetailModal from '@/features/routing/components/RouteSelectedDetailModal';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import ReturnToRouteSelectButton from '@/features/map/components/ReturnToRouteSelectButton';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMapStore } from '@/features/map/stores/useMapStore';

const MapScreen = () => {
  const {
    showSearchOverlay,
    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelect,
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleSelectedRouteDetailModalClose,
  } = useMapController();

  const { showSelectedRouteDetailModal } = useModalStore();

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map />

      {showSelectedRouteDetailModal && (
        <View style={[tw('absolute top-12 left-4'), { zIndex: 10 }]}>
          <ReturnToRouteSelectButton
            onPress={handleSelectedRouteDetailModalClose}
          />
        </View>
      )}

      {/* 검색바 */}
      {!showSearchOverlay && !showSelectedRouteDetailModal && (
        <View
          style={[
            tw('absolute top-12 left-4 right-4 shadow-md'),
            { zIndex: 10 },
          ]}
        >
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="오늘은 어디로 갈까요?"
            onPress={handleSearchbarPress}
            readOnly={true}
          />
        </View>
      )}

      {/* 검색 오버레이 */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder="오늘은 어디로 갈까요?"
      />

      <View style={[tw('absolute right-3'), { bottom: 150 }]}>
        <MyLocationButton />
      </View>

      <View style={[tw('absolute right-3'), { bottom: 100 }]}>
        <StationMarkersToggleBtn />
      </View>

      <Footer
        setIsStationButtonPressed={handleOpenNearbyStationModal}
        setIsRouteRecommendBtnPressed={handleOpenRouteRecommendModal}
      />
    </View>
  );
};

export default MapScreen;
