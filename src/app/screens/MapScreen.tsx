import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import MyLocationButton from '@/features/map/components/MyLocationButton';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import SlideModal from '@/shared/components/modal/SlideModal';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import SearchBar from '@/features/search/components/SearchBar';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/index';
import { useMapController } from '../providers/map/useMapController';

const MapScreen = () => {
  const {
    webRef,
    showSearchOverlay,
    isPlaceModalVisible,
    routeType,
    selectedPlaceForModal,
    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelect,
    handlePlaceTypeConfirm,
    toggleRouteType,
    setPlaceModalVisible,
  } = useMapController();

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map webRef={webRef} />

      {/* 검색바 */}
      {!showSearchOverlay && (
        <View style={tw('absolute top-12 left-4 right-4 z-10')}>
          <TouchableOpacity onPress={handleSearchbarPress} activeOpacity={0.9}>
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="오늘은 어디로 갈까요?"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* 검색 오버레이 */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder="오늘은 어디로 갈까요?"
      />

      <View style={tw('absolute bottom-40 right-3')}>
        <MyLocationButton webRef={webRef} />
      </View>

      <Footer />

      {/* 장소 상세 모달 */}
      <SlideModal
        isVisible={isPlaceModalVisible}
        onClose={() => setPlaceModalVisible(false)}
        snapPoints={['25%']}
      >
        {selectedPlaceForModal && (
          <PlaceDetailModal
            place={selectedPlaceForModal}
            routeType={routeType}
            onSetAsStart={() => handlePlaceTypeConfirm('start')}
            onSetAsEnd={() => handlePlaceTypeConfirm('end')}
            onSetAsWaypoint={() => handlePlaceTypeConfirm('waypoint')}
            onToggleRouteType={toggleRouteType}
          />
        )}
      </SlideModal>
    </View>
  );
};

export default MapScreen;
